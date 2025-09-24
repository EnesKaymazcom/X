import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ProBadge from '@/components/ui/ProBadge';
import Icon from '@/components/ui/Icon';
import { theme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileHeaderProps {
  name: string;
  username?: string;
  isPro?: boolean;
  onProPress?: () => void;
  nameSize?: 'sm' | 'md' | 'lg';
  showUsername?: boolean;
  hasContentBelow?: boolean;
  socialMedia?: {
    website?: string;
    instagram_url?: string;
    facebook_url?: string;
    youtube_url?: string;
    twitter_url?: string;
    tiktok_url?: string;
  };
  onSocialMediaPress?: (platform: string, username: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  username,
  isPro = false,
  onProPress,
  hasContentBelow = true,
  socialMedia,
  onSocialMediaPress,
}) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      {/* Username + PRO Badge + Social Media */}
      <View style={[styles.nameRow, {
        marginTop: hasContentBelow ? theme.spacing.xs : theme.spacing.sm,
        marginBottom: hasContentBelow ? theme.spacing.xs : theme.spacing.sm
      }]}>
        <Text style={styles.usernameText}>
          @{username || name.toLowerCase().replace(/\s+/g, '')}
        </Text>
        {isPro && (
          <ProBadge 
            variant="icon" 
            size="sm" 
            showText={false}
            onPress={onProPress}
          />
        )}
        {socialMedia && onSocialMediaPress && (
          <View style={styles.socialMediaInline}>
            {socialMedia.website && (
              <TouchableOpacity 
                style={styles.socialIconInline}
                onPress={() => onSocialMediaPress('website', socialMedia.website!)}
              >
                <Icon name="globe" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            {socialMedia.instagram_url && (
              <TouchableOpacity 
                style={styles.socialIconInline}
                onPress={() => onSocialMediaPress('instagram', socialMedia.instagram_url!)}
              >
                <Icon name="instagram" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            {socialMedia.facebook_url && (
              <TouchableOpacity 
                style={styles.socialIconInline}
                onPress={() => onSocialMediaPress('facebook', socialMedia.facebook_url!)}
              >
                <Icon name="facebook" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            {socialMedia.youtube_url && (
              <TouchableOpacity 
                style={styles.socialIconInline}
                onPress={() => onSocialMediaPress('youtube', socialMedia.youtube_url!)}
              >
                <Icon name="youtube" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            {socialMedia.twitter_url && (
              <TouchableOpacity 
                style={styles.socialIconInline}
                onPress={() => onSocialMediaPress('twitter', socialMedia.twitter_url!)}
              >
                <Icon name="x-logo" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            {socialMedia.tiktok_url && (
              <TouchableOpacity 
                style={styles.socialIconInline}
                onPress={() => onSocialMediaPress('tiktok', socialMedia.tiktok_url!)}
              >
                <Icon name="tiktok" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
  },
  usernameText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  socialMediaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  socialIconInline: {
    padding: 2,
  },
});

export default ProfileHeader; 