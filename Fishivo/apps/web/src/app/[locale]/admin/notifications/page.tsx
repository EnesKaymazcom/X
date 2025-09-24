'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminFilterSection } from '@/components/admin/admin-filter-section';
import { AdminModalFooter } from '@/components/admin/modal-footer';
import { TypographyLarge, TypographyH3, TypographySmall, TypographyP } from '@/lib/typography';
import { 
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Send,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Calendar,
  Settings
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  target_type: 'all' | 'admins' | 'users' | 'specific';
  target_users?: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  read_count: number;
  total_recipients: number;
  created_at: string;
  created_by: string;
}

interface NotificationTemplate {
  id: number;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    priority: 'medium' as const,
    target_type: 'all' as const,
    target_users: '',
    scheduled_at: '',
    send_email: false,
    send_push: true,
  });

  // Notification Settings
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    auto_delete_old: true,
    retention_days: 30,
    daily_limit: 10,
    allow_user_preferences: true,
  });

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: 'Sistem Bakımı Bildirimi',
          message: 'Sistem 15 Ocak 2024 saat 02:00-04:00 arasında bakım nedeniyle erişilemeyecektir.',
          type: 'warning',
          priority: 'high',
          target_type: 'all',
          status: 'sent',
          sent_at: '2024-01-14T10:00:00Z',
          read_count: 245,
          total_recipients: 1250,
          created_at: '2024-01-14T09:30:00Z',
          created_by: 'admin_mehmet'
        },
        {
          id: 2,
          title: 'Yeni Özellik: Pro Üyelik',
          message: 'Yeni Pro üyelik sistemi aktif edildi. Özel içeriklere erişim sağlayabilirsiniz.',
          type: 'success',
          priority: 'medium',
          target_type: 'users',
          status: 'sent',
          sent_at: '2024-01-13T14:00:00Z',
          read_count: 89,
          total_recipients: 980,
          created_at: '2024-01-13T13:45:00Z',
          created_by: 'admin_ayse'
        },
        {
          id: 3,
          title: 'Güvenlik Güncellemesi',
          message: 'Hesap güvenliğiniz için lütfen parolanızı güncelleyin.',
          type: 'error',
          priority: 'high',
          target_type: 'specific',
          target_users: ['user1', 'user2', 'user3'],
          status: 'scheduled',
          scheduled_at: '2024-01-15T09:00:00Z',
          read_count: 0,
          total_recipients: 3,
          created_at: '2024-01-14T16:00:00Z',
          created_by: 'admin_mehmet'
        },
        {
          id: 4,
          title: 'Haftalık Özet',
          message: 'Bu hafta toplam 25 yeni gönderi, 150 yorum ve 8 yeni üye katıldı.',
          type: 'info',
          priority: 'low',
          target_type: 'admins',
          status: 'draft',
          read_count: 0,
          total_recipients: 5,
          created_at: '2024-01-14T18:00:00Z',
          created_by: 'system'
        }
      ];

      setNotifications(mockNotifications);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Bildirimler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    const mockTemplates: NotificationTemplate[] = [
      {
        id: 1,
        name: 'Sistem Bakımı',
        title: 'Sistem Bakımı Bildirimi',
        message: 'Sistem {date} tarihinde {time} saatleri arasında bakım nedeniyle erişilemeyecektir.',
        type: 'warning'
      },
      {
        id: 2,
        name: 'Hoş Geldin',
        title: 'Fishivo\'ya Hoş Geldiniz!',
        message: 'Merhaba {name}, Fishivo ailesine hoş geldiniz! Hemen balıkçılık maceralarınızı paylaşmaya başlayabilirsiniz.',
        type: 'success'
      },
      {
        id: 3,
        name: 'Güvenlik Uyarısı',
        title: 'Güvenlik Bildirimi',
        message: 'Hesabınızda şüpheli aktivite tespit edildi. Lütfen parolanızı değiştirin.',
        type: 'error'
      }
    ];
    setTemplates(mockTemplates);
  };

  const handleCreateNotification = async () => {
    try {
      // Here would be the API call
      console.log('Creating notification:', formData);
      
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        target_type: 'all',
        target_users: '',
        scheduled_at: '',
        send_email: false,
        send_push: true,
      });
      fetchNotifications();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      // API call would be here
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      draft: 'Taslak',
      scheduled: 'Zamanlandı',
      sent: 'Gönderildi',
      failed: 'Başarısız',
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      info: 'Bilgi',
      warning: 'Uyarı',
      success: 'Başarılı',
      error: 'Hata',
    };

    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
    };

    return (
      <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  // Remove local formatDate function - using formatDateTime from utils

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <AdminPageHeader
          title="Bildirim Yönetimi"
          description="Kullanıcı bildirimlerini oluşturun, yönetin ve gönderin"
          actions={
            <>
              <Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Ayarlar
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Bildirim
              </Button>
            </>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <TypographyLarge>
                    {notifications.filter(n => n.status === 'sent').length}
                  </TypographyLarge>
                  <div className="text-xs text-muted-foreground">Gönderildi</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-md">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <TypographyLarge>
                    {notifications.filter(n => n.status === 'scheduled').length}
                  </TypographyLarge>
                  <div className="text-xs text-muted-foreground">Zamanlandı</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-md">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <TypographyLarge>
                    {notifications.filter(n => n.status === 'draft').length}
                  </TypographyLarge>
                  <div className="text-xs text-muted-foreground">Taslak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-md">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <TypographyLarge>
                    {notifications.reduce((sum, n) => sum + n.total_recipients, 0)}
                  </TypographyLarge>
                  <div className="text-xs text-muted-foreground">Toplam Alıcı</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <AdminFilterSection
          fields={[
            {
              id: 'search',
              label: 'Arama',
              type: 'search',
              placeholder: 'Başlık, mesaj...',
              value: searchTerm,
              onChange: setSearchTerm
            },
            {
              id: 'status',
              label: 'Durum',
              type: 'select',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'Tüm Durumlar' },
                { value: 'draft', label: 'Taslak' },
                { value: 'scheduled', label: 'Zamanlandı' },
                { value: 'sent', label: 'Gönderildi' },
                { value: 'failed', label: 'Başarısız' }
              ]
            },
            {
              id: 'type',
              label: 'Tür',
              type: 'select',
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { value: 'all', label: 'Tüm Türler' },
                { value: 'info', label: 'Bilgi' },
                { value: 'warning', label: 'Uyarı' },
                { value: 'success', label: 'Başarılı' },
                { value: 'error', label: 'Hata' }
              ]
            }
          ]}
          onFilter={fetchNotifications}
          loading={loading}
        />

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Bildirimler</CardTitle>
            <CardDescription>
              Gönderilen ve planlanan bildirimlerinizi yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Yükleniyor...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-muted-foreground">Bildirim bulunamadı</div>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(notification.status)}
                          <TypographyH3>{notification.title}</TypographyH3>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(notification.status)}
                            {getTypeBadge(notification.type)}
                            {getPriorityBadge(notification.priority)}
                          </div>
                        </div>
                        
                        <TypographyP className="text-muted-foreground mb-3 line-clamp-2">
                          {notification.message}
                        </TypographyP>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              <strong>Hedef:</strong> {notification.target_type === 'all' ? 'Tüm Kullanıcılar' : notification.target_type}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>
                              <strong>Alıcı:</strong> {notification.total_recipients}
                            </span>
                          </div>
                          
                          {notification.status === 'sent' && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              <span>
                                <strong>Okunma:</strong> {notification.read_count}/{notification.total_recipients}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {notification.status === 'scheduled' && notification.scheduled_at
                                ? formatDateTime(notification.scheduled_at)
                                : notification.sent_at
                                ? formatDateTime(notification.sent_at)
                                : formatDateTime(notification.created_at)
                              }
                            </span>
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
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedNotification(notification);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                          
                          {notification.status === 'draft' && (
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Gönder
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Notification Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Bildirim Oluştur</DialogTitle>
              <DialogDescription>
                Kullanıcılara gönderilecek yeni bir bildirim oluşturun
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Bildirim başlığı"
                />
              </div>

              <div>
                <Label htmlFor="message">Mesaj *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Bildirim mesajı"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tür</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="info">Bilgi</option>
                    <option value="warning">Uyarı</option>
                    <option value="success">Başarılı</option>
                    <option value="error">Hata</option>
                  </select>
                </div>

                <div>
                  <Label>Öncelik</Label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Hedef Kitle</Label>
                <select
                  value={formData.target_type}
                  onChange={(e) => setFormData({...formData, target_type: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Tüm Kullanıcılar</option>
                  <option value="users">Normal Kullanıcılar</option>
                  <option value="admins">Adminler</option>
                  <option value="specific">Belirli Kullanıcılar</option>
                </select>
              </div>

              {formData.target_type === 'specific' && (
                <div>
                  <Label htmlFor="target_users">Hedef Kullanıcılar (virgülle ayır)</Label>
                  <Input
                    id="target_users"
                    value={formData.target_users}
                    onChange={(e) => setFormData({...formData, target_users: e.target.value})}
                    placeholder="user1, user2, user3"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="scheduled_at">Zamanlama (isteğe bağlı)</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="send_email"
                    checked={formData.send_email}
                    onCheckedChange={(checked) => setFormData({...formData, send_email: checked})}
                  />
                  <Label htmlFor="send_email">E-posta gönder</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="send_push"
                    checked={formData.send_push}
                    onCheckedChange={(checked) => setFormData({...formData, send_push: checked})}
                  />
                  <Label htmlFor="send_push">Push bildirimi gönder</Label>
                </div>
              </div>
            </div>

            <AdminModalFooter
              onCancel={() => setCreateDialogOpen(false)}
              onConfirm={handleCreateNotification}
              cancelText="İptal"
              confirmText={formData.scheduled_at ? 'Zamanla' : 'Gönder'}
              isConfirmDisabled={!formData.title || !formData.message}
            />
          </DialogContent>
        </Dialog>

        {/* View Notification Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bildirim Detayları - #{selectedNotification?.id}</DialogTitle>
            </DialogHeader>
            
            {selectedNotification && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Başlık</Label>
                    <TypographyP className="font-medium">{selectedNotification.title}</TypographyP>
                  </div>
                  <div>
                    <Label>Durum</Label>
                    <div>{getStatusBadge(selectedNotification.status)}</div>
                  </div>
                </div>

                <div>
                  <Label>Mesaj</Label>
                  <TypographyP className="whitespace-pre-wrap">{selectedNotification.message}</TypographyP>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tür</Label>
                    <div>{getTypeBadge(selectedNotification.type)}</div>
                  </div>
                  <div>
                    <Label>Öncelik</Label>
                    <div>{getPriorityBadge(selectedNotification.priority)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Toplam Alıcı</Label>
                    <TypographyP>{selectedNotification.total_recipients}</TypographyP>
                  </div>
                  {selectedNotification.status === 'sent' && (
                    <div>
                      <Label>Okunma Oranı</Label>
                      <TypographyP>{selectedNotification.read_count}/{selectedNotification.total_recipients} (%{Math.round((selectedNotification.read_count / selectedNotification.total_recipients) * 100)})</TypographyP>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Oluşturan</Label>
                  <TypographyP>{selectedNotification.created_by}</TypographyP>
                </div>

                <div>
                  <Label>Oluşturulma Tarihi</Label>
                  <TypographyP>{formatDateTime(selectedNotification.created_at)}</TypographyP>
                </div>

                {selectedNotification.sent_at && (
                  <div>
                    <Label>Gönderilme Tarihi</Label>
                    <TypographyP>{formatDateTime(selectedNotification.sent_at)}</TypographyP>
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