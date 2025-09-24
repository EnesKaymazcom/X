'use client';

import { useState, useEffect } from 'react';
import { spotsServiceWeb } from '@fishivo/api/services/spots/spots.web';
import { useI18n } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { AdminModalFooter } from '@/components/admin/modal-footer';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminFilterSection } from '@/components/admin/admin-filter-section';
import { TypographyH6, TypographyMuted, TypographySmall, TypographyP } from '@/lib/typography';
import { 
  MapPin,
  MoreHorizontal,
  Trash2,
  Eye,
  AlertTriangle,
  Calendar,
  User,
  Fish,
  Star,
  CheckCircle,
  XCircle,
  Navigation,
  Anchor,
  Gauge,
  Ruler,
  SquareStack
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

import type { Spot, PaginatedSpots } from '@fishivo/types/models/spot';

export default function SpotsManagementPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [spots, setSpots] = useState<PaginatedSpots | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // Modal States
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const fetchSpots = async () => {
    try {
      setLoading(true);
      
      const data = await spotsServiceWeb.getAdminSpots(page, 20, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        spot_type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined,
      });
      
      setSpots(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || t('admin.spots.loadError'));
      toast.error(t('admin.spots.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, [page, searchTerm, statusFilter, typeFilter]);

  const handleApproveSpot = async () => {
    if (!selectedSpot) return;

    try {
      await spotsServiceWeb.approveSpot(selectedSpot.id, adminNotes);
      
      setApproveDialogOpen(false);
      setAdminNotes('');
      setSelectedSpot(null);
      fetchSpots();
      toast.success(t('admin.spots.spotApproved'));
    } catch (err: any) {
      toast.error(t('admin.spots.approveError'));
    }
  };

  const handleRejectSpot = async () => {
    if (!selectedSpot || !rejectReason.trim()) return;

    try {
      await spotsServiceWeb.rejectSpot(selectedSpot.id, rejectReason);
      
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedSpot(null);
      fetchSpots();
      toast.success(t('admin.spots.spotRejected'));
    } catch (err: any) {
      toast.error(t('admin.spots.rejectError'));
    }
  };

  const handleDeleteSpot = async () => {
    if (!selectedSpot) return;

    try {
      await spotsServiceWeb.deleteSpot(selectedSpot.id, deleteReason);
      
      setDeleteDialogOpen(false);
      setDeleteReason('');
      setSelectedSpot(null);
      fetchSpots();
      toast.success(t('admin.spots.spotDeleted'));
    } catch (err: any) {
      toast.error(t('admin.spots.deleteError'));
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">{t('admin.spots.status.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('admin.spots.status.rejected')}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.spots.status.pending')}</Badge>;
      default:
        return <Badge variant="secondary">{t('admin.spots.status.pending')}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      'shore': { label: t('admin.spots.types.shore'), color: 'bg-blue-100 text-blue-800' },
      'boat': { label: t('admin.spots.types.boat'), color: 'bg-purple-100 text-purple-800' },
      'pier': { label: t('admin.spots.types.pier'), color: 'bg-gray-100 text-gray-800' },
      'rock': { label: t('admin.spots.types.rock'), color: 'bg-orange-100 text-orange-800' },
      'river': { label: t('admin.spots.types.river'), color: 'bg-cyan-100 text-cyan-800' },
      'lake': { label: t('admin.spots.types.lake'), color: 'bg-indigo-100 text-indigo-800' },
    };
    
    const typeInfo = types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const getDifficultyBadge = (difficulty?: string) => {
    const difficulties: Record<string, { label: string; color: string }> = {
      'easy': { label: t('admin.spots.difficulty.easy'), color: 'bg-green-100 text-green-800' },
      'medium': { label: t('admin.spots.difficulty.medium'), color: 'bg-yellow-100 text-yellow-800' },
      'hard': { label: t('admin.spots.difficulty.hard'), color: 'bg-red-100 text-red-800' },
    };
    
    const diffInfo = difficulties[difficulty || ''] || { label: difficulty || '', color: 'bg-gray-100 text-gray-800' };
    return <Badge className={diffInfo.color}>{diffInfo.label}</Badge>;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };


  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <AdminPageHeader
          title={
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('admin.spots.management')}
            </div>
          }
          description={spots ? `${spots.total} ${t('admin.spots.spotLabel')}` : t('admin.spots.loadingSpots')}
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
              label: t('admin.spots.searchLabel'),
              type: 'search',
              placeholder: t('admin.spots.searchPlaceholder'),
              value: searchTerm,
              onChange: setSearchTerm
            },
            {
              id: 'status',
              label: t('admin.spots.statusLabel'),
              type: 'select',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: t('admin.spots.filters.allStatuses') },
                { value: 'pending', label: t('admin.spots.status.pending') },
                { value: 'approved', label: t('admin.spots.status.approved') },
                { value: 'rejected', label: t('admin.spots.status.rejected') },
              ]
            },
            {
              id: 'type',
              label: t('admin.spots.typeLabel'),
              type: 'select',
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { value: 'all', label: t('admin.spots.filters.allTypes') },
                { value: 'shore', label: t('admin.spots.types.shore') },
                { value: 'boat', label: t('admin.spots.types.boat') },
                { value: 'pier', label: t('admin.spots.types.pier') },
                { value: 'rock', label: t('admin.spots.types.rock') },
                { value: 'river', label: t('admin.spots.types.river') },
                { value: 'lake', label: t('admin.spots.types.lake') },
              ]
            }
          ]}
        />

        {/* Spots List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <TypographyMuted>{t('admin.spots.loading')}</TypographyMuted>
            </div>
          ) : spots?.items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                <TypographyMuted>{t('admin.spots.noSpotsFound')}</TypographyMuted>
              </CardContent>
            </Card>
          ) : (
            <>
              {spots?.items.map((spot) => (
                <Card key={spot.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TypographyH6>{spot.name}</TypographyH6>
                              {getStatusBadge(spot.status)}
                              {getTypeBadge(spot.spot_type)}
                              {spot.difficulty && getDifficultyBadge(spot.difficulty)}
                            </div>
                            
                            {spot.description && (
                              <TypographyP className="text-muted-foreground line-clamp-2 mb-3">
                                {spot.description}
                              </TypographyP>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {spot.user?.full_name || spot.user?.username || 'Unknown'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                {spot.location.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(spot.created_at)}
                              </div>
                            </div>

                            {/* Additional Info Row */}
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                              {/* Rating */}
                              {spot.rating_count && spot.rating_count > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="flex">{renderStars(spot.rating || 0)}</div>
                                  <TypographySmall className="text-muted-foreground">
                                    ({spot.rating_count})
                                  </TypographySmall>
                                </div>
                              )}

                              {/* Depth */}
                              {(spot.depth_min || spot.depth_max) && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Gauge className="h-3 w-3" />
                                  <span>
                                    {spot.depth_min || 0}-{spot.depth_max || 0}m
                                  </span>
                                </div>
                              )}

                              {/* Area Size */}
                              {spot.area_size && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <SquareStack className="h-3 w-3" />
                                  <span>{spot.area_size} m²</span>
                                </div>
                              )}

                              {/* Catches Count */}
                              {spot.catches_count && spot.catches_count > 0 && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Fish className="h-3 w-3" />
                                  <span>{spot.catches_count} {t('admin.spots.catches')}</span>
                                </div>
                              )}
                            </div>

                            {/* Fish Species */}
                            {spot.fish_species && spot.fish_species.length > 0 && (
                              <div className="flex items-center gap-2 mt-3">
                                <Fish className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-wrap gap-1">
                                  {spot.fish_species.slice(0, 3).map((fish, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {fish}
                                    </Badge>
                                  ))}
                                  {spot.fish_species.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{spot.fish_species.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Admin Notes */}
                            {spot.rejection_reason && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <div className="text-xs font-medium text-gray-700 mb-1">
                                  {spot.status === 'rejected' ? t('admin.spots.rejectionReason') : t('admin.spots.adminNote')}:
                                </div>
                                <TypographySmall className="text-gray-600">
                                  {spot.rejection_reason}
                                </TypographySmall>
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t('admin.spots.actions')}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSpot(spot);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t('admin.spots.viewDetails')}
                              </DropdownMenuItem>
                              
                              {spot.status === 'pending' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSpot(spot);
                                      setApproveDialogOpen(true);
                                    }}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {t('admin.spots.approve')}
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSpot(spot);
                                      setRejectDialogOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {t('admin.spots.reject')}
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSpot(spot);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('admin.spots.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Pagination */}
          {spots && spots.total > 20 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {t('admin.spots.pagination.page')} {spots.page} - {t('admin.spots.pagination.total')} {spots.total} {t('admin.spots.spotLabel')}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  {t('admin.spots.pagination.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!spots.hasMore}
                >
                  {t('admin.spots.pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dialogs */}
        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {t('admin.spots.approveTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.spots.approveConfirm', { name: selectedSpot?.name })}
              </DialogDescription>
            </DialogHeader>
            
            <div>
              <Label htmlFor="approve-notes">{t('admin.spots.adminNoteOptional')}</Label>
              <Textarea
                id="approve-notes"
                placeholder={t('admin.spots.approveNotePlaceholder')}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <AdminModalFooter
              onCancel={() => setApproveDialogOpen(false)}
              onConfirm={handleApproveSpot}
              confirmText={t('admin.spots.approve')}
            />
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                {t('admin.spots.rejectTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.spots.rejectConfirm', { name: selectedSpot?.name })}
              </DialogDescription>
            </DialogHeader>
            
            <div>
              <Label htmlFor="reject-reason">{t('admin.spots.rejectReason')}</Label>
              <Textarea
                id="reject-reason"
                placeholder={t('admin.spots.rejectNotePlaceholder')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <AdminModalFooter
              onCancel={() => setRejectDialogOpen(false)}
              onConfirm={handleRejectSpot}
              confirmText={t('admin.spots.reject')}
              confirmVariant="destructive"
              isConfirmDisabled={!rejectReason.trim()}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                {t('admin.spots.deleteTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.spots.deleteConfirm', { name: selectedSpot?.name })}
              </DialogDescription>
            </DialogHeader>
            
            <div>
              <Label htmlFor="delete-reason">{t('admin.spots.deleteReasonOptional')}</Label>
              <Textarea
                id="delete-reason"
                placeholder={t('admin.spots.deleteReasonPlaceholder')}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <AdminModalFooter
              onCancel={() => setDeleteDialogOpen(false)}
              onConfirm={handleDeleteSpot}
              confirmText={t('admin.spots.delete')}
              confirmVariant="destructive"
            />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('admin.spots.spotDetails')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedSpot && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{t('admin.spots.basicInfo')}</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>{t('admin.spots.spotName')}:</strong> {selectedSpot.name}</div>
                        <div><strong>{t('admin.spots.location')}:</strong> {selectedSpot.location.name}</div>
                        <div><strong>{t('admin.spots.type')}:</strong> {getTypeBadge(selectedSpot.spot_type)}</div>
                        {selectedSpot.difficulty && (
                          <div><strong>{t('admin.spots.difficulty')}:</strong> {getDifficultyBadge(selectedSpot.difficulty)}</div>
                        )}
                        <div><strong>{t('admin.spots.status')}:</strong> {getStatusBadge(selectedSpot.status)}</div>
                        {selectedSpot.access_type && (
                          <div><strong>{t('admin.spots.accessType')}:</strong> {selectedSpot.access_type}</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">{t('admin.spots.coordinates')}</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>{t('admin.spots.latitude')}:</strong> {selectedSpot.location.lat}</div>
                        <div><strong>{t('admin.spots.longitude')}:</strong> {selectedSpot.location.lng}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">{t('admin.spots.sharedBy')}</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>{t('admin.spots.name')}:</strong> {selectedSpot.user?.full_name || selectedSpot.user?.username}</div>
                        <div><strong>{t('admin.spots.username')}:</strong> @{selectedSpot.user?.username}</div>
                        <div><strong>{t('admin.spots.shareDate')}:</strong> {formatDateTime(selectedSpot.created_at)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedSpot.rating_count && selectedSpot.rating_count > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('admin.spots.rating')}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(selectedSpot.rating || 0)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {(selectedSpot.rating || 0).toFixed(1)} ({selectedSpot.rating_count} {t('admin.spots.reviews')})
                          </span>
                        </div>
                      </div>
                    )}

                    {(selectedSpot.depth_min || selectedSpot.depth_max || selectedSpot.area_size) && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('admin.spots.specifications')}</h3>
                        <div className="space-y-2 text-sm">
                          {(selectedSpot.depth_min || selectedSpot.depth_max) && (
                            <div><strong>{t('admin.spots.depth')}:</strong> {selectedSpot.depth_min || 0}-{selectedSpot.depth_max || 0}m</div>
                          )}
                          {selectedSpot.area_size && (
                            <div><strong>{t('admin.spots.areaSize')}:</strong> {selectedSpot.area_size} m²</div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedSpot.fish_species && selectedSpot.fish_species.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('admin.spots.fishSpecies')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpot.fish_species.map((fish, index) => (
                            <Badge key={index} variant="outline">
                              {fish}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedSpot.facilities && selectedSpot.facilities.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('admin.spots.facilities')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpot.facilities.map((facility, index) => (
                            <Badge key={index} variant="secondary">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedSpot.approved_at && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('admin.spots.approvalInfo')}</h3>
                        <div className="space-y-2 text-sm">
                          <div><strong>{t('admin.spots.approvedDate')}:</strong> {formatDateTime(selectedSpot.approved_at)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSpot.description && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('admin.spots.description')}</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedSpot.description}
                    </p>
                  </div>
                )}

                {selectedSpot.rejection_reason && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">
                      {selectedSpot.status === 'rejected' ? t('admin.spots.rejectionReason') : t('admin.spots.adminNotes')}
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedSpot.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
    </>
  );
}