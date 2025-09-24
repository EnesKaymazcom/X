'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminFilterSection } from '@/components/admin/admin-filter-section';
import { TypographyH6, TypographySmall } from '@/lib/typography';
import { 
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Crown,
  Ban,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Mail,
  User,
  Trash,
  Loader2
} from 'lucide-react';
import { ProBadge } from '@/components/ui/pro-badge';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AdminModalFooter } from '@/components/admin/modal-footer';

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'super_admin';
  is_pro: boolean;
  banned_until?: string | null;
  ban_reason?: string;
  created_at: string;
  last_active_at?: string;
  followers_count: number;
  following_count: number;
  catches_count: number;
  spots_count: number;
}

interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API service functions
const apiService = {
  async getAdminUsers(page: number, limit: number, filters: { search?: string; role?: string; status?: string }) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.role && { role: filters.role }),
      ...(filters.status && { status: filters.status }),
    })

    const response = await fetch(`/api/admin/users?${params}`)
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  async banUser(userId: string, reason: string, duration?: number) {
    const response = await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, duration })
    })
    if (!response.ok) throw new Error('Failed to ban user')
    return response.json()
  },

  async unbanUser(userId: string) {
    const response = await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to unban user')
    return response.json()
  },

  async grantProStatus(userId: string, duration: number) {
    const response = await fetch(`/api/admin/users/${userId}/pro`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration })
    })
    if (!response.ok) throw new Error('Failed to grant pro status')
    return response.json()
  },

  async revokeProStatus(userId: string) {
    const response = await fetch(`/api/admin/users/${userId}/pro`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to revoke pro status')
    return response.json()
  },

  async deleteUser(userId: string) {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to delete user')
    return response.json()
  }
}

export default function UsersManagementPage() {
  const { t, locale } = useI18n();
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // Ban/Unban Modal States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [proDialogOpen, setProDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');
  const [proDuration, setProDuration] = useState('30');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeProDialogOpen, setRemoveProDialogOpen] = useState(false);

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const data = await apiService.getAdminUsers(page, 20, {
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm, roleFilter, statusFilter]);

  const handleBanUser = async () => {
    if (!selectedUser) return;
    try {
      await apiService.banUser(selectedUser.id, banReason, banDuration ? parseInt(banDuration) : undefined);
      toast.success(t('admin.users.usersBanned'));
      setBanDialogOpen(false);
      setBanReason('');
      setBanDuration('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || t('admin.users.errorBanUser'));
      setError(err.message);
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;
    try {
      await apiService.unbanUser(selectedUser.id);
      toast.success(t('admin.users.userUnbanned'));
      setUnbanDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || t('admin.users.errorUnbanUser'));
      setError(err.message);
    }
  };

  const handleGrantPro = async () => {
    if (!selectedUser) return;
    try {
      await apiService.grantProStatus(selectedUser.id, parseInt(proDuration));
      toast.success(t('admin.users.proGranted'));
      setProDialogOpen(false);
      setProDuration('30');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || t('admin.users.errorGrantPro'));
      setError(err.message);
    }
  };

  const handleRemovePro = async () => {
    if (!selectedUser) return;
    try {
      await apiService.revokeProStatus(selectedUser.id);
      toast.success(t('admin.users.proRemoved'));
      setRemoveProDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || t('admin.users.errorRemovePro'));
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await apiService.deleteUser(selectedUser.id);
      toast.success(t('admin.users.userDeleted'));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || t('admin.users.errorDeleteUser'));
      setError(err.message);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="destructive">{t('admin.users.superAdmin')}</Badge>;
      case 'admin':
        return <Badge variant="default">{t('admin.users.filters.admin')}</Badge>;
      default:
        return <Badge variant="secondary">{t('admin.users.filters.user')}</Badge>
    }
  };

  const getStatusBadge = (user: User) => {
    const now = new Date();
    const banned = user.banned_until && new Date(user.banned_until) > now;
    if (banned) {
      return <Badge variant="destructive">{t('admin.users.filters.banned')}</Badge>;
    }
    if (user.is_pro) {
      return <ProBadge variant="small" />;
    }
    return <Badge variant="secondary">{t('admin.users.filters.active')}</Badge>;
  };

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        
          <AdminPageHeader 
            title={
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('admin.dashboard.usersManagement')}
              </div>
            }
            description={users ? `${users.total} ${t('admin.users.totalUsers')}` : t('admin.users.loadingUsers')}
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
                label: t('common.search'),
                type: 'search',
                placeholder: t('admin.users.searchPlaceholder'),
                value: searchTerm,
                onChange: setSearchTerm
              },
              {
                id: 'role',
                label: t('admin.users.filters.role'),
                type: 'select',
                value: roleFilter,
                onChange: setRoleFilter,
                options: [
                  { value: 'all', label: t('admin.users.filters.allRoles') },
                  { value: 'user', label: t('admin.users.filters.user') },
                  { value: 'admin', label: t('admin.users.filters.admin') },
                  { value: 'super_admin', label: t('admin.users.superAdmin') }
                ]
              },
              {
                id: 'status',
                label: t('admin.users.filters.status'),
                type: 'select',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'all', label: t('admin.users.filters.allStatuses') },
                  { value: 'active', label: t('admin.users.filters.active') },
                  { value: 'banned', label: t('admin.users.filters.banned') },
                  { value: 'pro', label: t('admin.users.filters.pro') }
                ]
              }
            ]}
            onFilter={fetchUsers}
            loading={loading}
          />

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboard.users')}</CardTitle>
              <CardDescription>
                {t('admin.dashboard.usersDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-muted-foreground">{t('admin.users.loadingUsers')}</div>
                </div>
              ) : users?.items.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground">{t('admin.users.noUsersFound')}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users?.items.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <TypographyH6>
                              {user.full_name || user.username}
                            </TypographyH6>
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user)}
                            {user.banned_until && new Date(user.banned_until) > new Date() && user.ban_reason && (
                              <span className="text-xs text-red-600 ml-1">{user.ban_reason}</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                @{user.username}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(user.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span>{user.followers_count} {t('admin.users.followers')}</span>
                              <span>{user.following_count} {t('admin.users.following')}</span>
                              <span>{user.catches_count} {t('admin.users.catches')}</span>
                              <span>{user.spots_count} {t('admin.users.spots')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('admin.users.table.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {!user.is_pro && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setProDialogOpen(true);
                              }}
                              className="text-yellow-600"
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              {t('admin.users.actions.grantPro')}
                            </DropdownMenuItem>
                          )}
                          {user.is_pro && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setRemoveProDialogOpen(true);
                              }}
                              className="text-yellow-600"
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              {t('admin.users.actions.removePro')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => router.push(`/${locale}/${user.username}`)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            {t('admin.users.actions.viewProfile')}
                          </DropdownMenuItem>
                          {/* Ban/Unban DropdownMenuItem */}
                          {!user.banned_until || new Date(user.banned_until) <= new Date() ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setBanDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {t('admin.users.actions.banUser')}
                            </DropdownMenuItem>
                          ) : null}
                          {user.banned_until && new Date(user.banned_until) > new Date() && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setUnbanDialogOpen(true);
                              }}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {t('admin.users.actions.unbanUser')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            {t('admin.users.actions.deleteUser')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {users && users.total > 20 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    {t('admin.users.page')} {users.page} - {t('admin.users.total')} {users.total} {t('admin.users.totalUsers')}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      {t('admin.users.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!users.hasMore}
                    >
                      {t('admin.users.next')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ban Dialog */}
          <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  {t('admin.users.banUserTitle')}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser?.username} {t('admin.users.banUserConfirm')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ban-reason">{t('admin.users.banReason')}</Label>
                  <Textarea
                    id="ban-reason"
                    placeholder={t('admin.users.banReasonPlaceholder')}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="ban-duration">{t('admin.users.banDuration')}</Label>
                  <Input
                    id="ban-duration"
                    type="number"
                    placeholder={t('admin.users.banDurationPlaceholder')}
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                  />
                </div>
              </div>

              <AdminModalFooter
                onCancel={() => setBanDialogOpen(false)}
                onConfirm={handleBanUser}
                cancelText={t('common.cancel')}
                confirmText={t('admin.users.actions.banUser')}
                confirmVariant="destructive"
                isConfirmDisabled={!banReason.trim()}
              />
            </DialogContent>
          </Dialog>

          {/* Unban Dialog */}
          <Dialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {t('admin.users.unbanTitle')}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser?.username} {t('admin.users.unbanConfirm')}
                </DialogDescription>
              </DialogHeader>

              {selectedUser?.ban_reason && (
                <div className="p-3 bg-muted rounded-lg">
                  <TypographySmall className="text-muted-foreground">{t('admin.users.currentBanReason')}</TypographySmall>
                  <div className="text-sm mt-1">{selectedUser.ban_reason}</div>
                </div>
              )}

              <AdminModalFooter
                onCancel={() => setUnbanDialogOpen(false)}
                onConfirm={handleUnbanUser}
                cancelText={t('common.cancel')}
                confirmText={t('admin.users.actions.unbanUser')}
              />
            </DialogContent>
          </Dialog>

          {/* Pro Membership Dialog */}
          <Dialog open={proDialogOpen} onOpenChange={setProDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  {t('admin.users.grantProTitle')}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser?.username} {t('admin.users.grantProConfirm')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-2">
                <Label htmlFor="pro-duration">{t('admin.users.proDuration')}</Label>
                <Select
                  value={proDuration}
                  onValueChange={setProDuration}
                >
                  <SelectTrigger id="pro-duration">
                    <SelectValue placeholder={t('admin.users.selectDuration')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{t('admin.users.30days')}</SelectItem>
                    <SelectItem value="90">{t('admin.users.90days')}</SelectItem>
                    <SelectItem value="180">{t('admin.users.180days')}</SelectItem>
                    <SelectItem value="365">{t('admin.users.1year')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <AdminModalFooter
                onCancel={() => setProDialogOpen(false)}
                onConfirm={handleGrantPro}
                cancelText={t('common.cancel')}
                confirmText={t('admin.users.actions.grantPro')}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  {t('admin.users.deleteUserTitle')}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser?.username} {t('admin.users.deleteUserConfirm')}
                </DialogDescription>
              </DialogHeader>
              <AdminModalFooter
                onCancel={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteUser}
                cancelText={t('common.cancel')}
                confirmText={t('admin.users.actions.deleteUser')}
                confirmVariant="destructive"
              />
            </DialogContent>
          </Dialog>

          {/* Remove Pro Dialog */}
          <Dialog open={removeProDialogOpen} onOpenChange={setRemoveProDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  {t('admin.users.removeProTitle')}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser?.username} {t('admin.users.removeProConfirm')}
                </DialogDescription>
              </DialogHeader>
              <AdminModalFooter
                onCancel={() => setRemoveProDialogOpen(false)}
                onConfirm={handleRemovePro}
                cancelText={t('common.cancel')}
                confirmText={t('admin.users.actions.removePro')}
                confirmVariant="destructive"
              />
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </>
  );
}
