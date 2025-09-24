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
import { Textarea } from '@/components/ui/textarea';
import { AdminModalFooter } from '@/components/admin/modal-footer';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { LoadingButton } from '@/components/ui/loading-button';
import { 
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  Shield,
  Mail,
  Upload,
  Globe,
  Users,
  FileText,
  Clock,
  Smartphone,
  Key,
  Lock,
  Bell,
  Info
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { TypographyP, TypographyMuted } from '@/lib/typography';

interface SystemSettings {
  // General Settings
  site_name: string;
  site_description: string;
  site_url: string;
  contact_email: string;
  support_email: string;
  
  // File Upload Settings
  max_file_size: number; // in MB
  allowed_file_types: string[];
  max_images_per_post: number;
  image_quality: number; // compression percentage
  
  // User Settings
  registration_enabled: boolean;
  email_verification_required: boolean;
  pro_membership_enabled: boolean;
  user_profile_public: boolean;
  
  // Content Settings
  post_approval_required: boolean;
  comment_moderation: boolean;
  auto_delete_spam: boolean;
  profanity_filter_enabled: boolean;
  
  // Security Settings
  password_min_length: number;
  session_timeout: number; // in minutes
  max_login_attempts: number;
  account_lockout_duration: number; // in minutes
  two_factor_auth_enabled: boolean;
  
  // Notification Settings
  email_notifications: boolean;
  push_notifications: boolean;
  admin_notification_email: string;
  maintenance_notifications: boolean;
  
  // API Settings
  api_rate_limit: number; // requests per minute
  api_version: string;
  external_apis_enabled: boolean;
  
  // Maintenance
  maintenance_mode: boolean;
  maintenance_message: string;
  
  // Analytics
  analytics_enabled: boolean;
  google_analytics_id?: string;
  
  // Social Features
  social_sharing_enabled: boolean;
  public_profiles_enabled: boolean;
  friend_system_enabled: boolean;
}

const defaultSettings: SystemSettings = {
  site_name: 'Fishivo',
  site_description: 'Balıkçılar için sosyal platform',
  site_url: 'https://fishivo.com',
  contact_email: 'info@fishivo.com',
  support_email: 'support@fishivo.com',
  
  max_file_size: 10,
  allowed_file_types: ['jpg', 'jpeg', 'png', 'webp'],
  max_images_per_post: 5,
  image_quality: 80,
  
  registration_enabled: true,
  email_verification_required: true,
  pro_membership_enabled: true,
  user_profile_public: true,
  
  post_approval_required: false,
  comment_moderation: true,
  auto_delete_spam: true,
  profanity_filter_enabled: true,
  
  password_min_length: 8,
  session_timeout: 1440,
  max_login_attempts: 5,
  account_lockout_duration: 30,
  two_factor_auth_enabled: false,
  
  email_notifications: true,
  push_notifications: false,
  admin_notification_email: 'admin@fishivo.com',
  maintenance_notifications: true,
  
  api_rate_limit: 100,
  api_version: 'v1',
  external_apis_enabled: true,
  
  maintenance_mode: false,
  maintenance_message: 'Sistem bakımda. Lütfen daha sonra tekrar deneyin.',
  
  analytics_enabled: true,
  google_analytics_id: '',
  
  social_sharing_enabled: true,
  public_profiles_enabled: true,
  friend_system_enabled: true,
};

export default function SystemSettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Mock API call - replace with real API
      setTimeout(() => {
        setSettings(defaultSettings);
        setLoading(false);
        setError(null);
      }, 500);
      
      // Real API call would be:
      // const response = await fetch('/api/admin/settings');
      // if (!response.ok) throw new Error('Ayarlar alınamadı');
      // const data = await response.json();
      // setSettings(data.data);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setUnsavedChanges(true);
    setSuccess(null);
  };

  const handleArrayChange = (field: keyof SystemSettings, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, arrayValue);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // TODO: Implement real API call when backend endpoint is ready
      // For now, we'll just show an error message
      throw new Error('Ayarlar API\'si henüz hazır değil. Backend endpoint eklenmesi bekleniyor.');
      
      // Future implementation:
      // const response = await apiService.updateSystemSettings(settings);
      // if (response.success) {
      //   setUnsavedChanges(false);
      //   setSuccess('Ayarlar başarıyla kaydedildi');
      //   setError(null);
      // }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setUnsavedChanges(true);
    setSuccess(null);
    setConfirmDialogOpen(false);
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
        <AdminPageHeader
          title={
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('admin.settings.title')}
            </div>
          }
        />
            <TypographyP className="text-muted-foreground mt-1">
              {t('admin.settings.description')}
            </TypographyP>
          </div>
          <div className="flex items-center gap-3">
            {unsavedChanges && (
              <Badge variant="outline" className="border-orange-200 text-orange-800">
                {t('admin.settings.unsavedChanges')}
              </Badge>
            )}
            <LoadingButton
              variant="outline" 
              onClick={fetchSettings}
              loading={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh')}
            </LoadingButton>
            <LoadingButton
              onClick={saveSettings}
              disabled={!unsavedChanges}
              loading={saving}
              loadingText={t('admin.settings.saving')}
            >
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')}
            </LoadingButton>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <TypographyMuted>{t('admin.settings.loading')}</TypographyMuted>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('admin.settings.general.title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.settings.general.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">{t('admin.settings.general.siteName')}</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="Fishivo"
                  />
                </div>

                <div>
                  <Label htmlFor="site_description">{t('admin.settings.general.siteDescription')}</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    placeholder="Site açıklaması..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="site_url">{t('admin.settings.general.siteUrl')}</Label>
                  <Input
                    id="site_url"
                    value={settings.site_url}
                    onChange={(e) => handleInputChange('site_url', e.target.value)}
                    placeholder="https://fishivo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">{t('admin.settings.general.contactEmail')}</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="info@fishivo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="support_email">{t('admin.settings.general.supportEmail')}</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => handleInputChange('support_email', e.target.value)}
                    placeholder="support@fishivo.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t('admin.settings.upload.title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.settings.upload.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max_file_size">{t('admin.settings.upload.maxFileSize')}</Label>
                  <Input
                    id="max_file_size"
                    type="number"
                    value={settings.max_file_size}
                    onChange={(e) => handleInputChange('max_file_size', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="allowed_file_types">{t('admin.settings.upload.allowedFileTypes')}</Label>
                  <Input
                    id="allowed_file_types"
                    value={settings.allowed_file_types.join(', ')}
                    onChange={(e) => handleArrayChange('allowed_file_types', e.target.value)}
                    placeholder="jpg, jpeg, png, webp"
                  />
                </div>

                <div>
                  <Label htmlFor="max_images_per_post">{t('admin.settings.upload.maxImagesPerPost')}</Label>
                  <Input
                    id="max_images_per_post"
                    type="number"
                    value={settings.max_images_per_post}
                    onChange={(e) => handleInputChange('max_images_per_post', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <Label htmlFor="image_quality">{t('admin.settings.upload.imageQuality')}</Label>
                  <Input
                    id="image_quality"
                    type="number"
                    value={settings.image_quality}
                    onChange={(e) => handleInputChange('image_quality', parseInt(e.target.value))}
                    min="10"
                    max="100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* User Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('admin.settings.user.title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.settings.user.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="registration_enabled"
                    checked={settings.registration_enabled}
                    onChange={(e) => handleInputChange('registration_enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="registration_enabled">{t('admin.settings.user.allowRegistration')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="email_verification_required"
                    checked={settings.email_verification_required}
                    onChange={(e) => handleInputChange('email_verification_required', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="email_verification_required">{t('admin.settings.user.emailVerificationRequired')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pro_membership_enabled"
                    checked={settings.pro_membership_enabled}
                    onChange={(e) => handleInputChange('pro_membership_enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="pro_membership_enabled">{t('admin.settings.user.proMembershipEnabled')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="user_profile_public"
                    checked={settings.user_profile_public}
                    onChange={(e) => handleInputChange('user_profile_public', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="user_profile_public">{t('admin.settings.user.userProfilePublic')}</Label>
                </div>
              </CardContent>
            </Card>

            {/* Content Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('admin.settings.content.title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.settings.content.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="post_approval_required"
                    checked={settings.post_approval_required}
                    onChange={(e) => handleInputChange('post_approval_required', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="post_approval_required">{t('admin.settings.content.postApprovalRequired')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="comment_moderation"
                    checked={settings.comment_moderation}
                    onChange={(e) => handleInputChange('comment_moderation', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="comment_moderation">{t('admin.settings.content.commentModeration')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_delete_spam"
                    checked={settings.auto_delete_spam}
                    onChange={(e) => handleInputChange('auto_delete_spam', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="auto_delete_spam">{t('admin.settings.content.autoDeleteSpam')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="profanity_filter_enabled"
                    checked={settings.profanity_filter_enabled}
                    onChange={(e) => handleInputChange('profanity_filter_enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="profanity_filter_enabled">{t('admin.settings.content.profanityFilterEnabled')}</Label>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('admin.settings.security.title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.settings.security.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="password_min_length">{t('admin.settings.security.passwordMinLength')}</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    value={settings.password_min_length}
                    onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value))}
                    min="4"
                    max="32"
                  />
                </div>

                <div>
                  <Label htmlFor="session_timeout">{t('admin.settings.security.sessionTimeout')}</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={settings.session_timeout}
                    onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                    min="15"
                    max="10080"
                  />
                </div>

                <div>
                  <Label htmlFor="max_login_attempts">{t('admin.settings.security.maxLoginAttempts')}</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={settings.max_login_attempts}
                    onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>

                <div>
                  <Label htmlFor="account_lockout_duration">{t('admin.settings.security.accountLockoutDuration')}</Label>
                  <Input
                    id="account_lockout_duration"
                    type="number"
                    value={settings.account_lockout_duration}
                    onChange={(e) => handleInputChange('account_lockout_duration', parseInt(e.target.value))}
                    min="5"
                    max="1440"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="two_factor_auth_enabled"
                    checked={settings.two_factor_auth_enabled}
                    onChange={(e) => handleInputChange('two_factor_auth_enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="two_factor_auth_enabled">{t('admin.settings.security.twoFactorAuthEnabled')}</Label>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t('admin.settings.notifications.title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.settings.notifications.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="email_notifications"
                    checked={settings.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="email_notifications">{t('admin.settings.notifications.emailNotifications')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="push_notifications"
                    checked={settings.push_notifications}
                    onChange={(e) => handleInputChange('push_notifications', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="push_notifications">{t('admin.settings.notifications.pushNotifications')}</Label>
                </div>

                <div>
                  <Label htmlFor="admin_notification_email">{t('admin.settings.notifications.adminNotificationEmail')}</Label>
                  <Input
                    id="admin_notification_email"
                    type="email"
                    value={settings.admin_notification_email}
                    onChange={(e) => handleInputChange('admin_notification_email', e.target.value)}
                    placeholder="admin@fishivo.com"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenance_notifications"
                    checked={settings.maintenance_notifications}
                    onChange={(e) => handleInputChange('maintenance_notifications', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="maintenance_notifications">{t('admin.settings.notifications.maintenanceNotifications')}</Label>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('admin.settings.maintenance.title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.settings.maintenance.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    checked={settings.maintenance_mode}
                    onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="maintenance_mode" className="flex items-center gap-2">
                    {t('admin.settings.maintenance.maintenanceMode')}
                    {settings.maintenance_mode && (
                      <Badge variant="destructive" className="text-xs">
                        {t('admin.settings.maintenance.active')}
                      </Badge>
                    )}
                  </Label>
                </div>

                <div>
                  <Label htmlFor="maintenance_message">{t('admin.settings.maintenance.maintenanceMessage')}</Label>
                  <Textarea
                    id="maintenance_message"
                    value={settings.maintenance_message}
                    onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                    placeholder="Bakım mesajı..."
                    rows={3}
                  />
                </div>

                {settings.maintenance_mode && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700">
                      {t('admin.settings.maintenance.maintenanceModeWarning')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* API Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {t('admin.settings.api.title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.settings.api.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api_rate_limit">{t('admin.settings.api.rateLimit')}</Label>
                  <Input
                    id="api_rate_limit"
                    type="number"
                    value={settings.api_rate_limit}
                    onChange={(e) => handleInputChange('api_rate_limit', parseInt(e.target.value))}
                    min="10"
                    max="10000"
                  />
                </div>

                <div>
                  <Label htmlFor="api_version">{t('admin.settings.api.version')}</Label>
                  <Input
                    id="api_version"
                    value={settings.api_version}
                    onChange={(e) => handleInputChange('api_version', e.target.value)}
                    placeholder="v1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="external_apis_enabled"
                    checked={settings.external_apis_enabled}
                    onChange={(e) => handleInputChange('external_apis_enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="external_apis_enabled">{t('admin.settings.api.externalApisEnabled')}</Label>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setConfirmDialogOpen(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {t('admin.settings.resetToDefaults')}
          </Button>
          
          <div className="flex gap-3">
            <LoadingButton
              variant="outline" 
              onClick={fetchSettings}
              loading={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh')}
            </LoadingButton>
            <LoadingButton
              onClick={saveSettings}
              disabled={!unsavedChanges}
              loading={saving}
              loadingText={t('admin.settings.saving')}
            >
              <Save className="h-4 w-4 mr-2" />
              {t('admin.settings.saveAllSettings')}
            </LoadingButton>
          </div>
        </div>

        {/* Confirm Reset Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                {t('admin.settings.resetSettings')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.settings.resetConfirmMessage')}
              </DialogDescription>
            </DialogHeader>
            <AdminModalFooter
              onCancel={() => setConfirmDialogOpen(false)}
              onConfirm={resetToDefaults}
              cancelText={t('common.cancel')}
              confirmText={t('admin.settings.reset')}
              confirmVariant="destructive"
            />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}