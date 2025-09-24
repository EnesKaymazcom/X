'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@fishivo/api/client/supabase.web'
import { getConservationStatusBadgeProps, getConservationStatusTooltip, getConservationStatusInfo, getAllConservationStatuses } from '@/lib/utils'
import { getHabitatType } from '@/lib/fish-habitats'
import { useI18n } from '@/lib/i18n';
import { getProxiedImageUrl } from '@/lib/r2-image-helper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime, sanitizeStringArray } from '@/lib/utils';
import { AdminModalFooter } from '@/components/admin/modal-footer';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { TypographyH6, TypographyMuted, TypographySmall, TypographyP } from '@/lib/typography';
import { AdminFilterSection } from '@/components/admin/admin-filter-section';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Fish,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  MapPin,
  Activity,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';

interface FishSpecies {
  id: string;
  common_name: string;             // İngilizce ana isim
  scientific_name: string;         // Bilimsel isim
  family: string;                  // Familya
  order?: string;                  // Takım
  conservation_status?: string;    // Koruma durumu
  habitats?: string[];             // Yaşam alanları
  max_length?: number;             // Maksimum boy (cm)
  max_weight?: number;             // Maksimum ağırlık (kg)
  min_depth?: number;              // Minimum derinlik (m)
  max_depth?: number;              // Maksimum derinlik (m)
  image_url?: string;              // Ana görsel
  common_names_tr?: string[];      // Türkçe isimler
  common_names_en?: string[];      // İngilizce isimler
  description_tr?: string;         // Türkçe açıklama
  description_en?: string;         // İngilizce açıklama
  feeding_types?: string[];        // Beslenme tipleri (çoklu)
  created_at: string;
  updated_at?: string;
}

interface PaginatedSpecies {
  data: FishSpecies[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SpeciesFormData {
  common_name: string;
  scientific_name: string;
  family: string;
  order: string;
  conservation_status: string;
  habitats: string[];
  max_length: string;
  max_weight: string;
  min_depth: string;
  max_depth: string;
  image_url: string;
  common_names_tr: string[];
  common_names_en: string[];
  description_tr: string;
  description_en: string;
  feeding_types: string[];
}

const initialFormData: SpeciesFormData = {
  common_name: '',
  scientific_name: '',
  family: '',
  order: '',
  conservation_status: '',
  habitats: [],
  max_length: '',
  max_weight: '',
  min_depth: '',
  max_depth: '',
  image_url: '',
  common_names_tr: [],
  common_names_en: [],
  description_tr: '',
  description_en: '',
  feeding_types: [],
};

// Fish Image Component with proper error handling
function FishImageCard({ imageUrl, altText }: { imageUrl?: string; altText: string }) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
      {imageUrl && !imageError ? (
        <img 
          src={getProxiedImageUrl(imageUrl)} 
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover z-10"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <Fish className="h-16 w-16 text-blue-400" />
        </div>
      )}
    </div>
  );
}

// Fish Hero Image Component for modal view
function FishHeroImage({ imageUrl, altText }: { imageUrl?: string; altText: string }) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="relative w-full h-[400px] lg:h-[500px]">
      {imageUrl && !imageError ? (
        <img
          src={getProxiedImageUrl(imageUrl)}
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover z-10"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <Fish className="h-24 w-24 text-blue-400" />
        </div>
      )}
    </div>
  );
}

export default function SpeciesManagementPage() {
  const { t, locale } = useI18n();
  const [species, setSpecies] = useState<PaginatedSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [habitatFilter, setHabitatFilter] = useState('all');
  const [conservationFilter, setConservationFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // Modal States
  const [selectedSpecies, setSelectedSpecies] = useState<FishSpecies | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SpeciesFormData>(initialFormData);
  
  // Image Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSpecies = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (searchTerm) params.append('search', searchTerm);
      if (habitatFilter !== 'all') params.append('habitat', habitatFilter);
      if (conservationFilter !== 'all') params.append('conservation_status', conservationFilter);
      
      const response = await fetch(`/api/admin/species?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch species');
      }
      
      const speciesData = await response.json();
      setSpecies(speciesData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecies();
  }, [page, searchTerm, habitatFilter, conservationFilter]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      // Handle nested objects like depth_range.min
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Tüm formu bir kerede yollamayağız
      // Sadece preview'u saklayıp, resmi form submit sırasında yükleyeceğiz
      setUploadingImage(false);
      toast.success(t('admin.species.imageReadyForUpload'));
    } catch (err: any) {
      console.error('Image preview error:', err);
      toast.error(err.message || t('admin.species.imagePreviewError'));
      setImagePreview(null);
      setUploadedImageUrl(null);
      setUploadingImage(false);
    }
  };
  
  const handleRemoveImage = async () => {
    // Clear local state
    setImagePreview(null);
    setUploadedImageUrl(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleAddSpecies = async () => {
    try {
      setIsSubmitting(true);
      // Input'ta kalan Türkçe ismi de ekle
      const turkishNameInput = document.getElementById('turkish-name-input') as HTMLInputElement;
      if (turkishNameInput && turkishNameInput.value) {
        const cleanedValue = sanitizeStringArray([turkishNameInput.value])[0];
        if (cleanedValue && !formData.common_names_tr.includes(cleanedValue)) {
          formData.common_names_tr.push(cleanedValue);
        }
      }
      
      // Input'ta kalan İngilizce ismi de ekle
      const englishNameInput = document.getElementById('english-name-input') as HTMLInputElement;
      if (englishNameInput && englishNameInput.value) {
        const cleanedValue = sanitizeStringArray([englishNameInput.value])[0];
        if (cleanedValue && !formData.common_names_en.includes(cleanedValue)) {
          formData.common_names_en.push(cleanedValue);
        }
      }
      
      // FormData oluştur
      const formDataToSend = new FormData();
      
      // Temel alanlar
      formDataToSend.append('common_name', formData.common_name);
      formDataToSend.append('scientific_name', formData.scientific_name);
      formDataToSend.append('family', formData.family);
      formDataToSend.append('order', formData.order || '');
      formDataToSend.append('conservation_status', formData.conservation_status || '');
      formDataToSend.append('habitats', JSON.stringify(formData.habitats));
      formDataToSend.append('max_length', formData.max_length || '0');
      formDataToSend.append('max_weight', formData.max_weight || '0');
      formDataToSend.append('min_depth', formData.min_depth || '0');
      formDataToSend.append('max_depth', formData.max_depth || '0');
      
      // Çoklu dil alanları - temizlenmiş array'ler
      formDataToSend.append('common_names_tr', JSON.stringify(sanitizeStringArray(formData.common_names_tr)));
      formDataToSend.append('common_names_en', JSON.stringify(sanitizeStringArray(formData.common_names_en)));
      formDataToSend.append('description_tr', formData.description_tr);
      formDataToSend.append('description_en', formData.description_en);
      formDataToSend.append('feeding_types', JSON.stringify(formData.feeding_types));

      // Resim dosyası varsa ekle
      if (imagePreview) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        formDataToSend.append('image', blob, 'species-image.jpg');
      }

      const response = await fetch('/api/admin/species', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Species creation failed:', error);
        throw new Error(error.error || 'Failed to create species');
      }
      
      toast.success(t('admin.species.createSuccess'));
      setAddDialogOpen(false);
      setFormData(initialFormData);
      setImagePreview(null);
      setUploadedImageUrl(null);
      fetchSpecies(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSpecies = async () => {
    if (!selectedSpecies) return;

    try {
      setIsSubmitting(true);
      // Input'ta kalan Türkçe ismi de ekle
      const turkishNameInput = document.getElementById('turkish-name-input') as HTMLInputElement;
      if (turkishNameInput && turkishNameInput.value) {
        const cleanedValue = sanitizeStringArray([turkishNameInput.value])[0];
        if (cleanedValue && !formData.common_names_tr.includes(cleanedValue)) {
          formData.common_names_tr.push(cleanedValue);
        }
      }
      
      // FormData oluştur
      const formDataToSend = new FormData();
      
      // Temel alanlar
      formDataToSend.append('common_name', formData.common_name);
      formDataToSend.append('scientific_name', formData.scientific_name);
      formDataToSend.append('family', formData.family);
      formDataToSend.append('order', formData.order || '');
      formDataToSend.append('conservation_status', formData.conservation_status || '');
      formDataToSend.append('habitats', JSON.stringify(formData.habitats));
      formDataToSend.append('max_length', formData.max_length || '0');
      formDataToSend.append('max_weight', formData.max_weight || '0');
      formDataToSend.append('min_depth', formData.min_depth || '0');
      formDataToSend.append('max_depth', formData.max_depth || '0');
      
      // Çoklu dil alanları - temizlenmiş array'ler
      formDataToSend.append('common_names_tr', JSON.stringify(sanitizeStringArray(formData.common_names_tr)));
      formDataToSend.append('common_names_en', JSON.stringify(sanitizeStringArray(formData.common_names_en)));
      formDataToSend.append('description_tr', formData.description_tr);
      formDataToSend.append('description_en', formData.description_en);
      formDataToSend.append('feeding_types', JSON.stringify(formData.feeding_types));

      // Resim dosyası varsa ekle
      if (imagePreview && !imagePreview.startsWith('http')) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        formDataToSend.append('image', blob, 'species-image.jpg');
      } else if (!imagePreview && !formData.image_url) {
        // Resim kaldırıldı
        formDataToSend.append('removeImage', 'true');
      }

      const response = await fetch(`/api/admin/species/${selectedSpecies.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update species');
      }
      
      toast.success(t('admin.species.updateSuccess'));
      setEditDialogOpen(false);
      setSelectedSpecies(null);
      setFormData(initialFormData);
      setImagePreview(null);
      setUploadedImageUrl(null);
      fetchSpecies(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpecies = async () => {
    if (!selectedSpecies) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/species/${selectedSpecies.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete species');
      }
      
      toast.success(t('admin.species.deleteSuccess'));
      setDeleteDialogOpen(false);
      setSelectedSpecies(null);
      fetchSpecies(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddDialog = () => {
    setSelectedSpecies(null);
    setFormData(initialFormData);
    setImagePreview(null);
    setUploadedImageUrl(null);
    setAddDialogOpen(true);
  };

  const openEditDialog = (species: FishSpecies) => {
    setSelectedSpecies(species);
    setFormData({
      common_name: species.common_name,
      scientific_name: species.scientific_name,
      family: species.family,
      order: species.order || '',
      conservation_status: species.conservation_status || '',
      habitats: species.habitats || [],
      max_length: species.max_length?.toString() || '',
      max_weight: species.max_weight?.toString() || '',
      min_depth: species.min_depth?.toString() || '',
      max_depth: species.max_depth?.toString() || '',
      image_url: species.image_url || '',
      common_names_tr: species.common_names_tr || [],
      common_names_en: species.common_names_en || [],
      description_tr: species.description_tr || '',
      description_en: species.description_en || '',
      feeding_types: species.feeding_types || [],
    });
    setImagePreview(species.image_url || null);
    setUploadedImageUrl(null);
    setEditDialogOpen(true);
  };

  const getHabitatBadge = (habitat: string) => {
    const habitatInfo = getHabitatType(habitat, locale);
    return (
      <Badge className={habitatInfo?.color || 'bg-gray-100 text-gray-800'}>
        {habitatInfo?.label || habitat}
      </Badge>
    );
  };

  // Helper function to get fish name based on locale
  const getFishDisplayName = (fish: FishSpecies): string => {
    if (locale === 'tr' && fish.common_names_tr && fish.common_names_tr.length > 0) {
      return fish.common_names_tr[0];
    }
    return fish.common_name;
  };

  return (
    <div className="p-4 lg:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <AdminPageHeader
          title={
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5" />
              {t('admin.species.title')}
            </div>
          }
          description={species ? `${species.pagination.total} ${t('admin.species.countLabel')}` : t('admin.species.loading')}
          actions={
            <Button onClick={openAddDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.species.addNew')}
            </Button>
          }
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <AdminFilterSection
          fields={[
            {
              id: 'search',
              label: t('admin.species.search'),
              type: 'search',
              placeholder: t('admin.species.searchPlaceholder'),
              value: searchTerm,
              onChange: setSearchTerm
            },
            {
              id: 'habitat',
              label: t('admin.species.habitat.label'),
              type: 'select',
              value: habitatFilter,
              onChange: setHabitatFilter,
              options: [
                { value: 'all', label: t('admin.species.habitat.all') },
                { value: 'freshwater', label: locale === 'tr' ? 'Tatlı Su' : 'Freshwater' },
                { value: 'brackish', label: locale === 'tr' ? 'Acı Su' : 'Brackish' },
                { value: 'pelagic-neritic', label: locale === 'tr' ? 'Pelajik-Neritik' : 'Pelagic-Neritic' },
                { value: 'reef-associated', label: locale === 'tr' ? 'Resif İlişkili' : 'Reef-associated' },
                { value: 'demersal', label: locale === 'tr' ? 'Demersal' : 'Demersal' }
              ]
            },
            {
              id: 'conservation',
              label: t('admin.species.conservation.label'),
              type: 'select',
              value: conservationFilter,
              onChange: setConservationFilter,
              options: [
                { value: 'all', label: t('admin.species.protected.all') },
                { value: 'LC', label: t('admin.species.protected.LC') },
                { value: 'NT', label: t('admin.species.protected.NT') },
                { value: 'VU', label: t('admin.species.protected.VU') },
                { value: 'EN', label: t('admin.species.protected.EN') },
                { value: 'CR', label: t('admin.species.protected.CR') },
                { value: 'EW', label: t('admin.species.protected.EW') },
                { value: 'EX', label: t('admin.species.protected.EX') },
                { value: 'DD', label: t('admin.species.protected.DD') },
                { value: 'NE', label: t('admin.species.protected.NE') }
              ]
            }
          ]}
          onFilter={fetchSpecies}
          loading={loading}
          showFilterButton={false}
        />

        {/* Species List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.species.listTitle')}</CardTitle>
            <CardDescription>
              {t('admin.species.listDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">{t('common.loading')}</div>
              </div>
            ) : species?.data.length === 0 ? (
              <div className="text-center py-8">
                <Fish className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-muted-foreground">{t('admin.species.noSpeciesFound')}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {species?.data.map((fish) => (
                    <div
                      key={fish.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Fish Image */}
                      <FishImageCard 
                        imageUrl={fish.image_url}
                        altText={fish.common_name}
                      />
                    
                      <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <TypographyH6>
                          {getFishDisplayName(fish)}
                        </TypographyH6>
                        <TypographyMuted className="italic">{fish.scientific_name}</TypographyMuted>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs font-semibold">
                            {fish.family}
                          </Badge>
                          {fish.conservation_status && (
                            <Badge 
                              {...getConservationStatusBadgeProps(fish.conservation_status, locale)}
                              className={`text-xs font-semibold ${getConservationStatusBadgeProps(fish.conservation_status, locale).className}`}
                            >
                              {getConservationStatusBadgeProps(fish.conservation_status, locale).children}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSpecies(fish);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('admin.species.viewDetails')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => openEditDialog(fish)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSpecies(fish);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {species && species.pagination.total > 20 && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <TypographySmall className="text-muted-foreground">
                  {t('admin.pagination.pageLabel')} {species.pagination.page} - {t('admin.species.totalLabel')} {species.pagination.total} {t('admin.species.speciesLabel')}
                </TypographySmall>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {t('common.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={species.pagination.page >= species.pagination.totalPages}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Species Form Component */}
        <SpeciesFormDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          title={t('admin.species.addNewTitle')}
          formData={formData}
          onFormDataChange={handleInputChange}
          onSubmit={handleAddSpecies}
          t={t}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
          imagePreview={imagePreview}
          onRemoveImage={handleRemoveImage}
          isSubmitting={isSubmitting}
        />

        <SpeciesFormDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          title={t('admin.species.editTitle')}
          formData={formData}
          onFormDataChange={handleInputChange}
          onSubmit={handleEditSpecies}
          t={t}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
          imagePreview={imagePreview}
          onRemoveImage={handleRemoveImage}
          isSubmitting={isSubmitting}
        />

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                {t('admin.species.deleteTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.species.deleteConfirm', { name: selectedSpecies ? getFishDisplayName(selectedSpecies) : '' })}
              </DialogDescription>
            </DialogHeader>
            <AdminModalFooter
              onCancel={() => setDeleteDialogOpen(false)}
              onConfirm={handleDeleteSpecies}
              cancelText={t('common.cancel')}
              confirmText={t('common.delete')}
              confirmVariant="destructive"
              isConfirmDisabled={isSubmitting}
              showSpinner={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
            <VisuallyHidden>
              <DialogTitle>{t('admin.species.detailsTitle')}</DialogTitle>
            </VisuallyHidden>
            {selectedSpecies && (
              <>
                {/* Hero Image Section */}
                <div className="relative">
                  <FishHeroImage 
                    imageUrl={selectedSpecies.image_url}
                    altText={selectedSpecies.common_name}
                  />
                  
                  {/* Overlay with Title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                      {getFishDisplayName(selectedSpecies)}
                    </h2>
                    <p className="text-xl lg:text-2xl italic opacity-90">{selectedSpecies.scientific_name}</p>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">{t('admin.species.family')}</div>
                      <div className="font-semibold">{selectedSpecies.family}</div>
                    </Card>
                    {selectedSpecies.order && (
                      <Card className="p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">{t('admin.species.order')}</div>
                        <div className="font-semibold">{selectedSpecies.order}</div>
                      </Card>
                    )}
                    {selectedSpecies.conservation_status && (
                      <Card className="p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">{t('admin.species.conservationStatus')}</div>
                        <Badge 
                          {...getConservationStatusBadgeProps(selectedSpecies.conservation_status, locale)}
                          className={`font-semibold ${getConservationStatusBadgeProps(selectedSpecies.conservation_status, locale).className}`}
                        >
                          {getConservationStatusBadgeProps(selectedSpecies.conservation_status, locale).children}
                        </Badge>
                      </Card>
                    )}
                    {selectedSpecies.habitats && selectedSpecies.habitats.length > 0 && (
                      <Card className="p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">{t('admin.species.habitat.label')}</div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {selectedSpecies.habitats.map((h, idx) => (
                            <span key={idx}>{getHabitatBadge(h)}</span>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                
                  {/* Names Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      {t('admin.species.names')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-2">{t('admin.species.commonNamesTr')}</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpecies.common_names_tr && selectedSpecies.common_names_tr.length > 0 ? (
                            selectedSpecies.common_names_tr.map((name, idx) => (
                              <Badge key={idx} variant="secondary">
                                {name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-2">{t('admin.species.englishName')}</div>
                        <div className="font-medium">{selectedSpecies.common_name}</div>
                      </Card>
                    </div>
                  </div>
                  
                  {/* Physical Characteristics */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      {t('admin.species.physicalCharacteristics')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {selectedSpecies.max_length && (
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">{t('admin.species.maxLength')}</div>
                              <div className="text-lg font-semibold">{selectedSpecies.max_length} cm</div>
                            </div>
                          </div>
                        </Card>
                      )}
                      {selectedSpecies.max_weight && (
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">{t('admin.species.maxWeight')}</div>
                              <div className="text-lg font-semibold">{selectedSpecies.max_weight} kg</div>
                            </div>
                          </div>
                        </Card>
                      )}
                      {(selectedSpecies.min_depth || selectedSpecies.max_depth) && (
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">{t('admin.species.depthRange')}</div>
                              <div className="text-lg font-semibold">{selectedSpecies.min_depth || '0'} - {selectedSpecies.max_depth || '?'} m</div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Information Tabs */}
                {selectedSpecies.description_tr && (
                  <div className="px-6 pb-6">
                    <div className="border-t pt-6">
                      <h3 className="text-xl font-semibold mb-4">{t('admin.species.detailedInfo')}</h3>
                      
                      <div className="space-y-6">
                        {selectedSpecies.description_tr && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Fish className="h-5 w-5 text-muted-foreground" />
                                {t('admin.species.description')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {selectedSpecies.description_tr}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Info */}
                <div className="px-6 pb-6">
                  <div className="border-t pt-4 flex flex-col sm:flex-row justify-between gap-2 text-sm text-muted-foreground">
                    <div>{t('common.created')}: {formatDateTime(selectedSpecies.created_at)}</div>
                    {selectedSpecies.updated_at && (
                      <div>{t('common.updated')}: {formatDateTime(selectedSpecies.updated_at)}</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

// Reusable Form Dialog Component
interface SpeciesFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  formData: SpeciesFormData;
  onFormDataChange: (field: string, value: any) => void;
  onSubmit: () => void;
  t: (key: string, options?: any) => string;
  onImageUpload?: (file: File) => void;
  uploadingImage?: boolean;
  imagePreview?: string | null;
  onRemoveImage?: () => void;
  isSubmitting?: boolean;
}

function SpeciesFormDialog({
  open,
  onClose,
  title,
  formData,
  onFormDataChange,
  onSubmit,
  t,
  onImageUpload,
  uploadingImage = false,
  imagePreview,
  onRemoveImage,
  isSubmitting: parentIsSubmitting = false
}: SpeciesFormDialogProps) {
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  // Helper function to get feeding type label
  const getFeedingTypeLabel = (type: string, locale: string): string => {
    const labels: Record<string, { tr: string; en: string }> = {
      herbivore: { tr: 'Otçul', en: 'Herbivore' },
      carnivore: { tr: 'Etçil', en: 'Carnivore' },
      omnivore: { tr: 'Hepçil', en: 'Omnivore' },
      piscivore: { tr: 'Balıkçıl', en: 'Piscivore' },
      planktivore: { tr: 'Planktonçul', en: 'Planktivore' },
      detritivore: { tr: 'Çürükçül', en: 'Detritivore' },
      benthivore: { tr: 'Dipçil', en: 'Benthivore' }
    };
    return labels[type]?.[locale === 'tr' ? 'tr' : 'en'] || type;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { locale } = useI18n();
  
  // Use parent state or local state
  const isSubmitting = parentIsSubmitting || localIsSubmitting;
  
  // Handle form submit with local state
  const handleSubmit = async () => {
    setLocalIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setLocalIsSubmitting(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('admin.species.invalidFileType'));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('admin.species.fileTooLarge'));
        return;
      }
      
      onImageUpload(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && onImageUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('admin.species.invalidFileType'));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('admin.species.fileTooLarge'));
        return;
      }
      
      onImageUpload(file);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="common_name">{t('admin.species.englishName')} *</Label>
              <Input
                id="common_name"
                value={formData.common_name}
                onChange={(e) => onFormDataChange('common_name', e.target.value)}
                placeholder="European Sea Bass"
              />
            </div>

            <div>
              <Label>{t('admin.species.commonNamesEn')}</Label>
              <div className="space-y-2">
                <Input
                  id="english-name-input"
                  placeholder={t('admin.species.englishNamesPlaceholder')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value;
                      const cleanedValue = sanitizeStringArray([value])[0];
                      if (cleanedValue && !formData.common_names_en.includes(cleanedValue)) {
                        onFormDataChange('common_names_en', [...formData.common_names_en, cleanedValue]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    const cleanedValue = sanitizeStringArray([value])[0];
                    if (cleanedValue && !formData.common_names_en.includes(cleanedValue)) {
                      onFormDataChange('common_names_en', [...formData.common_names_en, cleanedValue]);
                      e.target.value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.common_names_en.map((name, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" 
                      onClick={() => onFormDataChange('common_names_en', formData.common_names_en.filter((_, i) => i !== idx))}>
                      {name} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Label>{t('admin.species.commonNamesTr')}</Label>
              <div className="space-y-2">
                <Input
                  id="turkish-name-input"
                  placeholder={t('admin.species.turkishNamesPlaceholder')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value;
                      const cleanedValue = sanitizeStringArray([value])[0];
                      if (cleanedValue && !formData.common_names_tr.includes(cleanedValue)) {
                        onFormDataChange('common_names_tr', [...formData.common_names_tr, cleanedValue]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    const cleanedValue = sanitizeStringArray([value])[0];
                    if (cleanedValue && !formData.common_names_tr.includes(cleanedValue)) {
                      onFormDataChange('common_names_tr', [...formData.common_names_tr, cleanedValue]);
                      e.target.value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.common_names_tr.map((name, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" 
                      onClick={() => onFormDataChange('common_names_tr', formData.common_names_tr.filter((_, i) => i !== idx))}>
                      {name} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="scientific_name">{t('admin.species.scientificName')} *</Label>
              <Input
                id="scientific_name"
                value={formData.scientific_name}
                onChange={(e) => onFormDataChange('scientific_name', e.target.value)}
                placeholder="Dicentrarchus labrax"
              />
            </div>

            <div>
              <Label htmlFor="family">{t('admin.species.family')} *</Label>
              <Input
                id="family"
                value={formData.family}
                onChange={(e) => onFormDataChange('family', e.target.value)}
                placeholder="Moronidae"
              />
            </div>
            
            <div>
              <Label htmlFor="order">{t('admin.species.order')}</Label>
              <Input
                id="order"
                value={formData.order}
                onChange={(e) => onFormDataChange('order', e.target.value)}
                placeholder="Perciformes"
              />
            </div>

            <div>
              <Label>{t('admin.species.habitat.label')}</Label>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    if (value && !formData.habitats.includes(value)) {
                      onFormDataChange('habitats', [...formData.habitats, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'tr' ? 'Habitat Seç' : 'Select Habitat'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{locale === 'tr' ? 'Tatlı Su Habitatları' : 'Freshwater Habitats'}</SelectLabel>
                      <SelectItem value="freshwater">{locale === 'tr' ? 'Tatlı Su (Genel)' : 'Freshwater (General)'}</SelectItem>
                      <SelectItem value="river">{locale === 'tr' ? 'Nehir' : 'River'}</SelectItem>
                      <SelectItem value="lake">{locale === 'tr' ? 'Göl' : 'Lake'}</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>{locale === 'tr' ? 'Geçiş Bölgeleri' : 'Transition Zones'}</SelectLabel>
                      <SelectItem value="brackish">{locale === 'tr' ? 'Acı Su' : 'Brackish'}</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>{locale === 'tr' ? 'Deniz Habitatları' : 'Marine Habitats'}</SelectLabel>
                      <SelectItem value="reef-associated">{locale === 'tr' ? 'Resif İlişkili' : 'Reef-associated'}</SelectItem>
                      <SelectItem value="pelagic-neritic">{locale === 'tr' ? 'Pelajik-Neritik' : 'Pelagic-Neritic'}</SelectItem>
                      <SelectItem value="pelagic-oceanic">{locale === 'tr' ? 'Pelajik-Okyanus' : 'Pelagic-Oceanic'}</SelectItem>
                      <SelectItem value="epipelagic">{locale === 'tr' ? 'Epipelajik (0-200m)' : 'Epipelagic (0-200m)'}</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>{locale === 'tr' ? 'Derin Su Habitatları' : 'Deep Water Habitats'}</SelectLabel>
                      <SelectItem value="benthopelagic">{locale === 'tr' ? 'Bentopelajik' : 'Benthopelagic'}</SelectItem>
                      <SelectItem value="demersal">{locale === 'tr' ? 'Demersal (<200m)' : 'Demersal (<200m)'}</SelectItem>
                      <SelectItem value="bathydemersal">{locale === 'tr' ? 'Batidemersal (>200m)' : 'Bathydemersal (>200m)'}</SelectItem>
                      <SelectItem value="bathypelagic">{locale === 'tr' ? 'Batipelajik (1000-4000m)' : 'Bathypelagic (1000-4000m)'}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {formData.habitats.map((h, idx) => {
                    const habitatInfo = getHabitatType(h, locale);
                    return (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className={`cursor-pointer ${habitatInfo?.color || ''}`}
                        onClick={() => onFormDataChange('habitats', formData.habitats.filter((_, i) => i !== idx))}
                      >
                        {habitatInfo?.label || h} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="conservation_status">{t('admin.species.conservationStatus')}</Label>
              <Select
                value={formData.conservation_status}
                onValueChange={(value) => onFormDataChange('conservation_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.species.selectConservationStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {getAllConservationStatuses().map((status) => (
                    <SelectItem key={status.code} value={status.code}>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {status.code} - {status.label[locale]}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{locale === 'tr' ? 'Beslenme Tipleri' : 'Feeding Types'}</Label>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    if (value && !formData.feeding_types.includes(value)) {
                      onFormDataChange('feeding_types', [...formData.feeding_types, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'tr' ? 'Beslenme Tipi Seç' : 'Select Feeding Type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="herbivore">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">H</Badge>
                        {locale === 'tr' ? 'Otçul (Bitkiler)' : 'Herbivore (Plants)'}
                      </span>
                    </SelectItem>
                    <SelectItem value="carnivore">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">C</Badge>
                        {locale === 'tr' ? 'Etçil (Et)' : 'Carnivore (Meat)'}
                      </span>
                    </SelectItem>
                    <SelectItem value="omnivore">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">O</Badge>
                        {locale === 'tr' ? 'Hepçil (Karışık)' : 'Omnivore (Mixed)'}
                      </span>
                    </SelectItem>
                    <SelectItem value="piscivore">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">P</Badge>
                        {locale === 'tr' ? 'Balıkçıl (Balıklar)' : 'Piscivore (Fish)'}
                      </span>
                    </SelectItem>
                    <SelectItem value="planktivore">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-cyan-100 text-cyan-800">PL</Badge>
                        {locale === 'tr' ? 'Planktonçul (Plankton)' : 'Planktivore (Plankton)'}
                      </span>
                    </SelectItem>
                    <SelectItem value="detritivore">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-800">D</Badge>
                        {locale === 'tr' ? 'Çürükçül (Organik Atık)' : 'Detritivore (Detritus)'}
                      </span>
                    </SelectItem>
                    <SelectItem value="benthivore">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-indigo-100 text-indigo-800">B</Badge>
                        {locale === 'tr' ? 'Dipçil (Dip Canlıları)' : 'Benthivore (Bottom dwellers)'}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {formData.feeding_types.map((ft, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => onFormDataChange('feeding_types', formData.feeding_types.filter((_, i) => i !== idx))}
                    >
                      {getFeedingTypeLabel(ft, locale)} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>{t('admin.species.photo')}</Label>
              <div className="space-y-4">
                {/* Image Upload Area */}
                <div
                  className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  
                  {uploadingImage ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
                      <p className="text-sm text-gray-600">{t('admin.species.uploadingImage')}</p>
                    </div>
                  ) : imagePreview || formData.image_url ? (
                    <div className="relative">
                      <img
                        src={imagePreview || getProxiedImageUrl(formData.image_url)}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      {onRemoveImage && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveImage();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {t('admin.species.dragDropImage')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('admin.species.maxFileSize')}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* URL Input as Alternative */}
                <div>
                  <Label htmlFor="image_url" className="text-sm">
                    {t('admin.species.orUseUrl')}
                  </Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => onFormDataChange('image_url', e.target.value)}
                    placeholder={t('admin.species.photoUrlPlaceholder')}
                    disabled={uploadingImage}
                    readOnly={!!imagePreview}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="max_length">{t('admin.species.maxLength')} (cm)</Label>
                <Input
                  id="max_length"
                  type="number"
                  value={formData.max_length}
                  onChange={(e) => onFormDataChange('max_length', e.target.value)}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="max_weight">{t('admin.species.maxWeight')} (kg)</Label>
                <Input
                  id="max_weight"
                  type="number"
                  step="0.1"
                  value={formData.max_weight}
                  onChange={(e) => onFormDataChange('max_weight', e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min_depth">{t('admin.species.minDepth')} (m)</Label>
                <Input
                  id="min_depth"
                  type="number"
                  value={formData.min_depth}
                  onChange={(e) => onFormDataChange('min_depth', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="max_depth">{t('admin.species.maxDepth')} (m)</Label>
                <Input
                  id="max_depth"
                  type="number"
                  value={formData.max_depth}
                  onChange={(e) => onFormDataChange('max_depth', e.target.value)}
                  placeholder="200"
                />
              </div>
            </div>




            <div>
              <Label htmlFor="description_tr">Açıklama (Türkçe)</Label>
              <Textarea
                id="description_tr"
                value={formData.description_tr}
                onChange={(e) => onFormDataChange('description_tr', e.target.value)}
                placeholder="Balık hakkında genel bilgi..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => onFormDataChange('description_en', e.target.value)}
                placeholder="General information about the fish..."
                rows={4}
              />
            </div>

          </div>
        </div>

        <AdminModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          cancelText={t('common.cancel')}
          confirmText={t('common.save')}
          isConfirmDisabled={!formData.common_name || !formData.scientific_name || !formData.family || isSubmitting}
          showSpinner={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}