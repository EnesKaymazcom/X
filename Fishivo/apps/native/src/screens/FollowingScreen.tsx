import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ScreenContainer, EmptyState, Skeleton, SkeletonItem } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { FollowItem } from '@/components/ui/FollowItem';
import { followService } from '@fishivo/api';
import { useFollowStore } from '@/stores/followStore';
import { Theme } from '@/theme';
import { UserListScreenProps } from '@/types/user-list';
import type { FollowUser } from '@fishivo/api';
const FollowingScreen: React.FC<UserListScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { user: currentUser } = useSupabaseUser();
  const userId = route?.params?.userId || currentUser?.id;
  const userName = route?.params?.userName;
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const loadFollowing = useCallback(async (isRefresh = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const currentOffset = isRefresh ? 0 : offset;
      const result = await followService.getFollowing(userId, limit, currentOffset, currentUser?.id);
      
      // Batch pre-populate follow states for better performance
      if (currentUser?.id && result.data.length > 0) {
        const userIds = result.data.map(u => u.id);
        
        // Get batch follow status - this is much faster than individual checks
        const followStatuses = await followService.getFollowStatusBatch(currentUser.id, userIds);
        
        // Update store with all statuses at once
        const { followStates } = useFollowStore.getState();
        const newFollowStates = new Map(followStates);
        
        followStatuses.forEach(status => {
          const key = `${currentUser.id}:${status.user_id}`;
          newFollowStates.set(key, {
            userId: status.user_id,
            isFollowing: status.is_following,
            lastUpdated: Date.now()
          });
        });
        
        useFollowStore.setState({ followStates: newFollowStates });
      }
      
      if (isRefresh) {
        // On refresh, replace the entire list with fresh data
        setFollowing(result.data);
        setOffset(limit);
        setTotal(result.total);
      } else {
        setFollowing(prev => [...prev, ...result.data]);
        setOffset(prev => prev + limit);
        setTotal(result.total);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [userId, offset, currentUser?.id]);

  useEffect(() => {
    loadFollowing(true);
  }, [userId, loadFollowing]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFollowing(true);
  }, [loadFollowing]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || following.length >= total) return;
    setLoadingMore(true);
    loadFollowing(false);
  }, [loadingMore, following.length, total, loadFollowing]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderFollowingItemSkeleton = useCallback(() => {
    return (
      <TouchableOpacity style={styles.userItem} disabled={true} activeOpacity={1}>
        <View style={styles.avatarContainer}>
          <Skeleton>
            <SkeletonItem width={40} height={40} borderRadius={20} />
          </Skeleton>
        </View>
        <View style={styles.userInfo}>
          <Skeleton>
            <SkeletonItem width={120} height={16} borderRadius={4} />
          </Skeleton>
          <Skeleton>
            <SkeletonItem width={100} height={14} borderRadius={4} marginTop={4} />
          </Skeleton>
        </View>
        <Skeleton>
          <SkeletonItem width={90} height={32} borderRadius={theme.borderRadius.md} />
        </Skeleton>
      </TouchableOpacity>
    );
  }, [styles, theme]);

  // Render following item or skeleton
  const renderFollowing = useCallback(({ item }: { item: FollowUser | 'skeleton' }) => {
    if (item === 'skeleton') {
      return renderFollowingItemSkeleton();
    }
    
    return (
      <FollowItem 
        user={item} 
        currentUserId={currentUser?.id}
        navigation={navigation}
      />
    );
  }, [renderFollowingItemSkeleton, currentUser?.id, navigation]);

  // Prepare data for FlatList
  const listData = loading ? Array(10).fill('skeleton') : following;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={
          userName 
            ? `${userName} - ${t('profile.following')} ${total > 0 ? `(${total})` : ''}` 
            : `${t('profile.following')} ${total > 0 ? `(${total})` : ''}`
        }
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: handleGoBack
          }
        ]}
      />
      
      <ScreenContainer paddingVertical="none" paddingHorizontal="none">
        {!loading && following.length === 0 ? (
          <EmptyState
            title={t('profile.emptyFollowing')}
          />
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item, index) => typeof item === 'string' ? `skeleton-${index}` : item.id}
            renderItem={renderFollowing}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
              />
            }
            onEndReached={!loading ? handleLoadMore : undefined}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : null
            }
          />
        )}
      </ScreenContainer>
    </View>
  );
};


const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
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
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  followsYou: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  rightComponent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  countText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium as any,
  },
});

export default FollowingScreen;