import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  SuccessModal,
  AppHeader,
  ScreenContainer,
  ConfirmModal,
  CountryCitySelector
} from '@fishivo/ui';
import { theme } from '@fishivo/shared/theme';
import { apiService, ImageUploadService } from '@fishivo/shared/services';
import { useAuth } from '@fishivo/shared/contexts';

interface EditProfileScreenProps {
  navigation: any;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    username: '',
    bio: '',
    location: '',
    country: '',
    city: '',
    avatar: null,
    website: '',
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    twitter_url: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Profil güncellenirken bir hata oluştu');

  const imageUploadService = new ImageUploadService();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        console.error('❌ EditProfile: User ID not found, cannot load profile');
        return;
      }

      try {
        console.log(`🔍 EditProfile: Loading profile for user ID: ${user.id}`);
        const response = await apiService.getUserProfile(user.id);
        const profileData = response.data;
        
        if (profileData) {
          const locationParts = profileData.location ? profileData.location.split(', ') : [];
          const city = locationParts.length > 1 ? locationParts[0] : '';
          const country = locationParts.length > 1 ? locationParts[1] : locationParts[0] || '';
          
          setProfile({
            name: profileData.full_name || profileData.username || '',
            title: profileData.title || '',
            username: profileData.username || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            country: country,
            city: city,
            avatar: profileData.avatar_url || null,
            website: profileData.website || '',
            instagram_url: profileData.instagram_url || '',
            facebook_url: profileData.facebook_url || '',
            youtube_url: profileData.youtube_url || '',
            twitter_url: profileData.twitter_url || '',
          });
          
          // Eğer username null ise kullanıcıya uyarı göster
          if (!profileData.username) {
            setErrorMessage('Kullanıcı adınız henüz ayarlanmamış. Lütfen bir kullanıcı adı belirleyin.');
            setShowErrorModal(true);
          }
          
          console.log('✅ EditProfile: Profile loaded from API:', {
            name: profileData.full_name,
            bio: profileData.bio,
            username: profileData.username,
            title: profileData.title
          });
        } else {
          console.warn('⚠️ EditProfile: API returned no data, falling back to AuthContext');
          // Fallback to data from AuthContext
          const locationParts = user.location ? user.location.split(', ') : [];
          const city = locationParts.length > 1 ? locationParts[0] : '';
          const country = locationParts.length > 1 ? locationParts[1] : locationParts[0] || '';
          
          setProfile({
            name: user.full_name || user.name || '',
            title: user.title || '',
            username: user.username || '',
            bio: user.bio || '',
            location: user.location || '',
            country: country,
            city: city,
            avatar: user.avatar_url || null,
            website: user.website || '',
            instagram_url: user.instagram_url || '',
            facebook_url: user.facebook_url || '',
            youtube_url: user.youtube_url || '',
            twitter_url: user.twitter_url || '',
          });
        }
      } catch (error) {
        console.error('❌ EditProfile: Error loading profile:', error);
        setErrorMessage('Profil bilgileri yüklenirken bir hata oluştu.');
        setShowErrorModal(true);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Username kontrolü - sadece trim edilmiş hali boşsa hata ver
      if (!profile.username || profile.username.trim() === '') {
        setErrorMessage('Kullanıcı adı zorunludur ve boş bırakılamaz.');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      // Ülke ve şehir bilgisini location formatında birleştir
      const locationString = profile.city && profile.country 
        ? `${profile.city}, ${profile.country}`
        : profile.country || profile.location || '';
      
      // API'ye gönderilecek verileri hazırla  
      const updateDataRaw: any = {
        full_name: profile.name || '',
        username: profile.username.trim(), // Boşlukları temizle
        bio: profile.bio || '',
        title: profile.title || '',
        location: locationString || 'Konum belirtilmemiş',
        website: profile.website || '',
        instagram_url: profile.instagram_url || '',
        facebook_url: profile.facebook_url || '',
        youtube_url: profile.youtube_url || '',
        twitter_url: profile.twitter_url || '',
        ...(profile.avatar && { avatar_url: profile.avatar })
      };
      
      // Remove keys with empty string to satisfy backend validation (username hariç)
      const updateData: Record<string, any> = {};
      Object.entries(updateDataRaw).forEach(([k, v]) => {
        if (k === 'username' || v !== '') {
          updateData[k] = v;
        }
      });
      
      console.log('📤 Gönderilen profil verileri:', updateData);

      // API'ye güncelleme gönder
      const result = await apiService.updateProfile(updateData);
      console.log('✅ API yanıtı:', result);
      
      // AuthContext'i güncelle
      await updateProfile({
        full_name: profile.name || '',
        username: profile.username.trim(),
        bio: profile.bio || '',
        location: locationString,
        name: profile.name || ''
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      
      // Provide more detailed error messages
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('kullanıcı adı zaten kullanılıyor') || errorMessage.includes('username already taken')) {
          setErrorMessage('Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.');
        } else if (errorMessage.includes('e-posta adresi zaten kullanılıyor') || errorMessage.includes('email already taken')) {
          setErrorMessage('Bu e-posta adresi zaten kullanılıyor.');
        } else if (errorMessage.includes('username') && errorMessage.includes('required')) {
          setErrorMessage('Kullanıcı adı zorunludur ve boş bırakılamaz.');
        } else if (errorMessage.includes('username') && errorMessage.includes('alphanum')) {
          setErrorMessage('Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir.');
        } else if (errorMessage.includes('username') && errorMessage.includes('min')) {
          setErrorMessage('Kullanıcı adı en az 3 karakter olmalıdır.');
        } else if (errorMessage.includes('username') && errorMessage.includes('max')) {
          setErrorMessage('Kullanıcı adı en fazla 30 karakter olabilir.');
        } else if (errorMessage.includes('bio')) {
          setErrorMessage('Bio alanı ile ilgili bir hata oluştu');
        } else if (errorMessage.includes('title')) {
          setErrorMessage('Unvan alanı ile ilgili bir hata oluştu');
        } else if (errorMessage.includes('location')) {
          setErrorMessage('Konum alanı ile ilgili bir hata oluştu');
        } else if (errorMessage.includes('database operation failed')) {
          setErrorMessage('Veritabanı işlemi başarısız oldu. Lütfen tekrar deneyin.');
        } else if (errorMessage.includes('validation')) {
          setErrorMessage('Girilen bilgiler geçersiz. Lütfen kontrol edin.');
        } else {
          setErrorMessage(`Profil güncellenirken bir hata oluştu: ${error.message}`);
        }
      } else {
        setErrorMessage('Profil güncellenirken beklenmeyen bir hata oluştu');
      }
      
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const handleChangeAvatar = () => {
    setShowAvatarModal(true);
  };

  const handleCameraSelect = async () => {
    setShowAvatarModal(false);
    
    try {
      setIsUploadingAvatar(true);
      
      // Kameradan fotoğraf çek
      const imageResult = await imageUploadService.pickImage('camera');
      if (!imageResult || !imageResult.assets || imageResult.assets.length === 0) {
        return;
      }

      const imageUri = imageResult.assets[0].uri;
      if (!imageUri) return;

      // Token'ı al
      const token = await apiService.getToken();
      if (!token) {
        Alert.alert('Hata', 'Oturum bulunamadı');
        return;
      }

      // Fotoğrafı upload et
      const uploadResult = await imageUploadService.uploadImage(
        imageUri,
        { type: 'profile' },
        token
      );

      if (uploadResult.success && uploadResult.data) {
        // Avatar URL'ini güncelle
        const avatarUrl = uploadResult.data.variants.medium;
        setProfile(prev => ({ ...prev, avatar: avatarUrl }));
        
        // Backend'e kaydet
        await apiService.updateProfile({ avatar_url: avatarUrl });
        
        // AuthContext'i güncelle
        await updateProfile({ avatar_url: avatarUrl });
        
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi');
      } else {
        Alert.alert('Hata', uploadResult.error || 'Fotoğraf yüklenemedi');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Hata', 'Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleGallerySelect = async () => {
    setShowAvatarModal(false);
    
    try {
      setIsUploadingAvatar(true);
      
      // Galeriden fotoğraf seç
      const imageResult = await imageUploadService.pickImage('gallery');
      if (!imageResult || !imageResult.assets || imageResult.assets.length === 0) {
        return;
      }

      const imageUri = imageResult.assets[0].uri;
      if (!imageUri) return;

      // Token'ı al
      const token = await apiService.getToken();
      if (!token) {
        Alert.alert('Hata', 'Oturum bulunamadı');
        return;
      }

      // Fotoğrafı upload et
      const uploadResult = await imageUploadService.uploadImage(
        imageUri,
        { type: 'profile' },
        token
      );

      if (uploadResult.success && uploadResult.data) {
        // Avatar URL'ini güncelle
        const avatarUrl = uploadResult.data.variants.medium;
        setProfile(prev => ({ ...prev, avatar: avatarUrl }));
        
        // Backend'e kaydet
        await apiService.updateProfile({ avatar_url: avatarUrl });
        
        // AuthContext'i güncelle
        await updateProfile({ avatar_url: avatarUrl });
        
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi');
      } else {
        Alert.alert('Hata', uploadResult.error || 'Fotoğraf yüklenemedi');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Hata', 'Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Profili Düzenle"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>👤</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleChangeAvatar}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <Text style={{ color: theme.colors.background, fontSize: 12 }}>...</Text>
              ) : (
                <Icon name="camera" size={16} color={theme.colors.background} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>
            {isUploadingAvatar 
              ? 'Profil fotoğrafı yükleniyor...' 
              : 'Profil fotoğrafınızı değiştirmek için dokunun'
            }
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
              placeholder="Adınızı ve soyadınızı girin"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unvan</Text>
            <TextInput
              style={styles.input}
              value={profile.title}
              onChangeText={(text) => setProfile(prev => ({ ...prev, title: text }))}
              placeholder="Örn: Profesyonel Balıkçı, Amatör Balıkçı"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={profile.username}
              onChangeText={(text) => setProfile(prev => ({ ...prev, username: text.toLowerCase() }))}
              placeholder="Kullanıcı adınız"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
            <Text style={styles.usernameHint}>
              @{profile.username}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hakkında</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Kendiniz hakkında birkaç kelime yazın"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {profile.bio.length}/250
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konum</Text>
            <CountryCitySelector
              selectedCountry={profile.country}
              selectedCity={profile.city}
              onSelect={(country, city) => {
                setProfile(prev => ({ 
                  ...prev, 
                  country, 
                  city,
                  location: city ? `${city}, ${country}` : country
                }));
              }}
              placeholder="Ülke ve şehir seçin"
              style={styles.input}
            />
          </View>
          
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>Sosyal Medya Hesapları</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Web Sitesi</Text>
            <TextInput
              style={styles.input}
              value={profile.website}
              onChangeText={(text) => setProfile(prev => ({ ...prev, website: text }))}
              placeholder="Web siteniz (örn. https://www.example.com)"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <TextInput
              style={styles.input}
              value={profile.instagram_url}
              onChangeText={(text) => setProfile(prev => ({ ...prev, instagram_url: text }))}
              placeholder="Instagram kullanıcı adınız"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={profile.facebook_url}
              onChangeText={(text) => setProfile(prev => ({ ...prev, facebook_url: text }))}
              placeholder="Facebook kullanıcı adınız veya sayfanız"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>YouTube</Text>
            <TextInput
              style={styles.input}
              value={profile.youtube_url}
              onChangeText={(text) => setProfile(prev => ({ ...prev, youtube_url: text }))}
              placeholder="YouTube kanal adınız"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Twitter/X</Text>
            <TextInput
              style={styles.input}
              value={profile.twitter_url}
              onChangeText={(text) => setProfile(prev => ({ ...prev, twitter_url: text }))}
              placeholder="Twitter kullanıcı adınız"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </ScreenContainer>

      <SuccessModal
        visible={showSuccessModal}
        message="Profil bilgileriniz güncellendi"
        onClose={handleSuccessClose}
      />

      <SuccessModal
        visible={showErrorModal}
        title="Hata"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil Fotoğrafı Seç</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleCameraSelect}
              disabled={isUploadingAvatar}
            >
              <Icon name="camera" size={24} color={theme.colors.primary} />
              <Text style={styles.modalOptionText}>Kamera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleGallerySelect}
              disabled={isUploadingAvatar}
            >
              <Icon name="image" size={24} color={theme.colors.primary} />
              <Text style={styles.modalOptionText}>Galeri</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowAvatarModal(false)}
              disabled={isUploadingAvatar}
            >
              <Text style={styles.modalCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitleText: {
    fontSize: theme.typography.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.bold,
  },
  saveButtonContainer: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'flex-end',
  },
  saveButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.background,
    fontWeight: theme.typography.medium,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  avatarHint: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: theme.spacing.md,
  },
  usernameHint: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  characterCount: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: theme.spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  modalOptionText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  modalCancel: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  modalCancelText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
});

export default EditProfileScreen;