import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import { CommentWithUser } from '@fishivo/types';
import CommentItem from '@/components/comments/CommentItem';
import { EmptyState, Skeleton, SkeletonItem } from '@/components/ui';

interface CommentListProps {
  postId: number;
  comments: CommentWithUser[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onUserPress: (userId: string) => void;
  onReplyPress: (comment: CommentWithUser) => void;
  onEditPress?: (comment: CommentWithUser) => void;
  onDeletePress?: (commentId: number) => void;
  onReportPress?: (commentId: number) => void;
  currentUserId?: string;
  hasMore?: boolean;
  ListHeaderComponent?: React.ComponentType<{}> | React.ReactElement | null;
}

const ItemSeparator = React.memo(() => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return <View style={styles.separator} />;
});

const CommentList: React.FC<CommentListProps> = ({
  postId: _postId,
  comments,
  loading,
  refreshing,
  onRefresh,
  onLoadMore,
  onUserPress,
  onReplyPress,
  onEditPress,
  onDeletePress,
  onReportPress,
  currentUserId,
  hasMore = false,
  ListHeaderComponent,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loading, onLoadMore]);

  const renderCommentSkeleton = useCallback(() => {
    return (
      <View style={styles.skeletonItem}>
        <Skeleton>
          <View style={styles.skeletonRow}>
            <SkeletonItem width={32} height={32} borderRadius={16} />
            <View style={styles.skeletonContent}>
              <SkeletonItem width={80} height={14} borderRadius={4} marginBottom={8} />
              <SkeletonItem width="85%" height={14} borderRadius={4} marginBottom={4} />
              <SkeletonItem width="45%" height={14} borderRadius={4} marginBottom={12} />
              <SkeletonItem width={100} height={16} borderRadius={4} />
            </View>
          </View>
        </Skeleton>
      </View>
    );
  }, [styles]);

  const renderComment = useCallback(({ item }: { item: CommentWithUser | 'skeleton' }) => {
    if (item === 'skeleton') {
      return renderCommentSkeleton();
    }
    
    return (
      <CommentItem
        comment={item}
        onUserPress={onUserPress}
        onReplyPress={onReplyPress}
        onEditPress={onEditPress}
        onDeletePress={onDeletePress}
        onReportPress={onReportPress}
        currentUserId={currentUserId}
        showReplies={true}
      />
    );
  }, [currentUserId, onUserPress, onReplyPress, onEditPress, onDeletePress, onReportPress, renderCommentSkeleton]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loadingMore, theme.colors.primary, styles.footerLoader]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyState
        title={t('common.noComments')}
      />
    );
  }, [t]);

  const keyExtractor = useCallback((item: CommentWithUser | 'skeleton', index: number) => {
    if (item === 'skeleton') {
      return `skeleton-${index}`;
    }
    return String(item.id);
  }, []);

  const listData = useMemo(() => {
    if (loading && comments.length === 0) {
      return Array(6).fill('skeleton');
    }
    return comments;
  }, [loading, comments]);

  return (
    <FlatList
      data={listData}
      renderItem={renderComment}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={!loading && comments.length === 0 ? renderEmpty : null}
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={[
        styles.contentContainer,
        listData.length === 0 && styles.emptyContentContainer
      ]}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={undefined}
    />
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  contentContainer: {
    paddingBottom: 0,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md + 40,
  },
  footerLoader: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  skeletonItem: {
    paddingVertical: theme.spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  skeletonReply: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    marginLeft: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  skeletonReplyContent: {
    flex: 1,
  },
});

export default CommentList;