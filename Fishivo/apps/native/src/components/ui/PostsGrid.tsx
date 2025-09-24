import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet, Image, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProfileStore } from '@/stores/profileStore';

interface BasePost {
  id: number;
  imageUrl?: string;
  photo?: string;
  images?: string[];
  image_url?: string;
}

interface PostsGridProps<T = BasePost> {
  data: T[];
  onPostPress?: (post: T) => void;
  noPadding?: boolean;
}

const PostsGrid = <T extends BasePost>({ data, onPostPress, noPadding = false }: PostsGridProps<T>) => {
  const { theme: currentTheme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(currentTheme);
  const { isPostDeleted } = useProfileStore();
  const renderPost = ({ item }: { item: T }) => {
    // Get the primary image URL with priority order
    const getImageUrl = (post: T): string | null => {
      if (post.images && Array.isArray(post.images) && post.images.length > 0) {
        return post.images[0];
      }
      return post.image_url || post.imageUrl || post.photo || null;
    };

    const imageUrl = getImageUrl(item);
    const hasMultipleImages = item.images && Array.isArray(item.images) && item.images.length > 1;

    if (!imageUrl) return null;

    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => onPostPress?.(item)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {hasMultipleImages && (
            <View style={styles.imageCountContainer}>
              <Text style={styles.imageCountText}>
                1/{item.images!.length}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // INSTAGRAM STYLE: Filter out posts without images, API deleted posts AND optimistically deleted posts
  const postsWithImages = data.filter(item => {
    // Check if post has images
    const hasImages = (item.images && Array.isArray(item.images) && item.images.length > 0) ||
      item.image_url ||
      item.imageUrl ||
      item.photo;
    
    // Check if post is not deleted via API
    const isNotApiDeleted = !(item as any).status || (item as any).status !== 'deleted';
    
    // Check if post is not optimistically deleted (INSTANT FEEDBACK)
    const isNotOptimisticallyDeleted = !isPostDeleted(item.id.toString());
    
    return hasImages && isNotApiDeleted && isNotOptimisticallyDeleted;
  });

  // Show empty state if no posts with images
  if (postsWithImages.length === 0) {
    return (
      <EmptyState
        title={t('profile.catches.noCatches')}
        subtitle={t('profile.catches.addFirstCatch')}
      />
    );
  }

  return (
    <FlatList
      data={postsWithImages}
      renderItem={renderPost}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={noPadding ? styles.gridNoPadding : styles.grid}
      columnWrapperStyle={styles.row}
    />
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  postItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  imageCountContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  gridNoPadding: {
    paddingBottom: theme.spacing.md,
  },
  row: {
    justifyContent: 'flex-start',
  },
});

export default PostsGrid; 