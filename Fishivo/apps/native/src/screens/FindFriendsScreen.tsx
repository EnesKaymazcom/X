import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Share,
  FlatList,
  InteractionManager,
  ActivityIndicator
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'

import {
  ScreenContainer,
  Button,
  Icon,
  Avatar,
  AppHeader,
  EmptyState,
  FishivoModal
} from '@/components/ui'

import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from '@/contexts/LanguageContext'
import { Theme } from '@/theme'

import { useContacts } from '@/hooks/useContacts'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { useFollow } from '@/hooks/useFollow'
import { RootStackParamList } from '@/types/navigation'
import type { FriendSuggestion } from '@fishivo/api'
import { followService } from '@fishivo/api'
import { useFollowStore } from '@/stores/followStore'

type FindFriendsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FindFriends'>
type FindFriendsScreenRouteProp = RouteProp<RootStackParamList, 'FindFriends'>

interface Props {
  navigation: FindFriendsScreenNavigationProp
  route: FindFriendsScreenRouteProp
}

const FindFriendsScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false)
  const [contactUsers, setContactUsers] = useState<FriendSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [followingPending, setFollowingPending] = useState<Set<string>>(new Set())
  
  // Global follow store integration
  const { getFollowStatus, followUser: globalFollowUser, unfollowUser: globalUnfollowUser } = useFollowStore()
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  
  const { theme } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const styles = createStyles(theme)
  
  const { user, isLoading: userLoading } = useSupabaseUser()
  const {
    isPermissionGranted,
    isLoading: contactsLoading,
    requestPermission,
    syncContacts,
    hasContacts
  } = useContacts()

  const loadContactUsers = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      if (!hasContacts()) {
        await syncContacts()
      }
      
      setContactUsers([])
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, hasContacts, syncContacts])

  useEffect(() => {
    if (!userLoading) {
      InteractionManager.runAfterInteractions(() => {
        if (isPermissionGranted && user?.id) {
          loadContactUsers()
        } else {
          setIsLoading(false)
        }
      })
    }
  }, [isPermissionGranted, user?.id, userLoading, loadContactUsers])

  const handleGrantPermission = async () => {
    try {
      const granted = await requestPermission()
      
      if (granted) {
        await loadContactUsers()
      } else {
        setModalMessage(t('profile.findFriends.permission.description'))
        setShowInfoModal(true)
      }
    } catch (error) {
      setModalMessage(t('profile.findFriends.permission.error'))
      setShowErrorModal(true)
    }
  }

  // handleFollowUser SİLİNDİ - FollowContext kullanılıyor

  const handleInviteFriends = async () => {
    try {
      const message = t('profile.findFriends.inviteMessage')
      
      await Share.share({
        message,
        title: t('profile.findFriends.inviteTitle'),
      })
    } catch (error) {
    }
  }

  const handleViewProfile = useCallback((userId: string) => {
    navigation.navigate('UserProfile', { userId })
  }, [navigation])

  const handleViewContactsList = () => {
    if (!isPermissionGranted) {
      handleGrantPermission()
    } else {
      loadContactUsers()
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      if (isPermissionGranted && user?.id) {
        await loadContactUsers()
      }
    } catch (error) {
    } finally {
      setRefreshing(false)
    }
  }

  const handleFollow = useCallback(async (userId: string) => {
    if (!user?.id || followingPending.has(userId)) return
    
    setFollowingPending(prev => new Set(prev).add(userId))
    
    try {
      const result = await globalFollowUser(user.id, userId)
      
      if (result.success) {
        setContactUsers(prev => prev.map(c => 
          c.user_id === userId ? { ...c, is_following: true } : c
        ))
        setModalMessage(t('profile.findFriends.followSuccess'))
        setShowSuccessModal(true)
        
        // Real-time updates handled by global follow store
      } else {
        throw new Error(result.error || t('common.error'))
      }
    } catch (error) {
      setModalMessage(t('profile.findFriends.followError'))
      setShowErrorModal(true)
    } finally {
      setFollowingPending(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }, [user?.id, globalFollowUser, t])

  const renderContactCard = useCallback(({ contact }: { contact: FriendSuggestion }) => (
    <View style={styles.contactCard}>
      <TouchableOpacity 
        style={styles.contactProfile}
        onPress={() => handleViewProfile(contact.user_id)}
        activeOpacity={0.7}
      >
        <Avatar uri={contact.avatar_url} size={50} />
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {contact.full_name || contact.username}
          </Text>
          <Text style={styles.contactUsername} numberOfLines={1}>
            @{contact.username}
          </Text>
        </View>
      </TouchableOpacity>

      {(user?.id ? (getFollowStatus(user.id, contact.user_id) ?? contact.is_following) : contact.is_following) ? (
        <Text style={styles.followingText}>{t('profile.findFriends.following')}</Text>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onPress={() => handleFollow(contact.user_id)}
          disabled={followingPending.has(contact.user_id)}
          loading={followingPending.has(contact.user_id)}
          style={styles.followButton}
        >
          {t('profile.follow')}
        </Button>
      )}
    </View>
  ), [handleViewProfile, handleFollow, followingPending, getFollowStatus, user?.id, t, styles])


  if (userLoading || isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader 
          title={t('profile.findFriendsButton')}
          leftButtons={[
            {
              icon: 'arrow-left',
              onPress: () => navigation.goBack()
            }
          ]}
        />
        <ScreenContainer paddingVertical="none" paddingHorizontal="none">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </ScreenContainer>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader 
        title={t('profile.findFriendsButton')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.goBack()
          }
        ]}
      />

      <ScreenContainer paddingVertical="none" paddingHorizontal="none">
        <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topActions}>
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => handleViewContactsList()}
          >
            <View style={styles.categoryIcon}>
              <Icon name="users" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{t('profile.findFriends.findInContacts')}</Text>
              <Text style={styles.categorySubtitle}>{t('profile.findFriends.findInContactsDesc')}</Text>
            </View>
            <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={handleInviteFriends}
          >
            <View style={styles.categoryIcon}>
              <Icon name="share" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{t('profile.findFriends.inviteFriends')}</Text>
              <Text style={styles.categorySubtitle}>{t('profile.findFriends.inviteFriendsDesc')}</Text>
            </View>
            <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>


        {isPermissionGranted && (
          <View>
            {(contactsLoading || isLoading) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>{t('profile.findFriends.loading.contacts')}</Text>
              </View>
            ) : contactUsers.length > 0 ? (
              <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>{t('profile.findFriends.contactUsers')}</Text>
                <FlatList
                  data={contactUsers}
                  keyExtractor={(item) => item.user_id}
                  renderItem={({ item }) => renderContactCard({ contact: item })}
                  scrollEnabled={false}
                  removeClippedSubviews={true}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                />
              </View>
            ) : null}
          </View>
        )}
        
        {(isPermissionGranted && !isLoading && !contactsLoading && contactUsers.length === 0) && (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              title={t('profile.findFriends.noContactUsersTitle')}
              subtitle={t('profile.findFriends.noContactUsersSubtitle')}
            />
            <Button
              variant="primary"
              onPress={() => navigation.navigate('Search')}
              style={styles.findAnglersButton}
            >
              {t('profile.findFriends.findAndFollowAnglers')}
            </Button>
          </View>
        )}
      </ScrollView>
      </ScreenContainer>

      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        preset="error"
        title={t('common.error')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowErrorModal(false)
        }}
      />

      {/* Success Modal */}
      <FishivoModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        preset="success"
        title={t('common.success')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowSuccessModal(false)
        }}
      />

      {/* Info Modal */}
      <FishivoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        preset="info"
        title={t('profile.findFriends.permission.title')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowInfoModal(false)
        }}
      />
    </View>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  topActions: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    minHeight: 64,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  
  // Permission Card
  permissionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.md,
    marginTop: 0, // Remove top margin
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    shadowColor: theme.shadows.md.shadowColor,
    shadowOffset: theme.shadows.md.shadowOffset,
    shadowOpacity: theme.shadows.md.shadowOpacity,
    shadowRadius: theme.shadows.md.shadowRadius,
    elevation: theme.shadows.md.elevation,
  },
  
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80, // Fishbrain tarzı biraz yukarıda ortalanmış
  },
  findAnglersButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: 30, // Daha yuvarlak buton
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  permissionTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  permissionFeatures: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  permissionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  permissionFeatureText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  permissionButton: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  permissionSkipButton: {
    width: '100%',
  },
  
  // Contact Card
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  contactProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  contactName: {
    fontSize: theme.typography.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  contactUsername: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  followButton: {
    paddingVertical: theme.spacing.sm,
  },
  followingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  
  // Common
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.xl,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  inviteButton: {
    paddingVertical: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: theme.typography.base,
    color: theme.colors.error,
  },
})

export default FindFriendsScreen