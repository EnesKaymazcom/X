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

// Using PostsGrid style - no need for manual width calculations

interface FishCatchesTabProps {
  speciesId: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const FishCatchesTab: React.FC<FishCatchesTabProps> = ({ speciesId }) => {
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

      const response = await apiService.posts.getSpeciesPosts(speciesId, 20, pageNum * 20);

      if (pageNum === 0) {
        setPosts(response);
      } else {
        setPosts(prev => [...prev, ...response]);
      }

      setHasMore(response.length === 20);

    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [speciesId]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  const renderPhotoItem = ({ item }: { item: PostWithUser }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;
    
    if (!imageUrl) return null;

    return (
      <TouchableOpacity 
        style={styles.photoItem}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      >
        <Image source={{ uri: imageUrl }} style={styles.photoImage} />
      </TouchableOpacity>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader 
        title={t('fishSpecies.catches.title')}
        subtitle={posts.length > 0 ? `${posts.length} ${t('fishSpecies.catches.photos')}` : undefined}
      />
      
      {posts.length === 0 ? (
        <EmptyState
          title={t('common:fish.catches.empty')}
        />
      ) : (
        <>
          <FlatList
            data={posts}
            renderItem={renderPhotoItem}
            numColumns={3}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContainer}
          />
          {hasMore && posts.length > 0 && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={styles.loadMoreText}>
                  {t('fishSpecies.catches.loadMore')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
    minHeight: 200,
  },
  loadingFooter: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  gridContainer: {
    paddingHorizontal: 0, // No padding like profile usage
    paddingBottom: theme.spacing.md,
  },
  row: {
    justifyContent: 'flex-start', // Like PostsGrid profile
  },
  photoItem: {
    width: '33.33%', // Like PostsGrid profile
    aspectRatio: 1,
    padding: 1, // Like PostsGrid profile - minimal spacing
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadMoreText: {
    fontSize: theme.typography.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.semibold,
  },
});