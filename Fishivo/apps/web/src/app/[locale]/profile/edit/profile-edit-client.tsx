'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProBadge, ProMembershipCard } from '@/components/ui/pro-badge';
// import { apiService } from '@fishivo/services/web';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import { createSupabaseBrowserClient } from '@fishivo/api/client/supabase.web';
import { useI18n } from '@/lib/i18n';
import { TypographyH2, TypographyH4, TypographyMuted } from '@/lib/typography';
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Instagram,
  Facebook,
  Youtube,
  Save,
  Camera,
  Settings,
  Shield,
  Bell,
  Navigation,
  Calendar,
  Clock,
} from 'lucide-react';
import { XIcon } from '@/components/icons/x-icon';
import { ProfileCard } from '@/components/ui/profile-card';

interface ProfileEditClientProps {
  user: any;
  profileData: any;
}

export default function ProfileEditClient({
  user,
  profileData,
}: ProfileEditClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    email: user.email || '',
    username: profileData?.username || '',
    full_name: profileData?.full_name || '',
    bio: profileData?.bio || '',
    location: profileData?.location || '',
    phone: profileData?.phone || '',
    website: profileData?.website || '',
    title: profileData?.title || '',
    instagram_url: profileData?.instagram_url || '',
    facebook_url: profileData?.facebook_url || '',
    youtube_url: profileData?.youtube_url || '',
    twitter_url: profileData?.twitter_url || '',
    avatar_url: profileData?.avatar_url || '',
    privacy_settings: profileData?.privacy_settings || {
      profile: 'public',
      catches: 'public',
      location: 'friends',
    },
    notification_settings: profileData?.notification_settings || {
      likes: true,
      comments: true,
      follows: true,
      messages: true,
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsLoading(true);
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar_url: reader.result as string // Geçici preview
        }));
      };
      reader.readAsDataURL(file);
      
      // FormData oluştur
      const formData = new FormData();
      formData.append('avatar', file);
      
      // API'ye gönder
      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const { avatar_url, avatarUrls } = await response.json();
      
      // Form state'i güncelle - avatar_url artık string
      setFormData(prev => ({
        ...prev,
        avatar_url: avatar_url  // Primary URL (string)
      }));
      
      toast.success(t('profile.avatarUpdated') || 'Profil fotoğrafı başarıyla güncellendi');
      
      // Supabase auth metadata'yı da güncelle
      await supabase.auth.updateUser({
        data: { avatar_url: avatar_url }  // Primary URL (string)
      });
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || t('profile.avatarUploadError') || 'Fotoğraf yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMediaChange = (platform: string, username: string) => {
    // Kullanıcının girdiği username'i temizle
    const cleanUsername = username.replace(/[^a-zA-Z0-9._]/g, '');

    // Platforma göre URL oluştur
    let fullUrl = '';
    if (cleanUsername) {
      switch (platform) {
        case 'instagram':
          fullUrl = `https://instagram.com/${cleanUsername}`;
          break;
        case 'facebook':
          fullUrl = `https://facebook.com/${cleanUsername}`;
          break;
        case 'youtube':
          fullUrl = `https://youtube.com/@${cleanUsername}`;
          break;
        case 'twitter':
          fullUrl = `https://x.com/${cleanUsername}`;
          break;
      }
    }

    handleInputChange(`${platform}_url`, fullUrl);
  };

  const getSocialUsername = (url: string, platform: string) => {
    if (!url) return '';

    // URL'den username'i çıkar
    const patterns = {
      instagram: /instagram\.com\/([^/?]+)/,
      facebook: /facebook\.com\/([^/?]+)/,
      youtube: /youtube\.com\/@([^/?]+)/,
      twitter: /(?:twitter|x)\.com\/([^/?]+)/,
    };

    const match = url.match(patterns[platform as keyof typeof patterns]);
    return match ? match[1] : '';
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);

    try {
      if (!navigator.geolocation) {
        throw new Error(t('errors.geolocationNotSupported'));
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        },
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocoding için basit bir çözüm (ücretsiz)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`,
      );

      if (!response.ok) throw new Error(t('errors.locationFetchFailed'));

      const data = await response.json();
      const locationString = `${data.city || data.locality || ''}, ${
        data.countryName || ''
      }`
        .replace(/^,\s*/, '') // Başındaki virgülü temizle
        .replace(/,\s*$/, ''); // Sonundaki virgülü temizle

      handleInputChange('location', locationString);
    } catch (error: any) {
      console.error('Location error:', error);
      let errorMessage = t('errors.locationFetchFailed');

      if (error.code === 1) {
        errorMessage = t('errors.locationAccessDenied');
      } else if (error.code === 2) {
        errorMessage = t('errors.locationUnavailable');
      } else if (error.code === 3) {
        errorMessage = t('errors.locationTimeout');
      }

      toast.error(errorMessage);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {

      // Email değişikliği için Supabase auth
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (emailError) throw emailError;
      }

      // Profil bilgilerini güncelle
      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
          website: formData.website,
          title: formData.title,
          instagram_url: formData.instagram_url,
          facebook_url: formData.facebook_url,
          youtube_url: formData.youtube_url,
          twitter_url: formData.twitter_url,
          avatar_url: formData.avatar_url,
          privacy_settings: formData.privacy_settings,
          notification_settings: formData.notification_settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the page to update navbar
      window.location.reload();

      // Success message
      toast.success(t('profileEdit.profileUpdated'));
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(t('profileEdit.errorUpdating') + ': ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileData) {
    return <NoProfileFound user={user} />;
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <TypographyH2 className="mb-2">
            {t('profileEdit.title')}
          </TypographyH2>
          <TypographyMuted>
            {t('profileEdit.subtitle')}
          </TypographyMuted>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Profil Özeti */}
          <div className="lg:col-span-1">
            <ProfileCard 
              profileData={profileData}
              formData={formData}
              isEditable={true}
              onAvatarUpload={handleAvatarUpload}
            />
          </div>

          {/* Sağ Kolon - Düzenleme Formu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('profileEdit.tabs.general')}
                </CardTitle>
                <CardDescription>
                  {t('profileEdit.generalDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      {t('common.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username" className="mb-2 block">
                      {t('profileEdit.general.username')}
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={e =>
                        handleInputChange('username', e.target.value)
                      }
                      placeholder={t('profileEdit.general.usernamePlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name" className="mb-2 block">
                      {t('profileEdit.general.fullName')}
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={e =>
                        handleInputChange('full_name', e.target.value)
                      }
                      placeholder={t('profileEdit.general.fullNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="title" className="mb-2 block">
                      {t('profileEdit.general.title')}
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder={t('profileEdit.general.titlePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="mb-2 block">
                    {t('profileEdit.general.bio')}
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={e => handleInputChange('bio', e.target.value)}
                    placeholder={t('profileEdit.general.bioPlaceholder')}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="mb-2 block">
                    {t('profileEdit.general.location')}
                  </Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={e =>
                          handleInputChange('location', e.target.value)
                        }
                        placeholder={t('profileEdit.general.locationPlaceholder')}
                        className="flex-1"
                      />
                      <LoadingButton
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={getCurrentLocation}
                        loading={locationLoading}
                        title={t('profileEdit.general.currentLocation')}
                      >
                        {!locationLoading && <Navigation className="w-4 h-4" />}
                      </LoadingButton>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('profileEdit.general.locationHelp')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="mb-2 block">
                      {t('profileEdit.general.phone')}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      placeholder={t('profileEdit.general.phonePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="mb-2 block">
                      {t('profileEdit.general.website')}
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={e =>
                        handleInputChange('website', e.target.value)
                      }
                      placeholder={t('profileEdit.general.websitePlaceholder')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sosyal Medya */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t('profileEdit.general.socialLinks')}
                </CardTitle>
                <CardDescription>
                  {t('profileEdit.socialMediaDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="instagram_url"
                      className="flex items-center gap-2 mb-2"
                    >
                      <Instagram className="w-4 h-4" />
                      {t('profileEdit.general.instagram')}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        @
                      </span>
                      <Input
                        id="instagram_url"
                        value={getSocialUsername(
                          formData.instagram_url,
                          'instagram',
                        )}
                        onChange={e =>
                          handleSocialMediaChange('instagram', e.target.value)
                        }
                        placeholder={t('profileEdit.general.usernamePlaceholder')}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="facebook_url"
                      className="flex items-center gap-2 mb-2"
                    >
                      <Facebook className="w-4 h-4" />
                      {t('profileEdit.general.facebook')}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        @
                      </span>
                      <Input
                        id="facebook_url"
                        value={getSocialUsername(
                          formData.facebook_url,
                          'facebook',
                        )}
                        onChange={e =>
                          handleSocialMediaChange('facebook', e.target.value)
                        }
                        placeholder={t('profileEdit.general.usernamePlaceholder')}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="youtube_url"
                      className="flex items-center gap-2 mb-2"
                    >
                      <Youtube className="w-4 h-4" />
                      {t('profileEdit.general.youtube')}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        @
                      </span>
                      <Input
                        id="youtube_url"
                        value={getSocialUsername(
                          formData.youtube_url,
                          'youtube',
                        )}
                        onChange={e =>
                          handleSocialMediaChange('youtube', e.target.value)
                        }
                        placeholder={t('profileEdit.general.usernamePlaceholder')}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="twitter_url"
                      className="flex items-center gap-2 mb-2"
                    >
                      <XIcon className="w-4 h-4" />
                      {t('profileEdit.general.twitter')}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        @
                      </span>
                      <Input
                        id="twitter_url"
                        value={getSocialUsername(
                          formData.twitter_url,
                          'twitter',
                        )}
                        onChange={e =>
                          handleSocialMediaChange('twitter', e.target.value)
                        }
                        placeholder={t('profileEdit.general.usernamePlaceholder')}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kaydet Butonu */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    {t('common.cancel')}
                  </Button>
                  <LoadingButton
                    onClick={handleSave}
                    loading={isLoading}
                    loadingText={t('profileEdit.saving')}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {t('profileEdit.saveChanges')}
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// No Profile Found component
function NoProfileFound({ user }: { user: any }) {
  const { t } = useI18n();
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const triggerFailed = searchParams?.get('trigger_failed') === 'true';
  const isSetup = searchParams?.get('setup') === 'true';

  return (
    <div className="text-center py-8">
      <TypographyH4 className="mb-2">
        {t('profileEdit.profileNotFound')}
      </TypographyH4>

      {triggerFailed ? (
        <div className="mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="text-yellow-800">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <TypographyMuted className="text-yellow-800">
                  {t('profileEdit.profileAutoCreateFailed')}
                </TypographyMuted>
                <p className="text-sm text-yellow-700 mt-1">
                  {t('profileEdit.profileAutoCreateFailedDesc')}
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            {t('profileEdit.systemTriggersFailed')}
          </p>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">
          {t('profileEdit.profileNotFoundInDb')}
        </p>
      )}

      <p className="text-sm text-gray-500 mb-6">
        {t('profileEdit.manualProfileCreateInfo')}
      </p>

      <CreateUserButton user={user} triggerFailed={triggerFailed} />
    </div>
  );
}

// Client component for user creation
function CreateUserButton({
  user,
  triggerFailed = false,
}: {
  user: any;
  triggerFailed?: boolean;
}) {
  const { t } = useI18n();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateUser = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate username from email
      const baseUsername = user.email?.split('@')[0] || 'user';
      const cleanUsername = baseUsername
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .substring(0, 20);

      // Use supabase from hook (already declared above)

      const userData = {
        id: user.id,
        email: user.email,
        username: cleanUsername,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('❌ Manual user creation error:', error);

        if (error.code === '23505' && error.message.includes('username')) {
          // Username conflict, try with timestamp
          const timestampUsername = `${cleanUsername}_${Date.now()
            .toString()
            .slice(-4)}`;
          userData.username = timestampUsername;

          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

          if (retryError) {
            throw retryError;
          }

          setSuccess(true);
          // Redirect to new profile after 2 seconds
          setTimeout(() => {
            window.location.href = `/${timestampUsername}`;
          }, 2000);
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        // Redirect to new profile after 2 seconds
        setTimeout(() => {
          window.location.href = `/${userData.username}`;
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ User creation failed:', err);
      setError(err.message || t('profileEdit.profileCreateError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="text-green-600 mb-2">
          {t('profileEdit.profileCreateSuccess')}
        </div>
        <div className="text-sm text-gray-500">
          {t('profileEdit.redirectingToProfile')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LoadingButton
        onClick={handleCreateUser}
        loading={loading}
        className={
          triggerFailed
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        }
        loadingText={t('profileEdit.creatingProfile')}
      >
        {triggerFailed
          ? t('profileEdit.retryManual')
          : t('profileEdit.createProfile')}
      </LoadingButton>

      {error && <div className="text-red-600 text-sm">❌ {t('profileEdit.error')}: {error}</div>}
    </div>
  );
}
