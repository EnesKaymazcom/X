'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime } from '@/lib/utils';
import { AdminModalFooter } from '@/components/admin/modal-footer';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { TypographyH6, TypographySmall, TypographyP } from '@/lib/typography';
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
import { 
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  User,
  FileText,
  Calendar,
  MessageCircle,
  Shield,
  Flag,
  ExternalLink
} from 'lucide-react';

interface Report {
  id: number;
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: number;
  report_type: 'user' | 'post' | 'comment' | 'spam' | 'harassment' | 'inappropriate_content';
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  
  // Relations
  reporter?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  reported_user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  reported_post?: {
    id: number;
    title: string;
    fish_species: string;
  };
  resolver?: {
    id: string;
    username: string;
  };
}

interface PaginatedReports {
  items: Report[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export default function ReportsManagementPage() {
  const { t, locale } = useI18n();
  const [reports, setReports] = useState<PaginatedReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // Modal States
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss'>('resolve');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      });

      // const { apiService } = await import('@fishivo/services');
      // Dummy apiService for compilation
      const apiService = {
        getAllReports: async () => ({
          success: true,
          data: []
        }),
        updateReportStatus: async (id: string, status: string) => ({
          success: true
        }),
        deleteReport: async (id: string) => ({
          success: true
        })
      };
      
      const filters = {
        page,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      };
      
      const response = await apiService.getAdminReports(page, 20, filters);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch reports');
      }
      
      setReports(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || t('admin.reports.errorLoadingReports'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, searchTerm, statusFilter, typeFilter]);

  const handleReportAction = async () => {
    if (!selectedReport) return;

    try {
      // const { apiService } = await import('@fishivo/services');
      // Dummy apiService for compilation
      const apiService = {
        getAllReports: async () => ({
          success: true,
          data: []
        }),
        updateReportStatus: async (id: string, status: string) => ({
          success: true
        }),
        deleteReport: async (id: string) => ({
          success: true
        })
      };
      
      const action = actionType === 'resolve' ? 'resolved' : 'dismissed';
      
      const response = await apiService.resolveReport(selectedReport.id, action, adminNotes);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to resolve report');
      }

      setActionDialogOpen(false);
      setSelectedReport(null);
      setAdminNotes('');
      fetchReports();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    
    const labels: Record<string, string> = {
      pending: t('admin.reports.status.pending'),
      reviewed: t('admin.reports.status.reviewed'),
      resolved: t('admin.reports.status.resolved'),
      dismissed: t('admin.reports.status.dismissed'),
    };

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      user: 'bg-red-100 text-red-800',
      post: 'bg-purple-100 text-purple-800',
      comment: 'bg-blue-100 text-blue-800',
      spam: 'bg-orange-100 text-orange-800',
      harassment: 'bg-red-100 text-red-800',
      inappropriate_content: 'bg-pink-100 text-pink-800',
    };
    
    const labels: Record<string, string> = {
      user: t('admin.reports.reportType.user'),
      post: t('admin.reports.reportType.post'),
      comment: t('admin.reports.reportType.comment'),
      spam: t('admin.reports.reportType.spam'),
      harassment: t('admin.reports.reportType.harassment'),
      inappropriate_content: t('admin.reports.reportType.inappropriate_content'),
    };

    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {labels[type] || type}
      </Badge>
    );
  };

  // Remove local formatDate function - using formatDateTime from utils

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'reviewed':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'resolved':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'dismissed':
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <AdminPageHeader
          title={
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              {t('admin.reports.management')}
            </div>
          }
          description={reports ? `${reports.total} ${t('admin.reports.totalReports')}` : t('admin.reports.loadingReports')}
          actions={
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                {reports?.items.filter(r => r.status === 'pending').length || 0} {t('admin.reports.status.pending')}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {reports?.items.filter(r => r.status === 'reviewed').length || 0} {t('admin.reports.status.reviewed')}
              </Badge>
            </div>
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
              {t('admin.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">{t('admin.search')}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder={t('admin.reports.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>{t('admin.status')}</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">{t('admin.reports.allStatuses')}</option>
                  <option value="pending">{t('admin.reports.status.pending')}</option>
                  <option value="reviewed">{t('admin.reports.status.reviewed')}</option>
                  <option value="resolved">{t('admin.reports.status.resolved')}</option>
                  <option value="dismissed">{t('admin.reports.status.dismissed')}</option>
                </select>
              </div>

              <div>
                <Label>{t('admin.reports.filters.type')}</Label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">{t('admin.reports.allTypes')}</option>
                  <option value="user">{t('admin.reports.reportType.user')}</option>
                  <option value="post">{t('admin.reports.reportType.post')}</option>
                  <option value="comment">{t('admin.reports.reportType.comment')}</option>
                  <option value="spam">{t('admin.reports.reportType.spam')}</option>
                  <option value="harassment">{t('admin.reports.reportType.harassment')}</option>
                  <option value="inappropriate_content">{t('admin.reports.reportType.inappropriate_content')}</option>
                </select>
              </div>

              <div className="flex items-end">
                <LoadingButton 
                  onClick={fetchReports} 
                  loading={loading}
                  className="w-full"
                >
                  {t('admin.filter')}
                </LoadingButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.reports.title')}</CardTitle>
            <CardDescription>
              {t('admin.reports.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">{t('admin.reports.loadingReports')}</div>
              </div>
            ) : reports?.items.length === 0 ? (
              <div className="text-center py-8">
                <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-muted-foreground">{t('admin.reports.noReportsFound')}</div>
              </div>
            ) : (
              <div className="space-y-4">
                {reports?.items.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(report.status)}
                          <TypographyH6>#{report.id}</TypographyH6>
                          {getStatusBadge(report.status)}
                          {getTypeBadge(report.report_type)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              <strong>{t('admin.reports.reportedBy')}:</strong> {report.reporter?.username}
                            </span>
                          </div>
                          
                          {report.reported_user && (
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>
                                <strong>{t('admin.reports.reportedUser')}:</strong> {report.reported_user.username}
                              </span>
                            </div>
                          )}
                          
                          {report.reported_post && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>
                                <strong>{t('admin.reports.reportedPost')}:</strong> {report.reported_post.title}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateTime(report.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="font-medium text-foreground">{report.reason}</p>
                          {report.description && (
                            <TypographySmall className="text-muted-foreground mt-1 line-clamp-2">
                              {report.description}
                            </TypographySmall>
                          )}
                        </div>

                        {report.admin_notes && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageCircle className="h-4 w-4 text-muted-foreground" />
                              <TypographySmall>{t('admin.reports.adminNotes')}:</TypographySmall>
                            </div>
                            <TypographySmall className="text-muted-foreground">{report.admin_notes}</TypographySmall>
                          </div>
                        )}

                        {report.resolved_by && report.resolved_at && (
                          <TypographySmall className="mt-2">
                            {t('admin.reports.resolvedByUser', { username: report.resolver?.username || '', date: formatDateTime(report.resolved_at) })}
                          </TypographySmall>
                        )}
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
                              setSelectedReport(report);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('admin.viewDetails')}
                          </DropdownMenuItem>
                          
                          {report.reported_user && (
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {t('admin.reports.viewUser')}
                            </DropdownMenuItem>
                          )}
                          
                          {report.reported_post && (
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {t('admin.reports.viewPost')}
                            </DropdownMenuItem>
                          )}
                          
                          {report.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReport(report);
                                  setActionType('resolve');
                                  setActionDialogOpen(true);
                                }}
                                className="text-green-600"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                {t('admin.reports.resolveReport')}
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReport(report);
                                  setActionType('dismiss');
                                  setActionDialogOpen(true);
                                }}
                                className="text-muted-foreground"
                              >
                                <X className="h-4 w-4 mr-2" />
                                {t('admin.reports.dismissReport')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {reports && reports.total > 20 && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <TypographySmall className="text-muted-foreground">
                  {t('admin.reports.pageInfo', { page: reports.page.toString(), total: reports.total.toString() })}
                </TypographySmall>
                <div className="flex gap-2">
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {t('admin.previous')}
                  </LoadingButton>
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!reports.hasMore}
                  >
                    {t('admin.next')}
                  </LoadingButton>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                {t('admin.reports.reportDetails')} - #{selectedReport?.id}
              </DialogTitle>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{t('admin.reports.reportInfo')}</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>{t('admin.reports.reportId')}:</strong> #{selectedReport.id}</div>
                        <div><strong>{t('admin.reports.reportType')}:</strong> {getTypeBadge(selectedReport.report_type)}</div>
                        <div><strong>{t('admin.reports.reportStatus')}:</strong> {getStatusBadge(selectedReport.status)}</div>
                        <div><strong>{t('admin.reports.reportDate')}:</strong> {formatDateTime(selectedReport.created_at)}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">{t('admin.reports.reporter')}</h3>
                      <div className="flex items-center gap-3">
                        {selectedReport.reporter?.avatar_url && (
                          <img 
                            src={selectedReport.reporter.avatar_url} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span>{selectedReport.reporter?.username}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedReport.reported_user && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('admin.reports.reportedUser')}</h3>
                        <div className="flex items-center gap-3">
                          {selectedReport.reported_user.avatar_url && (
                            <img 
                              src={selectedReport.reported_user.avatar_url} 
                              alt="Avatar" 
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span>{selectedReport.reported_user.username}</span>
                        </div>
                      </div>
                    )}

                    {selectedReport.reported_post && (
                      <div>
                        <h3 className="font-semibold mb-2">{t('admin.reports.reportedPost')}</h3>
                        <div className="text-sm">
                          <div><strong>{t('admin.reports.postTitle')}:</strong> {selectedReport.reported_post.title}</div>
                          <div><strong>{t('admin.reports.fishSpecies')}:</strong> {selectedReport.reported_post.fish_species}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('admin.reports.reportReason')}</h3>
                  <TypographySmall>{selectedReport.reason}</TypographySmall>
                </div>

                {selectedReport.description && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('admin.reports.detailedDescription')}</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                {selectedReport.admin_notes && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('admin.reports.adminNotes')}</h3>
                    <div className="p-3 bg-muted rounded-md">
                      <TypographySmall className="text-muted-foreground">{selectedReport.admin_notes}</TypographySmall>
                    </div>
                  </div>
                )}

                {selectedReport.resolved_by && selectedReport.resolved_at && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('admin.reports.resolutionInfo')}</h3>
                    <div>
                      <div><strong>{t('admin.reports.resolvedBy')}:</strong> {selectedReport.resolver?.username}</div>
                      <div><strong>{t('admin.reports.resolvedAt')}:</strong> {formatDateTime(selectedReport.resolved_at)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionType === 'resolve' ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground" />
                )}
                {actionType === 'resolve' ? t('admin.reports.resolveTitle') : t('admin.reports.dismissTitle')}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'resolve' ? t('admin.reports.resolveConfirm', { id: selectedReport?.id?.toString() || '' }) : t('admin.reports.dismissConfirm', { id: selectedReport?.id?.toString() || '' })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin_notes">{t('admin.reports.adminNotes')}</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t('admin.reports.adminNotesPlaceholder')}
                  rows={3}
                />
              </div>
            </div>

            <AdminModalFooter
              onCancel={() => setActionDialogOpen(false)}
              onConfirm={handleReportAction}
              cancelText={t('common.cancel')}
              confirmText={actionType === 'resolve' ? t('admin.reports.resolveReport') : t('admin.reports.dismissReport')}
              confirmVariant={actionType === 'resolve' ? 'default' : 'secondary'}
            />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}