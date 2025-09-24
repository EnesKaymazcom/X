'use client';

import { useState, useEffect } from 'react';
import { postsServiceWeb } from '@fishivo/api/services/posts/posts.web';
import { useI18n } from '@/lib/i18n';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { AdminModalFooter } from '@/components/admin/modal-footer';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { TypographyH5, TypographyH6, TypographyMuted, TypographySmall, TypographyP } from '@/lib/typography';
import { 
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  Eye,
  AlertTriangle,
  Calendar,
  User,
  MapPin,
  Fish,
  Heart,
  MessageCircle,
  Flag,
  Ban,
  CheckCircle,
  ExternalLink,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  Clock
} from 'lucide-react';
import { AdminFilterSection } from '@/components/admin/admin-filter-section';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

import type { Post, PaginatedPosts } from '@fishivo/api/services/posts/posts.web';

export default function PostsManagementPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [posts, setPosts] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportedFilter, setReportedFilter] = useState(false);
  const [page, setPage] = useState(1);
  
  // Delete Modal States
  const [selectedPost, setSelectedPost] = useState<Post & { 
    location?: {
      name?: string;
      city?: string;
      district?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    weather?: {
      temperature?: number;
      description?: string;
      wind_speed?: number;
      wind_direction?: string;
      humidity?: number;
      pressure?: number;
    };
    catch_time?: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(reportedFilter && { reported: 'true' }),
      });

      const data = await postsServiceWeb.getAdminPosts(page, 20, {
        status: statusFilter,
        reported: reportedFilter,
        search: searchTerm,
        _t: Date.now() // Cache buster
      });
      console.log('Posts API response:', JSON.stringify(data, null, 2));
      
      // API service returns PaginatedResponse<Post> directly
      setPosts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, searchTerm, statusFilter, reportedFilter]);

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      await postsServiceWeb.deleteAdminPost(selectedPost.id, deleteReason);

      setDeleteDialogOpen(false);
      setDeleteReason('');
      setSelectedPost(null);
      fetchPosts();
      toast.success(t('admin.posts.postDeleted'));
    } catch (err: any) {
      setError(err.message);
      toast.error(t('admin.posts.postDeleteError'));
    }
  };

  const handleModeratePost = async (status: string) => {
    if (!selectedPost) return;

    try {
      await postsServiceWeb.updateAdminPost(selectedPost.id, { status });

      fetchPosts();
      toast.success(t('admin.posts.postStatusUpdated'));
    } catch (err: any) {
      setError(err.message);
      toast.error(t('admin.posts.postStatusUpdateError'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return null; // Don't show active badge
      case 'hidden':
        return <Badge variant="destructive">{t('admin.posts.hidden')}</Badge>;
      case 'deleted':
        return <Badge variant="destructive">{t('admin.posts.deleted')}</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.posts.pending')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Remove local formatDate function - using formatDateTime from utils

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <AdminPageHeader
          title={
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('admin.posts.postsManagement')}
            </div>
          }
          description={posts ? t('admin.posts.totalPosts', { count: posts.total }) : t('admin.posts.postsLoading')}
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
              label: t('admin.posts.search'),
              type: 'search',
              placeholder: t('admin.posts.searchPlaceholder'),
              value: searchTerm,
              onChange: setSearchTerm
            },
            {
              id: 'status',
              label: t('admin.posts.status'),
              type: 'select',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: t('admin.posts.allStatuses') },
                { value: 'active', label: t('admin.posts.active') },
                { value: 'pending_review', label: t('admin.posts.pending') },
                { value: 'hidden', label: t('admin.posts.hidden') },
                { value: 'deleted', label: t('admin.posts.deleted') }
              ]
            },
            {
              id: 'reported',
              label: t('admin.posts.reportStatus'),
              type: 'select',
              value: reportedFilter ? 'reported' : 'all',
              onChange: (value) => setReportedFilter(value === 'reported'),
              options: [
                { value: 'all', label: t('admin.posts.all') },
                { value: 'reported', label: t('admin.posts.reported') }
              ]
            }
          ]}
        />

        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.posts.posts')}</CardTitle>
            <CardDescription>
              {t('admin.posts.postsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">{t('common.loading')}</div>
              </div>
            ) : posts?.items.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-muted-foreground">{t('admin.posts.noPostsFound')}</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {posts?.items.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:bg-muted transition-colors">
                    <div className="flex h-40">
                      {/* Post Image */}
                      <div className="relative w-40 h-full flex-shrink-0 p-2">
                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                        {post.images && post.images.length > 0 ? (
                          <Image 
                            src={post.images[0]} 
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="160px"
                          />
                        ) : post.image_url ? (
                          <Image 
                            src={post.image_url} 
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="160px"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Fish className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4 flex flex-col justify-center">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            {/* Header with title and badges */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <TypographyH6 className="line-clamp-1">
                                  {post.title}
                                </TypographyH6>
                                {getStatusBadge(post.status)}
                                {post.report_count > 0 && (
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <Flag className="h-3 w-3" />
                                    {post.report_count}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Content */}
                              <TypographySmall className="text-muted-foreground line-clamp-1">
                                {post.content}
                              </TypographySmall>
                            </div>
                            
                            {/* User and Date Info - Single Line */}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>@{post.username}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateTime(post.created_at)}</span>
                              </div>
                            </div>
                            
                            {/* Fish Info in Row */}
                            {(post.fish_species || post.fish_weight || post.fish_length) && (
                              <div className="flex items-center gap-4 text-xs">
                                {post.fish_species && (
                                  <div className="flex items-center gap-1">
                                    <Fish className="h-3 w-3 text-primary" />
                                    <span className="font-medium text-sm">{post.fish_species}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  {post.fish_weight && <span>{post.fish_weight}{t('units.kg')}</span>}
                                  {post.fish_weight && post.fish_length && <span>•</span>}
                                  {post.fish_length && <span>{post.fish_length}{t('units.cm')}</span>}
                                </div>
                              </div>
                            )}
                            
                            {/* Stats */}
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 text-pink-500" />
                                <span className="font-medium">{post.likes_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3 text-blue-500" />
                                <span className="font-medium">{post.comments_count}</span>
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">{t('admin.posts.actions')}</span>
                              </Button>
                            </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('admin.posts.actions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPost(post);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t('admin.posts.viewDetails')}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPost(post);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('admin.posts.delete')}
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {posts && posts.total > 20 && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <TypographySmall className="text-muted-foreground">
                  {t('admin.posts.pageInfo', { page: posts.page, total: posts.total })}
                </TypographySmall>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {t('admin.posts.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!posts.hasMore}
                  >
                    {t('admin.posts.next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                {t('admin.posts.deletePost')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.posts.deletePostConfirmation', { title: selectedPost?.title })}
              </DialogDescription>
            </DialogHeader>
            
            <div>
              <Label htmlFor="delete-reason">{t('admin.posts.deleteReason')}</Label>
              <Textarea
                id="delete-reason"
                placeholder={t('admin.posts.deleteReasonPlaceholder')}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <AdminModalFooter
              onCancel={() => setDeleteDialogOpen(false)}
              onConfirm={handleDeletePost}
              cancelText={t('common.cancel')}
              confirmText={t('admin.posts.delete')}
              confirmVariant="destructive"
              isConfirmDisabled={!deleteReason.trim()}
            />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {t('admin.posts.postDetails')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedPost && (
              <div className="space-y-4">
                {/* Main Card - Similar to list view */}
                <Card className="overflow-hidden">
                  <div className="flex h-40">
                    {/* Post Image */}
                    <div className="relative w-40 h-full flex-shrink-0 p-2">
                      <div className="relative w-full h-full rounded-lg overflow-hidden">
                      {selectedPost.images && selectedPost.images.length > 0 ? (
                        <Image 
                          src={selectedPost.images[0]} 
                          alt={selectedPost.title}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      ) : selectedPost.image_url ? (
                        <Image 
                          src={selectedPost.image_url} 
                          alt={selectedPost.title}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Fish className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <div className="space-y-3">
                        {/* Header with title and badges */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <TypographyH6 className="line-clamp-1">
                              {selectedPost.title}
                            </TypographyH6>
                            {getStatusBadge(selectedPost.status)}
                            {selectedPost.report_count > 0 && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                {selectedPost.report_count}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Content */}
                          <TypographySmall className="text-muted-foreground line-clamp-1">
                            {selectedPost.content}
                          </TypographySmall>
                        </div>
                        
                        {/* User and Date Info */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">{selectedPost.full_name || selectedPost.username}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDateTime(selectedPost.created_at)}</span>
                          </div>
                        </div>
                        
                        {/* Fish Info in Row */}
                        {(selectedPost.fish_species || selectedPost.fish_weight || selectedPost.fish_length) && (
                          <div className="flex items-center gap-4 text-xs">
                            {selectedPost.fish_species && (
                              <div className="flex items-center gap-1">
                                <Fish className="h-3 w-3 text-primary" />
                                <span className="font-medium text-sm">{selectedPost.fish_species}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {selectedPost.fish_weight && <span>{selectedPost.fish_weight}kg</span>}
                              {selectedPost.fish_weight && selectedPost.fish_length && <span>•</span>}
                              {selectedPost.fish_length && <span>{selectedPost.fish_length}cm</span>}
                            </div>
                          </div>
                        )}
                        
                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-pink-500" />
                            <span className="font-medium">{selectedPost.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 text-blue-500" />
                            <span className="font-medium">{selectedPost.comments_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Location and Weather Info */}
                {(selectedPost.location || selectedPost.weather) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{t('admin.posts.catchDetails')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Location */}
                      {selectedPost.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <TypographySmall>{t('admin.posts.location')}</TypographySmall>
                            <TypographySmall className="text-muted-foreground">
                              {selectedPost.location.name}
                              {selectedPost.location.district && selectedPost.location.city && (
                                <span>, {selectedPost.location.district}, {selectedPost.location.city}</span>
                              )}
                            </TypographySmall>
                          </div>
                        </div>
                      )}

                      {/* Catch Time */}
                      {selectedPost.catch_time && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <TypographySmall>{t('admin.posts.catchTime')}</TypographySmall>
                            <TypographySmall className="text-muted-foreground">
                              {formatDateTime(selectedPost.catch_time)}
                            </TypographySmall>
                          </div>
                        </div>
                      )}

                      {/* Weather */}
                      {selectedPost.weather && (
                        <>
                          <Separator />
                          <div className="grid grid-cols-2 gap-4">
                            {/* Temperature */}
                            {selectedPost.weather.temperature !== undefined && (
                              <div className="flex items-start gap-3">
                                <Thermometer className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                  <TypographySmall>{t('admin.posts.temperature')}</TypographySmall>
                                  <TypographySmall className="text-muted-foreground">
                                    {selectedPost.weather.temperature}°C
                                    {selectedPost.weather.description && (
                                      <span> - {selectedPost.weather.description}</span>
                                    )}
                                  </TypographySmall>
                                </div>
                              </div>
                            )}

                            {/* Wind */}
                            {selectedPost.weather.wind_speed !== undefined && (
                              <div className="flex items-start gap-3">
                                <Wind className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                  <TypographySmall>{t('admin.posts.wind')}</TypographySmall>
                                  <TypographySmall className="text-muted-foreground">
                                    {selectedPost.weather.wind_direction && (
                                      <span>{selectedPost.weather.wind_direction}, </span>
                                    )}
                                    {selectedPost.weather.wind_speed} km/s
                                  </TypographySmall>
                                </div>
                              </div>
                            )}

                            {/* Humidity */}
                            {selectedPost.weather.humidity !== undefined && (
                              <div className="flex items-start gap-3">
                                <Droplets className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                  <TypographySmall>{t('admin.posts.humidity')}</TypographySmall>
                                  <TypographySmall className="text-muted-foreground">
                                    %{selectedPost.weather.humidity}
                                  </TypographySmall>
                                </div>
                              </div>
                            )}

                            {/* Pressure */}
                            {selectedPost.weather.pressure !== undefined && (
                              <div className="flex items-start gap-3">
                                <Gauge className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                  <TypographySmall>{t('admin.posts.pressure')}</TypographySmall>
                                  <TypographySmall className="text-muted-foreground">
                                    {selectedPost.weather.pressure} hPa
                                  </TypographySmall>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Additional Images */}
                {selectedPost.images && selectedPost.images.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{t('admin.posts.photos')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedPost.images.slice(1).map((image, index) => (
                          <div key={index + 1} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={image}
                              alt={`${selectedPost.title} - ${index + 2}`}
                              fill
                              className="object-cover cursor-pointer hover:scale-105 transition-transform"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-between">
                  <Link
                    href={`/${locale}/${selectedPost.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {t('admin.posts.viewProfile')}
                    </Button>
                  </Link>
                  
                  <div className="flex gap-2">
                    {selectedPost.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModeratePost('hidden')}
                      >
                        {t('admin.posts.hide')}
                      </Button>
                    )}
                    {selectedPost.status === 'hidden' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModeratePost('active')}
                      >
                        {t('admin.posts.unhide')}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setViewDialogOpen(false);
                        setSelectedPost(selectedPost);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      {t('admin.posts.delete')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        </div>
      </div>
    </>
  );
}
