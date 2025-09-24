import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Avatar, Button } from '@/components/ui'
import { useFollow } from '@/hooks/useFollow'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from '@/contexts/LanguageContext'
import { Theme } from '@/theme'
import type { FollowUser } from '@fishivo/api'

interface FollowItemProps {
  user: FollowUser
  currentUserId?: string
  navigation: any
  onError?: (error: string) => void
  onUnfollow?: (userId: string) => void
}

export const FollowItem: React.FC<FollowItemProps> = ({ 
  user, 
  currentUserId, 
  navigation,
  onError,
  onUnfollow 
}) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)
  
  const { 
    isFollowing, 
    isLoading,
    toggleFollow,
    canFollow
  } = useFollow(user.id, {
    onError: onError,
    onSuccess: () => {
      // If we're unfollowing and have an onUnfollow callback, call it
      if (isFollowing && onUnfollow) {
        onUnfollow(user.id)
      }
    }
  })

  const handleUserPress = () => {
    navigation.navigate('UserProfile', { userId: user.id })
  }

  const isOwnProfile = currentUserId === user.id

  return (
    <TouchableOpacity 
      style={styles.userItem} 
      onPress={handleUserPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          uri={user.avatar_url || undefined}
          name={user.full_name || user.username}
          size={40}
        />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.fullName} numberOfLines={1}>
          {user.full_name || user.username}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          @{user.username}
        </Text>
        {user.is_following_back && (
          <Text style={styles.followsYou}>
            {t('profile.followsYou')}
          </Text>
        )}
      </View>

      {!isOwnProfile && (
        <Button
          variant={isFollowing ? 'secondary' : 'primary'}
          size="sm"
          onPress={toggleFollow}
          disabled={!canFollow || isLoading}
          loading={isLoading}
        >
          {isFollowing ? t('profile.stats.following') : t('profile.follow')}
        </Button>
      )}
    </TouchableOpacity>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 0,
    marginBottom: theme.spacing.xs,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  userInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium as any,
    color: theme.colors.text,
  },
  username: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  followsYou: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
})