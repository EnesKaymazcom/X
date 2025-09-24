import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Icon,
  FishivoModal,
  AppHeader,
  ScreenContainer,
  CountryCitySelector,
  Button,
  IconButton,
  ProfileCoverSection,
  InputField,
  Skeleton,
  SkeletonItem,
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from '@/contexts/LanguageContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { getPhoneCodeByCountryCode } from '@/data/countriesWithPhoneCodes';
import { useEditProfile } from './useEditProfile';

interface EditProfileScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'EditProfile'>;
}

const { width: screenWidth } = Dimensions.get('window');

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  // Use custom hook for all business logic
  const {
    state,
    updateField,
    handleSave,
    handleAvatarUpload,
    handleCoverUpload,
    handleAvatarDelete,
    handleCoverDelete,
    openSocialMediaLink
  } = useEditProfile(navigation);

  // Handle save with navigation
  const onSave = useCallback(async () => {
    const success = await handleSave();
    if (success) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs', { screen: 'Profile' });
      }
    }
  }, [handleSave, navigation]);

  // Handle country/city selection
  const handleLocationSelect = useCallback((country: string, city: string, countryCode: string) => {
    const phoneCodeData = getPhoneCodeByCountryCode(countryCode);
    updateField('country', country);
    updateField('city', city);
    updateField('countryCode', countryCode);
    updateField('phoneCode', phoneCodeData.dialCode);
  }, [updateField]);

  // Loading state check
  const isLoading = state.loadingState === 'loading' || !state.imagesLoaded;

  // Skeleton screen with exact replicas of components
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('profile.edit.title')}
          leftButtons={[
            {
              icon: 'arrow-left',
              onPress: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('MainTabs', { screen: 'Profile' });
                }
              }
            }
          ]}
          rightComponent={
            <View style={styles.headerRow}>
              <IconButton
                icon="settings"
                onPress={() => navigation.navigate('Settings')}
                size="sm"
              />
              <Button
                variant="primary"
                size="sm"
                onPress={onSave}
                disabled={true}
              >
                {t('profile.edit.save')}
              </Button>
            </View>
          }
        />
        <ScreenContainer paddingVertical="none">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}>
            
            <View style={styles.coverContainer}>
              <Skeleton>
                <SkeletonItem 
                  width="100%" 
                  height={screenWidth * 0.32} 
                  borderRadius={theme.borderRadius.md} 
                />
              </Skeleton>
              
              <View style={styles.profileSectionSkeleton}>
                <View style={styles.avatarSkeletonWrapper}>
                  <View style={[styles.avatarSkeletonBorder, {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  }]}>
                    <Skeleton>
                      <SkeletonItem 
                        width={69}
                        height={69}
                        borderRadius={34.5}
                      />
                    </Skeleton>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Skeleton>
                <SkeletonItem width={120} height={11} marginBottom={theme.spacing.md} marginTop={theme.spacing.xs} borderRadius={4} />
              </Skeleton>
              
              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={102} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>

              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={82} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>

              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={62} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <View style={styles.bioSkeletonWrapper}>
                  <Skeleton>
                    <SkeletonItem width="100%" height={128} borderRadius={theme.borderRadius.md} />
                  </Skeleton>
                  <View style={[styles.characterCountSkeleton, { bottom: theme.spacing.xs, right: theme.spacing.sm }]}>
                    <Skeleton>
                      <SkeletonItem width={40} height={12} borderRadius={4} />
                    </Skeleton>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem flexDirection="row" alignItems="center" gap={theme.spacing.xs}>
                      <SkeletonItem width={18} height={18} borderRadius={4} />
                      <SkeletonItem width={70} height={13} borderRadius={4} />
                    </SkeletonItem>
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>
              
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem flexDirection="row" alignItems="center" gap={theme.spacing.xs}>
                      <SkeletonItem width={18} height={18} borderRadius={4} />
                      <SkeletonItem width={60} height={13} borderRadius={4} />
                    </SkeletonItem>
                  </Skeleton>
                </View>
                <View style={styles.phoneInputWrapper}>
                  <View style={styles.phoneCodeContainer}>
                    <Skeleton>
                      <SkeletonItem width={110} height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                    </Skeleton>
                  </View>
                  <View style={styles.phoneNumberContainer}>
                    <Skeleton>
                      <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                    </Skeleton>
                  </View>
                </View>
              </View>
              
              <View style={styles.sectionTitle}>
                <Skeleton>
                  <SkeletonItem width={100} height={11} borderRadius={4} />
                </Skeleton>
              </View>
              
              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={77} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>
              
              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={92} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>
              
              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={82} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>
              
              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={77} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>
              
              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={22} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>
              
              <View style={styles.skeletonInputContainer}>
                <View style={styles.labelRow}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={67} height={13} borderRadius={4} />
                  </Skeleton>
                </View>
                <Skeleton>
                  <SkeletonItem width="100%" height={Platform.OS === 'android' ? 44 : 48} borderRadius={theme.borderRadius.md} />
                </Skeleton>
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </View>
    );
  }

  // Main render
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('profile.edit.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            }
          }
        ]}
        rightComponent={
          <View style={styles.headerRow}>
            <IconButton
              icon="settings"
              onPress={() => navigation.navigate('Settings')}
              size="sm"
            />
            <Button
              variant="primary"
              size="sm"
              onPress={onSave}
              disabled={state.loadingState === 'saving'}
            >
              {state.loadingState === 'saving' ? t('profile.edit.saving') : t('profile.edit.save')}
            </Button>
          </View>
        }
      />
      <ScreenContainer paddingVertical="none">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}>
          {/* Profile Cover Section */}
          <ProfileCoverSection
            coverImage={state.profile.cover_image_url || undefined}
            avatar={state.profile.avatar_url || undefined}
            name={state.profile.name || state.profile.username || t('profile.edit.displayName')}
            isEditMode={true}
            onAvatarPress={handleAvatarUpload}
            onCoverImagePress={handleCoverUpload}
            onDeleteAvatar={state.profile.avatar_url ? handleAvatarDelete : undefined}
            onDeleteCover={state.profile.cover_image_url ? handleCoverDelete : undefined}
            isLoadingAvatar={state.avatarUploadState === 'uploading'}
            isLoadingCover={state.coverUploadState === 'uploading'}
          />

              <View style={styles.formSection}>
            <Text style={styles.sectionHeader}>{t('profile.edit.basicInfo')}</Text>
            
            {/* Name Field */}
            <InputField
              label={t('profile.edit.displayName')}
              leftIcon="user"
              value={state.profile.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder={t('profile.edit.displayName')}
              error={state.validationErrors.name}
            />

            {/* Username Field */}
            <InputField
              label={t('profile.edit.username')}
              leftIcon="at-sign"
              value={state.profile.username}
              onChangeText={(text) => updateField('username', text.toLowerCase())}
              placeholder={t('profile.edit.username')}
              error={state.validationErrors.username}
              autoCapitalize="none"
            />

            {/* Bio Field */}
            <InputField
              label={t('profile.edit.bio')}
              leftIcon="file-text"
              value={state.profile.bio}
              onChangeText={(text) => updateField('bio', text)}
              placeholder={t('profile.edit.bioPlaceholder')}
              error={state.validationErrors.bio}
              multiline
              numberOfLines={4}
              characterLimit={250}
            />

            {/* Location Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="map-pin" size={18} color={theme.colors.primary} />
                <Text style={styles.label}>{t('profile.edit.location')}</Text>
              </View>
              <CountryCitySelector
                selectedCountry={state.profile.country}
                selectedCity={state.profile.city}
                onSelect={handleLocationSelect}
                placeholder={t('profile.edit.locationPlaceholder')}
                style={[
                  styles.input,
                  Platform.OS === 'android' ? styles.inputAndroid : styles.inputIOS
                ]}
              />
            </View>
            
            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="smartphone" size={18} color={theme.colors.primary} />
                <Text style={styles.label}>{t('profile.edit.phone')}</Text>
              </View>
              <View style={styles.phoneInputWrapper}>
                <View style={styles.phoneCodeContainer}>
                  <CountryCitySelector
                    selectedCountry={state.profile.countryCode}
                    selectedCity=""
                    onSelect={() => {}}
                    mode="phoneCode"
                    selectedPhoneCode={state.profile.phoneCode}
                    onPhoneCodeSelect={(dialCode, _countryCode) => {
                      updateField('phoneCode', dialCode);
                    }}
                    style={[styles.phoneCodeSelector, Platform.OS === 'android' ? styles.inputAndroid : styles.inputIOS]}
                  />
                </View>
                <View style={styles.phoneNumberContainer}>
                  <InputField
                    value={state.profile.phone}
                    onChangeText={(text) => updateField('phone', text)}
                    placeholder={t('profile.edit.phonePlaceholder')}
                    error={state.validationErrors.phone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    containerStyle={styles.phoneInputContainer}
                  />
                </View>
              </View>
            </View>
            
            {/* Social Media Section */}
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>{t('profile.edit.socialMedia')}</Text>
            </View>
            
            {/* Website */}
            <InputField
              label={t('profile.edit.website')}
              leftIcon="globe"
              value={state.profile.website}
              onChangeText={(text) => updateField('website', text)}
              placeholder={t('profile.edit.websitePlaceholder')}
              keyboardType="url"
              autoCapitalize="none"
              rightIcon={state.profile.website?.trim() ? 'eye' : undefined}
              onRightIconPress={state.profile.website?.trim() ? () => openSocialMediaLink('website', state.profile.website) : undefined}
            />
            
            {/* Instagram */}
            <InputField
              label="Instagram"
              leftIcon="instagram"
              value={state.profile.instagram_url}
              onChangeText={(text) => updateField('instagram_url', text)}
              placeholder={t('profile.edit.instagramPlaceholder')}
              autoCapitalize="none"
              rightIcon={state.profile.instagram_url?.trim() ? 'eye' : undefined}
              onRightIconPress={state.profile.instagram_url?.trim() ? () => openSocialMediaLink('instagram', state.profile.instagram_url) : undefined}
            />
            
            {/* Facebook */}
            <InputField
              label="Facebook"
              leftIcon="facebook"
              value={state.profile.facebook_url}
              onChangeText={(text) => updateField('facebook_url', text)}
              placeholder={t('profile.edit.facebookPlaceholder')}
              autoCapitalize="none"
              rightIcon={state.profile.facebook_url?.trim() ? 'eye' : undefined}
              onRightIconPress={state.profile.facebook_url?.trim() ? () => openSocialMediaLink('facebook', state.profile.facebook_url) : undefined}
            />
            
            {/* YouTube */}
            <InputField
              label="YouTube"
              leftIcon="youtube"
              value={state.profile.youtube_url}
              onChangeText={(text) => updateField('youtube_url', text)}
              placeholder={t('profile.edit.youtubePlaceholder')}
              autoCapitalize="none"
              rightIcon={state.profile.youtube_url?.trim() ? 'eye' : undefined}
              onRightIconPress={state.profile.youtube_url?.trim() ? () => openSocialMediaLink('youtube', state.profile.youtube_url) : undefined}
            />
            
            {/* X (Twitter) */}
            <InputField
              label="X"
              leftIcon="x-logo"
              value={state.profile.twitter_url}
              onChangeText={(text) => updateField('twitter_url', text)}
              placeholder={t('profile.edit.twitterPlaceholder')}
              autoCapitalize="none"
              rightIcon={state.profile.twitter_url?.trim() ? 'eye' : undefined}
              onRightIconPress={state.profile.twitter_url?.trim() ? () => openSocialMediaLink('twitter', state.profile.twitter_url) : undefined}
            />
            
            {/* TikTok */}
            <InputField
              label="TikTok"
              leftIcon="tiktok"
              value={state.profile.tiktok_url}
              onChangeText={(text) => updateField('tiktok_url', text)}
              placeholder={t('profile.edit.tiktokPlaceholder')}
              autoCapitalize="none"
              rightIcon={state.profile.tiktok_url?.trim() ? 'eye' : undefined}
              onRightIconPress={state.profile.tiktok_url?.trim() ? () => openSocialMediaLink('tiktok', state.profile.tiktok_url) : undefined}
            />
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* Error Modal */}
      <FishivoModal
        visible={!!state.error}
        onClose={() => updateField('username', state.profile.username)} // Clear error
        preset="error"
        title={t('common.error')}
        description={state.error || ''}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => updateField('username', state.profile.username)
        }}
      />
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollViewContent: {
    paddingBottom: theme.spacing.xl,
  },
  formSection: {
    paddingHorizontal: 0,
    paddingTop: theme.spacing.md,
  },
  sectionHeader: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  sectionTitleText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Platform.OS === 'android' ? theme.spacing.xs : theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputWithIcon: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Platform.OS === 'android' ? theme.spacing.xs : theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto',
  },
  iconButton: {
    padding: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  textArea: {
    height: 100,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  textAreaWrapper: {
    position: 'relative',
  },
  usernameHint: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  characterCount: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    right: theme.spacing.sm,
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.typography.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  phoneCodeContainer: {
    width: 110,
  },
  phoneCodeSelector: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  phoneNumberContainer: {
    flex: 1,
  },
  phoneInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coverContainer: {
    width: '100%',
  },
  profileSectionSkeleton: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  avatarSkeletonWrapper: {
    marginTop: -(69 / 2),
  },
  avatarSkeletonBorder: {
    padding: 3,
    borderRadius: (69 + 6) / 2,
    borderWidth: 1,
  },
  bioSkeletonWrapper: {
    position: 'relative',
  },
  characterCountSkeleton: {
    position: 'absolute',
  },
  inputAndroid: {
    minHeight: 44,
    paddingVertical: theme.spacing.sm,
  },
  inputIOS: {
    minHeight: 48,
    paddingVertical: theme.spacing.md,
  },
  phoneInputContainer: {
    marginBottom: 0,
  },
  skeletonInputContainer: {
    marginBottom: theme.spacing.md,
  },
});

export default EditProfileScreen;