'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { AdminModalFooter } from '@/components/admin/modal-footer';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { TypographyH3, TypographyH4, TypographyH6, TypographySmall, TypographyMuted, TypographyP } from '@/lib/typography';
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
  Target,
  Anchor,
  RotateCw,
  Crosshair,
  Calendar,
  Upload,
  X,
  Hash,
  Trash
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { getProxiedImageUrl } from '@/lib/r2-image-helper';

interface FishingTechnique {
  id: number;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  difficulty: string;
  icon: string | null;
  image_url: string | null;
  season: string | null;
  seasons: string[];
  status: string;
  best_for: string[] | null;
  equipment: string[] | null;
  tips: string[] | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedTechniques {
  items: FishingTechnique[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface TechniqueFormData {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  detailed_description: string;
  detailed_description_en: string;
  difficulty: string;
  icon: string;
  image_url: string;
  seasons: string[];
  tips_detailed: Array<{
    title: string;
    content: string;
    title_en: string;
    content_en: string;
  }>;
}

const initialFormData: TechniqueFormData = {
  name: '',
  name_en: '',
  description: '',
  description_en: '',
  detailed_description: '',
  detailed_description_en: '',
  difficulty: 'intermediate',
  icon: 'fish',
  image_url: '',
  seasons: [],
  tips_detailed: [],
};

// Season options
const seasonOptions = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
];

// Difficulty options
const difficulties = [
  'easy',
  'intermediate',
  'advanced'
];

const iconOptions = [
  { value: 'fish', label: 'Fish', icon: Fish },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'anchor', label: 'Anchor', icon: Anchor },
  { value: 'rotate-cw', label: 'Rotate', icon: RotateCw },
  { value: 'crosshair', label: 'Crosshair', icon: Crosshair },
  { value: 'calendar', label: 'Calendar', icon: Calendar },
];


export default function FishingTechniquesManagementPage() {
  const { t, locale } = useI18n();
  
  // Helper function to get localized name
  const getLocalizedName = (technique: any): string => {
    if (!technique) return '';
    if (locale === 'en') {
      return technique.name_en || technique.name || '';
    }
    return technique.name || '';
  };
  const [techniques, setTechniques] = useState<PaginatedTechniques | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  const [selectedTechnique, setSelectedTechnique] = useState<FishingTechnique | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TechniqueFormData>(initialFormData);

  const fetchTechniques = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(difficultyFilter !== 'all' && { difficulty: difficultyFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/fishing-techniques?${params}`);
      if (!response.ok) throw new Error(t('admin.fishingTechniques.errorLoading'));
      
      const data = await response.json();
      setTechniques({
        items: data.data || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 20,
        hasMore: data.pagination?.hasMore || false
      });
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechniques();
  }, [page, searchTerm, difficultyFilter, statusFilter]);

  const handleInputChange = (field: keyof TechniqueFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSeasonToggle = (season: string) => {
    setFormData(prev => {
      const currentSeasons = prev.seasons || [];
      if (currentSeasons.includes(season)) {
        return {
          ...prev,
          seasons: currentSeasons.filter(s => s !== season)
        };
      } else {
        return {
          ...prev,
          seasons: [...currentSeasons, season]
        };
      }
    });
  };

  const handleImageUpload = async (file: File): Promise<void> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('type', 'fishing-technique');
    uploadFormData.append('name', formData.name || 'technique');

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    handleInputChange('image_url', data.url);
  };

  const handleAddTechnique = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Türkçe teknik adı gerekli');
      return;
    }
    if (!formData.name_en.trim()) {
      toast.error('İngilizce teknik adı gerekli');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Türkçe açıklama gerekli');
      return;
    }
    if (!formData.description_en.trim()) {
      toast.error('İngilizce açıklama gerekli');
      return;
    }

    try {
      const response = await fetch('/api/admin/fishing-techniques', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          name_en: formData.name_en,
          description: formData.description,
          description_en: formData.description_en,
          detailed_description: formData.detailed_description,
          detailed_description_en: formData.detailed_description_en,
          difficulty: formData.difficulty,
          icon: formData.icon,
          image_url: formData.image_url,
          seasons: formData.seasons,
          tips_detailed: formData.tips_detailed,
        }),
      });

      if (!response.ok) throw new Error(t('admin.fishingTechniques.errorAdd'));

      setAddDialogOpen(false);
      setFormData(initialFormData);
      fetchTechniques();
      toast.success(t('admin.fishingTechniques.techniqueAdded'));
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleEditTechnique = async () => {
    if (!selectedTechnique) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Türkçe teknik adı gerekli');
      return;
    }
    if (!formData.name_en.trim()) {
      toast.error('İngilizce teknik adı gerekli');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Türkçe açıklama gerekli');
      return;
    }
    if (!formData.description_en.trim()) {
      toast.error('İngilizce açıklama gerekli');
      return;
    }

    try {
      // Send as JSON - image_url is already in formData from upload
      const response = await fetch(`/api/admin/fishing-techniques/${selectedTechnique.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          name_en: formData.name_en,
          description: formData.description,
          description_en: formData.description_en,
          detailed_description: formData.detailed_description,
          detailed_description_en: formData.detailed_description_en,
          difficulty: formData.difficulty,
          icon: formData.icon,
          image_url: formData.image_url,
          seasons: formData.seasons,
          tips_detailed: formData.tips_detailed,
          // Include the old image URL to check if it needs to be deleted
          old_image_url: selectedTechnique.image_url
        }),
      });

      if (!response.ok) throw new Error(t('admin.fishingTechniques.errorUpdate'));

      setEditDialogOpen(false);
      setSelectedTechnique(null);
      setFormData(initialFormData);
      fetchTechniques();
      toast.success(t('admin.fishingTechniques.techniqueUpdated'));
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteTechnique = async () => {
    if (!selectedTechnique) return;

    try {
      const response = await fetch(`/api/admin/fishing-techniques/${selectedTechnique.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(t('admin.fishingTechniques.errorDelete'));

      setDeleteDialogOpen(false);
      setSelectedTechnique(null);
      fetchTechniques();
      toast.success(t('admin.fishingTechniques.techniqueDeleted'));
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const openEditDialog = async (technique: FishingTechnique) => {
    setSelectedTechnique(technique);
    
    setFormData({
      name: technique.name,
      name_en: technique.name_en || '',
      description: technique.description || '',
      description_en: technique.description_en || '',
      detailed_description: technique.detailed_description || '',
      detailed_description_en: technique.detailed_description_en || '',
      difficulty: technique.difficulty || 'intermediate',
      icon: technique.icon || 'fish',
      image_url: technique.image_url || '',
      seasons: technique.seasons || [],
      tips_detailed: technique.tips_detailed || [],
    });
    setEditDialogOpen(true);
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={colors[difficulty] || 'bg-gray-100 text-gray-800'}>
        {difficulty ? t(`admin.fishingTechniques.difficultyLevels.${difficulty}`) : '-'}
      </Badge>
    );
  };

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    const IconComponent = icon?.icon || Fish;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="p-4 lg:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-6">
        
        <AdminPageHeader
          title={
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5" />
              {t('admin.fishingTechniques.title')}
            </div>
          }
          description={techniques ? t('admin.fishingTechniques.totalTechniques', { count: techniques.total.toString() }) : t('admin.fishingTechniques.loadingTechniques')}
          actions={
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.fishingTechniques.addNew')}
            </Button>
          }
        />

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('admin.fishingTechniques.filter')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">{t('admin.fishingTechniques.search')}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder={t('admin.fishingTechniques.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>{t('admin.fishingTechniques.difficulty')}</Label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.fishingTechniques.allDifficulties')}>
                      {difficultyFilter === 'all' 
                        ? t('admin.fishingTechniques.allDifficulties')
                        : difficultyFilter === 'easy'
                        ? t('admin.fishingTechniques.difficultyLevels.easy')
                        : difficultyFilter === 'intermediate'
                        ? t('admin.fishingTechniques.difficultyLevels.intermediate')
                        : difficultyFilter === 'advanced'
                        ? t('admin.fishingTechniques.difficultyLevels.advanced')
                        : t('admin.fishingTechniques.allDifficulties')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.fishingTechniques.allDifficulties')}</SelectItem>
                    <SelectItem value="easy">{t('admin.fishingTechniques.difficultyLevels.easy')}</SelectItem>
                    <SelectItem value="intermediate">{t('admin.fishingTechniques.difficultyLevels.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('admin.fishingTechniques.difficultyLevels.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('admin.fishingTechniques.status')}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.fishingTechniques.allStatus')}>
                      {statusFilter === 'all'
                        ? t('admin.fishingTechniques.allStatus')
                        : statusFilter === 'active'
                        ? t('admin.fishingTechniques.statusOptions.active')
                        : statusFilter === 'inactive'
                        ? t('admin.fishingTechniques.statusOptions.inactive')
                        : statusFilter === 'draft'
                        ? t('admin.fishingTechniques.statusOptions.draft')
                        : t('admin.fishingTechniques.allStatus')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.fishingTechniques.allStatus')}</SelectItem>
                    <SelectItem value="active">{t('admin.fishingTechniques.statusOptions.active')}</SelectItem>
                    <SelectItem value="inactive">{t('admin.fishingTechniques.statusOptions.inactive')}</SelectItem>
                    <SelectItem value="draft">{t('admin.fishingTechniques.statusOptions.draft')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.fishingTechniques.techniques')}</CardTitle>
            <CardDescription>
              {t('admin.fishingTechniques.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">{t('common.loading')}</div>
              </div>
            ) : techniques?.items.length === 0 ? (
              <div className="text-center py-8">
                <Fish className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-muted-foreground">{t('admin.fishingTechniques.noTechniquesFound')}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {techniques?.items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <TypographyH6 className="line-clamp-1 mb-1">{getLocalizedName(item)}</TypographyH6>
                        <div className="flex items-center gap-2 mt-1">
                          {getDifficultyBadge(item.difficulty)}
                          {item.status === 'inactive' && (
                            <Badge variant="destructive">{t('admin.fishingTechniques.statusOptions.inactive')}</Badge>
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
                          <DropdownMenuLabel>{t('admin.fishingTechniques.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTechnique(item);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('admin.fishingTechniques.viewDetails')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTechnique(item);
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

                    {item.image_url && (
                      <div className="mb-3">
                        <img
                          src={getProxiedImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}

                    <TypographySmall className="text-muted-foreground line-clamp-2 mb-3 block">
                      {locale === 'en' ? (item.description_en || item.description) : item.description}
                    </TypographySmall>

                    <div className="space-y-2">

                      {item.seasons && item.seasons.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {item.seasons.map((season, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {t(`admin.fishingTechniques.seasons.${season}`)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.best_for && item.best_for.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.best_for.slice(0, 2).map((fish, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {fish}
                            </Badge>
                          ))}
                          {item.best_for.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.best_for.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {techniques && techniques.total > 20 && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <TypographySmall className="text-muted-foreground">
                  {t('admin.fishingTechniques.page')} {techniques.page} - {t('admin.fishingTechniques.total')} {techniques.total} {t('admin.fishingTechniques.techniques')}
                </TypographySmall>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {t('admin.fishingTechniques.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!techniques.hasMore}
                  >
                    {t('admin.fishingTechniques.next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <TechniqueFormDialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setFormData(initialFormData);
          }}
          title={t('admin.fishingTechniques.addNew')}
          formData={formData}
          onFormDataChange={handleInputChange}
          onSubmit={handleAddTechnique}
          onImageUpload={handleImageUpload}
          onSeasonToggle={handleSeasonToggle}
        />

        <TechniqueFormDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setFormData(initialFormData);
          }}
          title={t('admin.fishingTechniques.editTechnique')}
          formData={formData}
          onFormDataChange={handleInputChange}
          onSubmit={handleEditTechnique}
          onImageUpload={handleImageUpload}
          onSeasonToggle={handleSeasonToggle}
        />

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                {t('admin.fishingTechniques.deleteTechnique')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.fishingTechniques.deleteConfirmation', { name: getLocalizedName(selectedTechnique) })}
              </DialogDescription>
            </DialogHeader>
            <AdminModalFooter
              onCancel={() => setDeleteDialogOpen(false)}
              onConfirm={handleDeleteTechnique}
              cancelText={t('common.cancel')}
              confirmText={t('common.delete')}
              confirmVariant="destructive"
            />
          </DialogContent>
        </Dialog>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fish className="h-5 w-5" />
                {t('admin.fishingTechniques.techniqueDetails')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedTechnique && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{t('admin.fishingTechniques.basicInfo')}</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>{t('admin.fishingTechniques.name')}:</strong> {selectedTechnique.name}</div>
                        <div><strong>{t('admin.fishingTechniques.nameEnglish')}:</strong> {selectedTechnique.name_en || '-'}</div>
                        <div><strong>{t('admin.fishingTechniques.difficulty')}:</strong> {getDifficultyBadge(selectedTechnique.difficulty)}</div>
                        <div><strong>{t('admin.fishingTechniques.status')}:</strong> {selectedTechnique.status === 'active' ? t('admin.fishingTechniques.statusOptions.active') : t('admin.fishingTechniques.statusOptions.inactive')}</div>
                        {selectedTechnique.seasons && selectedTechnique.seasons.length > 0 && (
                          <div>
                            <strong>{t('admin.fishingTechniques.seasons')}:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedTechnique.seasons.map((season, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {t(`admin.fishingTechniques.seasons.${season}`)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div>
                    {selectedTechnique.image_url && (
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">{t('admin.fishingTechniques.photo')}</h3>
                        <img
                          src={getProxiedImageUrl(selectedTechnique.image_url)}
                          alt={selectedTechnique.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('admin.fishingTechniques.description')}</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedTechnique.description || '-'}
                  </p>
                  {selectedTechnique.description_en && (
                    <>
                      <h3 className="font-semibold mb-2 mt-4">{t('admin.fishingTechniques.descriptionEnglish')}</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedTechnique.description_en}
                      </p>
                    </>
                  )}
                </div>

                {selectedTechnique.best_for && selectedTechnique.best_for.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('admin.fishingTechniques.bestFor')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTechnique.best_for.map((fish, index) => (
                        <Badge key={index} variant="outline">
                          {fish}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTechnique.equipment && selectedTechnique.equipment.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('admin.fishingTechniques.equipment')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTechnique.equipment.map((equip, index) => (
                        <Badge key={index} variant="secondary">
                          {equip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTechnique.tips && selectedTechnique.tips.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('admin.fishingTechniques.tips')}</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {selectedTechnique.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

interface TechniqueFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  formData: TechniqueFormData;
  onFormDataChange: (field: keyof TechniqueFormData, value: any) => void;
  onSubmit: () => void;
  onImageUpload: (file: File) => Promise<void>;
  onSeasonToggle?: (season: string) => void;
}

function TechniqueFormDialog({
  open,
  onClose,
  title,
  formData,
  onFormDataChange,
  onSubmit,
  onImageUpload,
  onSeasonToggle
}: TechniqueFormDialogProps) {
  const { t, locale } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Update preview when formData changes (for edit mode)
  useEffect(() => {
    if (formData.image_url) {
      setImagePreview(formData.image_url);
    } else {
      setImagePreview(null);
    }
  }, [formData.image_url]);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('admin.fishingTechniques.invalidFileType'));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('admin.fishingTechniques.fileTooLarge'));
        return;
      }
      
      setUploadingImage(true);
      try {
        await onImageUpload(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error(t('admin.fishingTechniques.uploadFailed'));
      } finally {
        setUploadingImage(false);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && onImageUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('admin.fishingTechniques.invalidFileType'));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('admin.fishingTechniques.fileTooLarge'));
        return;
      }
      
      setUploadingImage(true);
      try {
        await onImageUpload(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error(t('admin.fishingTechniques.uploadFailed'));
      } finally {
        setUploadingImage(false);
      }
    }
  };
  
  const handleRemoveImage = () => {
    setImagePreview(null);
    onFormDataChange('image_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleAddTip = () => {
    const newTip = { title: '', content: '', title_en: '', content_en: '' };
    onFormDataChange('tips_detailed', [...(formData.tips_detailed || []), newTip]);
  };

  const handleUpdateTip = (index: number, field: string, value: string) => {
    const updatedTips = [...(formData.tips_detailed || [])];
    updatedTips[index] = { ...updatedTips[index], [field]: value };
    onFormDataChange('tips_detailed', updatedTips);
  };

  const handleRemoveTip = (index: number) => {
    const updatedTips = (formData.tips_detailed || []).filter((_, i) => i !== index);
    onFormDataChange('tips_detailed', updatedTips);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="detailed">Detaylı Açıklama</TabsTrigger>
            <TabsTrigger value="tips">Teknik İpuçları</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('admin.fishingTechniques.form.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange('name', e.target.value)}
                placeholder={t('admin.fishingTechniques.form.namePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="name_en">{t('admin.fishingTechniques.form.nameEn')} *</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => onFormDataChange('name_en', e.target.value)}
                placeholder={t('admin.fishingTechniques.form.nameEnPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="description">{t('admin.fishingTechniques.form.description')} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFormDataChange('description', e.target.value)}
                placeholder={t('admin.fishingTechniques.form.descriptionPlaceholder')}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="description_en">{t('admin.fishingTechniques.form.descriptionEn')}</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => onFormDataChange('description_en', e.target.value)}
                placeholder={t('admin.fishingTechniques.form.descriptionEnPlaceholder')}
                rows={4}
              />
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label>{t('admin.fishingTechniques.form.difficulty')} *</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => onFormDataChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {t(`admin.fishingTechniques.difficultyLevels.${diff}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div>
              <Label>{t('admin.fishingTechniques.form.season')}</Label>
              <div className="space-y-3 mt-2">
                <Button
                  type="button"
                  variant={formData.seasons?.length === 0 ? "default" : "outline"}
                  className="w-full"
                  onClick={() => onFormDataChange('seasons', [])}
                >
                  Tüm Yıl
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  {seasonOptions.map((season) => (
                    <Button
                      key={season.value}
                      type="button"
                      variant={formData.seasons?.includes(season.value) ? "default" : "outline"}
                      className="w-full"
                      onClick={() => onSeasonToggle?.(season.value)}
                    >
                      {t(`admin.fishingTechniques.seasons.${season.value}`)}
                    </Button>
                  ))}
                </div>
                
                {formData.seasons && formData.seasons.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.seasons.map((season) => (
                      <Badge key={season} variant="secondary" className="text-xs">
                        {t(`admin.fishingTechniques.seasons.${season}`)}
                      </Badge>
                    ))}
                  </div>
                )}
                {formData.seasons?.length === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Tüm Yıl Boyunca
                  </Badge>
                )}
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <Label>{t('admin.fishingTechniques.photo')}</Label>
              <div className="space-y-4">
                {/* Image Upload Area */}
                <div
                  className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">{t('admin.fishingTechniques.uploading')}</p>
                    </div>
                  ) : imagePreview || formData.image_url ? (
                    <div className="relative">
                      <img 
                        src={imagePreview || getProxiedImageUrl(formData.image_url)} 
                        alt="Preview" 
                        className="w-full aspect-[4/3] mx-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">{t('admin.fishingTechniques.dragDropImage')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('admin.fishingTechniques.or')}</p>
                      <p className="text-sm text-primary font-medium mt-1">{t('admin.fishingTechniques.clickToUpload')}</p>
                      <p className="text-xs text-muted-foreground mt-2">{t('admin.fishingTechniques.supportedFormats')}</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

          </div>
        </div>
      </TabsContent>

      <TabsContent value="detailed">
        <div className="space-y-4">
          <div>
            <Label htmlFor="detailed_description">{t('admin.fishingTechniques.form.detailedDescription')} (Türkçe)</Label>
            <Textarea
              id="detailed_description"
              value={formData.detailed_description}
              onChange={(e) => onFormDataChange('detailed_description', e.target.value)}
              placeholder="Detaylı açıklama yazın..."
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Bu alan detail sayfasında detaylı bilgi olarak gösterilecek
            </p>
          </div>

          <div>
            <Label htmlFor="detailed_description_en">{t('admin.fishingTechniques.form.detailedDescriptionEn')} (English)</Label>
            <Textarea
              id="detailed_description_en"
              value={formData.detailed_description_en}
              onChange={(e) => onFormDataChange('detailed_description_en', e.target.value)}
              placeholder="Write detailed description in English..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="tips">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Teknik İpuçları</Label>
            <Button
              type="button"
              size="sm"
              onClick={handleAddTip}
            >
              <Plus className="h-4 w-4 mr-1" />
              İpucu Ekle
            </Button>
          </div>

          {formData.tips_detailed && formData.tips_detailed.length > 0 ? (
            <div className="space-y-4">
              {formData.tips_detailed.map((tip, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">İpucu #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTip(index)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Başlık (Türkçe)</Label>
                      <Input
                        value={tip.title}
                        onChange={(e) => handleUpdateTip(index, 'title', e.target.value)}
                        placeholder="Örn: Kadans Teknikleri"
                      />
                    </div>
                    <div>
                      <Label>Başlık (English)</Label>
                      <Input
                        value={tip.title_en}
                        onChange={(e) => handleUpdateTip(index, 'title_en', e.target.value)}
                        placeholder="e.g: Cadence Techniques"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>İçerik (Türkçe)</Label>
                    <Textarea
                      value={tip.content}
                      onChange={(e) => handleUpdateTip(index, 'content', e.target.value)}
                      placeholder="İpucu detaylarını yazın..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>İçerik (English)</Label>
                    <Textarea
                      value={tip.content_en}
                      onChange={(e) => handleUpdateTip(index, 'content_en', e.target.value)}
                      placeholder="Write tip details in English..."
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Henüz ipucu eklenmemiş</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTip}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                İlk İpucunu Ekle
              </Button>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>

        <AdminModalFooter
          onCancel={onClose}
          onConfirm={onSubmit}
          cancelText={t('common.cancel')}
          confirmText={t('common.save')}
          isConfirmDisabled={!formData.name || !formData.name_en || !formData.description || !formData.description_en}
        />
      </DialogContent>
    </Dialog>
  );
}