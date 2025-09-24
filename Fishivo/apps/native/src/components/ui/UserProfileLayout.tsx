import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import Icon from '@/components/ui/Icon';
import ProfileHeader from '@/components/ui/ProfileHeader';
import ProfileCoverSection from '@/components/ui/ProfileCoverSection';
import { StatsRow } from '@/components/ui/StatsRow';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { getCountryWithPhoneCodeByCode } from '@/data/countriesWithPhoneCodes';
import { Theme } from '@/theme';
import InAppBrowser from 'react-native-inappbrowser-reborn';

interface UserProfileLayoutProps {
  userData: {
    name: string;
    username?: string;
    avatar?: string;
    coverImage?: string;
    location: string;
    countryCode?: string;
    catchCount: number;
    followers: number;
    following: number;
    bio: string;
    isPro?: boolean;
    instagram_url?: string;
    facebook_url?: string;
    youtube_url?: string;
    twitter_url?: string;
    tiktok_url?: string;
    website?: string;
  };
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onPrimaryAction: () => void;
  onShareAction: () => void;
  onFollowToggle?: () => void;
  onProPress?: () => void;
  onFindFriends?: () => void;
  onCoverImagePress?: () => void;
  _onCoverImagePress?: () => void;
  noPadding?: boolean;
  _noPadding?: boolean;
  followDisabled?: boolean;
  onStatPress?: (index: number, stat: { value: number; label: string }) => void;
}

const UserProfileLayout: React.FC<UserProfileLayoutProps> = ({
  userData,
  isOwnProfile = false,
  isFollowing = false,
  onPrimaryAction,
  onShareAction,
  onFollowToggle,
  onProPress,
  onFindFriends,
  _onCoverImagePress,
  _noPadding = false,
  followDisabled = false,
  onStatPress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const renderCountryFlag = (countryCode: string) => {
    try {
      const code = countryCode.toUpperCase();
      // Dinamik import için ülke kodunu camelCase yap (TR -> Tr, US -> Us)
      const flagName = code.charAt(0) + code.slice(1).toLowerCase();
      const Flags = require('react-native-svg-circle-country-flags');
      const FlagComponent = Flags[flagName];
      
      if (FlagComponent && typeof FlagComponent === 'function') {
        return <FlagComponent width={16} height={16} />;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
  const styles = createStyles(theme);

  const openSocialMediaLink = async (platform: string, url: string) => {
    if (!url || url.trim() === '') return;

    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          dismissButtonStyle: 'close',
          preferredBarTintColor: theme.colors.surface,
          preferredControlTintColor: theme.colors.primary,
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'automatic',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          showTitle: true,
        });
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
    }
  };

  return (
    <View style={styles.container}>
      {/* Cover Section Component */}
      <ProfileCoverSection
        coverImage={userData.coverImage}
        avatar={userData.avatar}
        name={userData.name}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onButtonPress={isOwnProfile ? onPrimaryAction : onFollowToggle}
        onSharePress={onShareAction}
        onFindFriendsPress={onFindFriends}
        followDisabled={followDisabled}
      />

      {/* Stats */}
      <View style={styles.statsSection}>
        <StatsRow
          stats={[
            { value: userData.catchCount || 0, label: t('profile.stats.catches') },
            { value: userData.followers || 0, label: t('profile.stats.followers') },
            { value: userData.following || 0, label: t('profile.stats.following') }
          ]}
          onStatPress={onStatPress}
        />
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <ProfileHeader 
          name={userData.name}
          username={userData.username}
          isPro={userData.isPro}
          nameSize="lg"
          onProPress={onProPress}
          showUsername={true}
          hasContentBelow={!!(userData.location || userData.bio)}
          socialMedia={{
            website: userData.website,
            instagram_url: userData.instagram_url,
            facebook_url: userData.facebook_url,
            youtube_url: userData.youtube_url,
            twitter_url: userData.twitter_url,
            tiktok_url: userData.tiktok_url,
          }}
          onSocialMediaPress={openSocialMediaLink}
        />
        
        {(userData.location || userData.countryCode) && (
          <View style={styles.locationRow}>
            <Icon name="map-pin" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.locationText}>
              {userData.location}
              {userData.location && userData.countryCode && ', '}
              {userData.countryCode && t(`locations.countries.${userData.countryCode}`, { defaultValue: userData.countryCode })}
            </Text>
            {userData.countryCode && (
              <View style={styles.flagContainer}>
                {renderCountryFlag(userData.countryCode)}
              </View>
            )}
          </View>
        )}
        
        {userData.bio && (
          <Text style={styles.bioText}>{userData.bio}</Text>
        )}
      </View>

    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsSection: {},
  profileInfo: {
    paddingVertical: theme.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  flagContainer: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    lineHeight: 20,
    marginTop: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default UserProfileLayout;