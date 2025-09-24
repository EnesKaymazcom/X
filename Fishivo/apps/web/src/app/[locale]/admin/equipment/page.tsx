'use client';

import { useState, useEffect } from 'react';
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
  Package,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Star,
  DollarSign,
  Tag
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface Equipment {
  id: number;
  name: string;
  description: string;
  brand: string;
  category: string;
  model: string;
  price_min?: number;
  price_max?: number;
  image_url?: string;
  features: string[];
  specifications: Record<string, any>;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginatedEquipment {
  items: Equipment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface EquipmentFormData {
  name: string;
  description: string;
  brand: string;
  category: string;
  model: string;
  price_min: string;
  price_max: string;
  image_url: string;
  features: string;
  specifications: string;
  is_featured: boolean;
  is_active: boolean;
}

const initialFormData: EquipmentFormData = {
  name: '',
  description: '',
  brand: '',
  category: '',
  model: '',
  price_min: '',
  price_max: '',
  image_url: '',
  features: '',
  specifications: '',
  is_featured: false,
  is_active: true,
};

export default function EquipmentManagementPage() {
  const { t, locale } = useI18n();
  const [equipment, setEquipment] = useState<PaginatedEquipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // Modal States
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EquipmentFormData>(initialFormData);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(brandFilter !== 'all' && { brand: brandFilter }),
      });

      const response = await fetch(`/api/admin/equipment?${params}`);
      if (!response.ok) throw new Error(t('adminPages.equipment.errorLoading'));
      
      const data = await response.json();
      setEquipment({
        items: data.data || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 20
      });
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [page, searchTerm, categoryFilter, brandFilter]);

  const handleInputChange = (field: keyof EquipmentFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddEquipment = async () => {
    try {
      const response = await fetch('/api/admin/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price_min: formData.price_min ? parseFloat(formData.price_min) : null,
          price_max: formData.price_max ? parseFloat(formData.price_max) : null,
          features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
          specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
        }),
      });

      if (!response.ok) throw new Error(t('adminPages.equipment.errorAdd'));

      setAddDialogOpen(false);
      setFormData(initialFormData);
      fetchEquipment();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      const response = await fetch(`/api/admin/equipment/${selectedEquipment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price_min: formData.price_min ? parseFloat(formData.price_min) : null,
          price_max: formData.price_max ? parseFloat(formData.price_max) : null,
          features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
          specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
        }),
      });

      if (!response.ok) throw new Error(t('adminPages.equipment.errorUpdate'));

      setEditDialogOpen(false);
      setSelectedEquipment(null);
      setFormData(initialFormData);
      fetchEquipment();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      const response = await fetch(`/api/admin/equipment/${selectedEquipment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(t('adminPages.equipment.errorDelete'));

      setDeleteDialogOpen(false);
      setSelectedEquipment(null);
      fetchEquipment();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditDialog = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setFormData({
      name: eq.name,
      description: eq.description,
      brand: eq.brand,
      category: eq.category,
      model: eq.model,
      price_min: eq.price_min?.toString() || '',
      price_max: eq.price_max?.toString() || '',
      image_url: eq.image_url || '',
      features: eq.features.join(', '),
      specifications: JSON.stringify(eq.specifications, null, 2),
      is_featured: eq.is_featured,
      is_active: eq.is_active,
    });
    setEditDialogOpen(true);
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'rod': 'bg-blue-100 text-blue-800',
      'reel': 'bg-green-100 text-green-800',
      'line': 'bg-purple-100 text-purple-800',
      'hook': 'bg-orange-100 text-orange-800',
      'bait': 'bg-red-100 text-red-800',
      'tackle': 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return t('adminPages.equipment.noPriceInfo');
    if (min && max) return `${t('currency.symbol')}${min} - ${t('currency.symbol')}${max}`;
    if (min) return `${t('currency.symbol')}${min}+`;
    if (max) return t('adminPages.equipment.upToPrice', { price: max });
    return '';
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <AdminPageHeader
          title={
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('adminPages.equipment.title')}
            </div>
          }
          description={equipment ? t('adminPages.equipment.totalEquipment', { count: equipment.total }) : t('adminPages.equipment.loadingEquipment')}
          actions={
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('adminPages.equipment.addNew')}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('admin.logs.filter')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">{t('admin.searchPlaceholder')}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder={t('adminPages.equipment.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>{t('adminPages.equipment.table.category')}</Label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">{t('adminPages.equipment.allCategories')}</option>
                  <option value="rod">{t('adminPages.equipment.rods')}</option>
                  <option value="reel">{t('adminPages.equipment.reels')}</option>
                  <option value="line">{t('adminPages.equipment.lines')}</option>
                  <option value="hook">{t('adminPages.equipment.hooks')}</option>
                  <option value="bait">{t('adminPages.equipment.lures')}</option>
                  <option value="tackle">{t('adminPages.equipment.accessories')}</option>
                </select>
              </div>

              <div>
                <Label>{t('adminPages.equipment.table.brand')}</Label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">{t('adminPages.equipment.allBrands')}</option>
                  <option value="shimano">{t('equipment.brands.shimano')}</option>
                  <option value="daiwa">{t('equipment.brands.daiwa')}</option>
                  <option value="penn">{t('equipment.brands.penn')}</option>
                  <option value="abu-garcia">{t('equipment.brands.abuGarcia')}</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={fetchEquipment} 
                  disabled={loading}
                  className="w-full"
                >
                  {t('admin.logs.filter')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('navigation.equipment')}</CardTitle>
            <CardDescription>
              {t('adminPages.equipment.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">{t('common.loading')}</div>
              </div>
            ) : equipment?.items.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-muted-foreground">{t('adminPages.equipment.noEquipmentFound')}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment?.items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TypographyH6 className="line-clamp-1">{item.name}</TypographyH6>
                          {item.is_featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">{t('adminPages.equipment.featured')}</Badge>
                          )}
                        </div>
                        <TypographySmall className="text-muted-foreground">{item.brand} - {item.model}</TypographySmall>
                        <div className="flex items-center gap-2 mt-1">
                          {getCategoryBadge(item.category)}
                          {!item.is_active && (
                            <Badge variant="destructive">{t('adminPages.equipment.inactive')}</Badge>
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
                          <DropdownMenuLabel>{t('admin.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEquipment(item);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('admin.viewDetails')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEquipment(item);
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
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}

                    <TypographyP className="text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </TypographyP>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatPrice(item.price_min, item.price_max)}</span>
                      </div>

                      {item.reviews_count > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(item.rating)}
                          </div>
                          <TypographySmall className="text-muted-foreground">
                            ({item.reviews_count} {t('adminPages.equipment.reviews')})
                          </TypographySmall>
                        </div>
                      )}

                      {item.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.features.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {item.features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.features.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {equipment && equipment.total > 20 && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <TypographySmall className="text-muted-foreground">
                  {t('admin.page')} {equipment.page} - {t('admin.total')} {equipment.total} {t('adminPages.equipment.equipment')}
                </TypographySmall>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {t('admin.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!equipment.hasMore}
                  >
                    {t('admin.next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment Form Component */}
        <EquipmentFormDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          title={t('adminPages.equipment.addNew')}
          formData={formData}
          onFormDataChange={handleInputChange}
          onSubmit={handleAddEquipment}
        />

        <EquipmentFormDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          title={t('adminPages.equipment.editEquipment')}
          formData={formData}
          onFormDataChange={handleInputChange}
          onSubmit={handleEditEquipment}
        />

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                {t('adminPages.equipment.deleteEquipment')}
              </DialogTitle>
              <DialogDescription>
                {t('adminPages.equipment.deleteConfirmation', { name: selectedEquipment?.name })}
              </DialogDescription>
            </DialogHeader>
            <AdminModalFooter
              onCancel={() => setDeleteDialogOpen(false)}
              onConfirm={handleDeleteEquipment}
              cancelText={t('common.cancel')}
              confirmText={t('common.delete')}
              confirmVariant="destructive"
            />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('adminPages.equipment.equipmentDetails')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedEquipment && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{t('adminPages.equipment.basicInfo')}</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>{t('adminPages.equipment.table.name')}:</strong> {selectedEquipment.name}</div>
                        <div><strong>{t('adminPages.equipment.table.brand')}:</strong> {selectedEquipment.brand}</div>
                        <div><strong>{t('adminPages.equipment.table.model')}:</strong> {selectedEquipment.model}</div>
                        <div><strong>{t('adminPages.equipment.table.category')}:</strong> {getCategoryBadge(selectedEquipment.category)}</div>
                        <div><strong>{t('adminPages.equipment.table.price')}:</strong> {formatPrice(selectedEquipment.price_min, selectedEquipment.price_max)}</div>
                        <div><strong>{t('adminPages.equipment.table.status')}:</strong> {selectedEquipment.is_active ? t('admin.active') : t('adminPages.equipment.inactive')}</div>
                        {selectedEquipment.is_featured && (
                          <div><strong>{t('adminPages.equipment.featured')}:</strong> {t('common.yes')}</div>
                        )}
                      </div>
                    </div>

                    {selectedEquipment.reviews_count > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('adminPages.equipment.rating')}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(selectedEquipment.rating)}
                          </div>
                          <TypographySmall className="text-muted-foreground">
                            {selectedEquipment.rating.toFixed(1)} ({selectedEquipment.reviews_count} {t('adminPages.equipment.reviews')})
                          </TypographySmall>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {selectedEquipment.image_url && (
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">{t('adminPages.equipment.productPhoto')}</h3>
                        <img
                          src={selectedEquipment.image_url}
                          alt={selectedEquipment.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('adminPages.equipment.form.description')}</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedEquipment.description}
                  </p>
                </div>

                {selectedEquipment.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('adminPages.equipment.features')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEquipment.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(selectedEquipment.specifications).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('adminPages.equipment.form.specifications')}</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      ))}
                    </div>
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

// Reusable Form Dialog Component
interface EquipmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  formData: EquipmentFormData;
  onFormDataChange: (field: keyof EquipmentFormData, value: string | boolean) => void;
  onSubmit: () => void;
}

function EquipmentFormDialog({
  open,
  onClose,
  title,
  formData,
  onFormDataChange,
  onSubmit
}: EquipmentFormDialogProps) {
  const { t } = useI18n();
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('adminPages.equipment.form.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange('name', e.target.value)}
                placeholder={t('admin.equipment.form.namePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="brand">{t('adminPages.equipment.form.brand')} *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => onFormDataChange('brand', e.target.value)}
                placeholder={t('admin.equipment.form.brandPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="model">{t('adminPages.equipment.form.model')}</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => onFormDataChange('model', e.target.value)}
                placeholder={t('admin.equipment.form.modelPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="category">{t('adminPages.equipment.form.category')} *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => onFormDataChange('category', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{t('adminPages.equipment.form.selectCategory')}</option>
                <option value="rod">{t('adminPages.equipment.rods')}</option>
                <option value="reel">{t('adminPages.equipment.reels')}</option>
                <option value="line">{t('adminPages.equipment.lines')}</option>
                <option value="hook">{t('adminPages.equipment.hooks')}</option>
                <option value="bait">{t('adminPages.equipment.lures')}</option>
                <option value="tackle">{t('adminPages.equipment.accessories')}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="image_url">{t('adminPages.equipment.form.imageUrl')}</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => onFormDataChange('image_url', e.target.value)}
                placeholder="https://example.com/product.jpg"
              />
            </div>

            <div>
              <Label htmlFor="features">{t('adminPages.equipment.form.features')}</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => onFormDataChange('features', e.target.value)}
                placeholder={t('admin.equipment.form.featuresPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price_min">{t('adminPages.equipment.form.minPrice')}</Label>
                <Input
                  id="price_min"
                  type="number"
                  value={formData.price_min}
                  onChange={(e) => onFormDataChange('price_min', e.target.value)}
                  placeholder="299"
                />
              </div>
              <div>
                <Label htmlFor="price_max">{t('adminPages.equipment.form.maxPrice')}</Label>
                <Input
                  id="price_max"
                  type="number"
                  value={formData.price_max}
                  onChange={(e) => onFormDataChange('price_max', e.target.value)}
                  placeholder="599"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">{t('adminPages.equipment.form.description')} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFormDataChange('description', e.target.value)}
                placeholder={t('admin.equipment.form.descriptionPlaceholder')}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="specifications">{t('adminPages.equipment.form.specifications')}</Label>
              <Textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) => onFormDataChange('specifications', e.target.value)}
                placeholder={t('admin.equipment.form.specificationsPlaceholder')}
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => onFormDataChange('is_featured', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_featured">{t('adminPages.equipment.form.isFeatured')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => onFormDataChange('is_active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">{t('adminPages.equipment.form.isActive')}</Label>
              </div>
            </div>
          </div>
        </div>

        <AdminModalFooter
          onCancel={onClose}
          onConfirm={onSubmit}
          cancelText={t('common.cancel')}
          confirmText={t('common.save')}
          isConfirmDisabled={!formData.name || !formData.brand || !formData.category || !formData.description}
        />
      </DialogContent>
    </Dialog>
  );
}