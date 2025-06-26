import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet, Image, Text, View, Dimensions } from 'react-native';
import { theme } from '@fishivo/shared';

interface Post {
  id: string;
  imageUrl?: string;
  photo?: string;
  images?: string[];
}

interface PostsGridProps<T = Post> {
  data: T[];
  onPostPress?: (post: T) => void;
  noPadding?: boolean;
}

const PostsGrid = <T extends Post>({ data, onPostPress, noPadding = false }: PostsGridProps<T>) => {
  const renderPost = ({ item }: { item: T }) => {
    const hasMultipleImages = (item as any).images && (item as any).images.length > 1;

    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => onPostPress?.(item)}
      >
        <View style={styles.imageContainer}>
          {(item as any).images && (item as any).images.length > 0 ? (
            <>
              <Image
                source={{ uri: (item as any).images[0] }}
                style={styles.image}
                resizeMode="cover"
              />
              {hasMultipleImages && (
                <View style={styles.imageCountContainer}>
                  <Text style={styles.imageCountText}>
                    1/{(item as any).images.length}
                  </Text>
                </View>
              )}
            </>
          ) : (item as any).imageUrl ? (
            <Image
              source={{ uri: (item as any).imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (item as any).photo ? (
            <Image
              source={{ uri: (item as any).photo }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>🎣</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      numColumns={3}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={noPadding ? styles.gridNoPadding : styles.grid}
      columnWrapperStyle={styles.row}
    />
  );
};

const styles = StyleSheet.create({
  postItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    margin: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoText: {
    fontSize: 32,
  },
  imageCarousel: {
    width: '100%',
    height: '100%',
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
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceVariant,
  },
  placeholderText: {
    fontSize: 24,
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