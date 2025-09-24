import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Icon, SectionHeader, EmptyState } from '@/components/ui';
import { Theme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { createNativeApiService } from '@fishivo/api/services/native';
import { PostWithUser } from '@fishivo/api/services/posts/posts.native';
import { getProxiedImageUrl } from '@fishivo/utils';

interface FishingTechniqueCatchesTabProps {
  techniqueId: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const FishingTechniqueCatchesTab: React.FC<FishingTechniqueCatchesTabProps> = ({ techniqueId }) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const styles = createStyles(theme);
  const apiService = createNativeApiService();

  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = async (pageNum: number = 0) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Get posts by fishing technique
      // For now, get all posts and filter by technique_used
      const allPosts = await apiService.posts.getPosts(20, pageNum * 20);
      const response = allPosts.filter((post: any) => 
        post.technique_used && 
        post.technique_used.toLowerCase().includes(techniqueId.toLowerCase())
      );

      if (pageNum === 0) {
        setPosts(response);
      } else {
        setPosts(prev => [...prev, ...response]);
      }

      setHasMore(response.length === 20);
    } catch (error) {
      setPosts([]);
    } finally {
      if (pageNum === 0) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    loadPosts(0);
  }, [techniqueId]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  const navigateToPost = (post: PostWithUser) => {
    navigation.navigate('PostDetail', {
      postId: post.id
    });
  };

  const renderPost = ({ item }: { item: PostWithUser }) => (
    <TouchableOpacity 
      style={styles.postItem} 
      onPress={() => navigateToPost(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: getProxiedImageUrl(item.image_url) }}
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="fish" size={24} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.postInfo}>
        <Text style={styles.speciesName} numberOfLines={1}>
          {(item as any).species_name || t('fishingDisciplines:unknownSpecies')}
        </Text>
        
        <View style={styles.postStats}>
          {(item as any).weight && (
            <View style={styles.statItem}>
              <Icon name="package" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{(item as any).weight}kg</Text>
            </View>
          )}
          
          {(item as any).length && (
            <View style={styles.statItem}>
              <Icon name="ruler" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{(item as any).length}cm</Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>
            {item.user?.username || t('fishingDisciplines:unknownUser')}
          </Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('fishingDisciplines:loadingCatches')}</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon="fish"
        title={t('fishingDisciplines:noCatches')}
        description={t('fishingDisciplines:noCatchesDescription')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader 
        title={t('fishingDisciplines:recentCatches')}
      />
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  listContent: {
    padding: theme.spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  postItem: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInfo: {
    padding: theme.spacing.sm,
  },
  speciesName: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  postStats: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  statText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  date: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  footerLoader: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
});