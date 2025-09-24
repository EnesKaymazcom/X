import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ScreenContainer, Icon, Button, EmptyState, FishivoModal, Skeleton, SkeletonItem } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { createNativeApiService } from '@fishivo/api/services/native';
import { useFollowStore } from '@/stores/followStore';
import { Theme } from '@/theme';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { useFocusEffect } from '@react-navigation/native';

interface Liker {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  is_pro?: boolean;
  is_following?: boolean;
}

type LikersScreenProps = StackScreenProps<RootStackParamList, 'Likers'>;

// Follow Button Component
const FollowButton: React.FC<{
  userId: string;
  isFollowing: boolean;
  isPending: boolean;
  onToggle: (userId: string) => Promise<void>;
}> = ({ userId, isFollowing, isPending, onToggle }) => {
  const { t } = useTranslation();
  
  return (
    <Button
      size="sm"
      variant={isFollowing ? 'secondary' : 'primary'}
      onPress={() => onToggle(userId)}
      disabled={isPending}
      loading={isPending}
    >
      {isFollowing ? t('profile.stats.following') : t('profile.follow')}
    </Button>
  );
};

const LikersScreen: React.FC<LikersScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { postId } = route.params;
  const { user: currentUser } = useSupabaseUser();

  const [likers, setLikers] = useState<Liker[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [_total, setTotal] = useState(0);
  const [followingPending, setFollowingPending] = useState<Set<string>>(new Set());
  
  // Global follow store integration
  const { getFollowStatus, followUser: globalFollowUser, unfollowUser: globalUnfollowUser } = useFollowStore();

  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const loadLikers = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const apiService = createNativeApiService();
      // ALWAYS get fresh data, bypass cache
      const response = await apiService.likes.getPostLikers(postId, pageNum, 24, true);
      const newLikers = response.items || [];
      
      let processedLikers = [...newLikers];
      if (pageNum === 1) {
        processedLikers.sort((a, b) => {
          if (a.id === currentUser?.id) return -1;
          if (b.id === currentUser?.id) return 1;
          return 0;
        });
      }
      
      if (append) {
        setLikers(prev => [...prev, ...processedLikers]);
      } else {
        setLikers(processedLikers);
      }
      
      setTotal(response.total);
      setHasMore(response.hasMore);
      setPage(pageNum);
      
      // REMOVED: Store update from LikersScreen to prevent conflicts
      // Store should only be updated by like/unlike actions
    } catch (error) {
      setModalMessage('Beğenenler yüklenirken bir hata oluştu');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [postId, currentUser?.id]);


  // Load on mount and when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadLikers(1, false);
    }, [loadLikers])
  );

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadLikers(page + 1, true);
    }
  };

  const handleFollowToggle = useCallback(async (userId: string) => {
    if (!currentUser?.id || followingPending.has(userId)) return;
    
    setFollowingPending(prev => new Set(prev).add(userId));
    
    try {
      const isCurrentlyFollowing = getFollowStatus(currentUser.id, userId) ?? false;
      
      let result;
      if (isCurrentlyFollowing) {
        result = await globalUnfollowUser(currentUser.id, userId);
      } else {
        result = await globalFollowUser(currentUser.id, userId);
      }
      
      if (!result.success) {
        throw new Error(result.error || t('common.error'));
      }
    } catch (error) {
      setModalMessage(t('common.error'));
      setShowErrorModal(true);
    } finally {
      setFollowingPending(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [currentUser?.id, followingPending, getFollowStatus, globalFollowUser, globalUnfollowUser, t]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const handleUserPress = (userId: string) => {
    // Kendi profilinse ProfileScreen'e git
    if (userId === currentUser?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    } else {
      navigation.navigate('UserProfile', { userId });
    }
  };

  // handleFollowPress SİLİNDİ - FollowContext direkt kullanılıyor

  const handleGoBack = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  const renderUserItemSkeleton = useCallback(() => {
    return (
      <TouchableOpacity style={styles.likerItem}>
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

  const renderLiker = ({ item }: { item: Liker | 'skeleton' }) => {
    if (item === 'skeleton') {
      return renderUserItemSkeleton();
    }
    const isCurrentUser = currentUser?.id === item.id;
    
    return (
      <TouchableOpacity
        style={styles.likerItem}
        onPress={() => handleUserPress(item.id)}
      >
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image 
              source={{ uri: item.avatar_url }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="user" size={20} color={theme.colors.textSecondary} />
            </View>
          )}
          {item.is_pro && (
            <View style={styles.proBadge}>
              <Icon name="crown" size={10} color={theme.colors.background} />
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>
            {item.full_name || item.username}
          </Text>
          <Text style={styles.username}>
            @{item.username}
          </Text>
        </View>
        {!isCurrentUser && (
          <FollowButton
            userId={item.id}
            isFollowing={currentUser?.id ? (getFollowStatus(currentUser.id, item.id) ?? false) : false}
            isPending={followingPending.has(item.id)}
            onToggle={handleFollowToggle}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading && likers.length === 0) {
      return (
        <FlatList
          data={Array(10).fill('skeleton')}
          renderItem={renderLiker}
          keyExtractor={(item, index) => `skeleton-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, theme.listContentStyle]}
        />
      );
    }

    if (!loading && likers.length === 0) {
      return (
        <EmptyState
          title={t('common.noLikes')}
        />
      );
    }

    return (
      <FlatList
        data={likers}
        renderItem={renderLiker}
        keyExtractor={(item) => typeof item === 'string' ? item : item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, theme.listContentStyle]}
        // Instagram optimization
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        // Virtualization settings
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        // Fixed height optimization
        getItemLayout={(data, index) => ({
          length: 64, // avatar(40) + padding(24)
          offset: 64 * index,
          index,
        })}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={`${t('common.likes')} ${_total > 0 ? `(${_total})` : ''}`}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: handleGoBack
          }
        ]}
      />
      
      <ScreenContainer paddingVertical="none">
        {renderContent()}
      </ScreenContainer>

      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        preset="error"
        title="Hata"
        description={modalMessage}
        primaryButton={{
          text: 'Tamam',
          onPress: () => setShowErrorModal(false)
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
  listContent: {
    paddingVertical: theme.spacing.sm,
  },
  likerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 0,
    marginBottom: theme.spacing.sm,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
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
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
});

export default LikersScreen;