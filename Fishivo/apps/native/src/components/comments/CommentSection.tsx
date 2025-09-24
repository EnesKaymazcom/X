import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import { CommentWithUser, CreateCommentData } from '@fishivo/types';
import { createNativeApiService } from '@fishivo/api/services/native';
import { ReportReason } from '@fishivo/types';
import CommentList from '@/components/comments/CommentList';
import CommentInput from '@/components/comments/CommentInput';
import { FishivoModal } from '@/components/ui';
import CommentEventEmitter from '@/utils/CommentEventEmitter';

interface CommentSectionProps {
  postId: number;
  currentUserId?: string;
  onUserPress: (userId: string) => void;
  ListHeaderComponent?: React.ComponentType<{}> | React.ReactElement | null;
  autoFocusInput?: boolean;
  initialCommentCount?: number;
}

const COMMENTS_PER_PAGE = 20;

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  currentUserId,
  onUserPress,
  ListHeaderComponent,
  autoFocusInput = false,
  initialCommentCount,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const apiService = createNativeApiService();
  
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentWithUser | null>(null);
  const [editingComment, setEditingComment] = useState<CommentWithUser | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleteCommentHasReplies, setDeleteCommentHasReplies] = useState(false);
  const [deleteCommentReplyCount, setDeleteCommentReplyCount] = useState(0);
  
  // Error modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason | null>(null);
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);
  const [showReportErrorModal, setShowReportErrorModal] = useState(false);

  // Load initial comments
  const loadComments = useCallback(async (isRefresh = false) => {
    if (loading && !isRefresh) return;
    
    const newPage = isRefresh ? 0 : page;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const fetchedComments = await apiService.comments.getPostCommentsOptimized(
        postId,
        COMMENTS_PER_PAGE,
        newPage * COMMENTS_PER_PAGE,
        currentUserId,
        isRefresh // Force refresh on pull-to-refresh
      );

      if (isRefresh) {
        setComments(fetchedComments);
        setPage(0);
        setHasMore(fetchedComments.length === COMMENTS_PER_PAGE);
      } else {
        if (newPage === 0) {
          setComments(fetchedComments);
        } else {
          setComments(prev => [...prev, ...fetchedComments]);
        }
        setHasMore(fetchedComments.length === COMMENTS_PER_PAGE);
      }
    } catch (error) {
      setModalMessage(t('common.failedToLoadComments'));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId, currentUserId, page, loading, apiService.comments, t]);

  useEffect(() => {
    if (initialCommentCount === 0) {
      setLoading(false);
      return;
    }
    
    // Initial load - don't depend on loadComments callback
    const loadInitialComments = async () => {
      setLoading(true);
      try {
        const fetchedComments = await apiService.comments.getPostCommentsOptimized(
          postId,
          COMMENTS_PER_PAGE,
          0,
          currentUserId,
          false
        );
        setComments(fetchedComments);
        setHasMore(fetchedComments.length === COMMENTS_PER_PAGE);
        setPage(0);
      } catch (error) {
        setModalMessage(t('common.failedToLoadComments'));
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialComments();
  }, [postId, initialCommentCount, apiService.comments, currentUserId, t]);

  const handleRefresh = useCallback(() => {
    loadComments(true);
  }, [loadComments]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      loadComments();
    }
  }, [hasMore, loading, loadComments]);

  // Comment actions
  const handleSubmitComment = useCallback(async (content: string, parentId?: number) => {
    if (!currentUserId) {
      setModalMessage(t('common.mustBeLoggedIn'));
      setShowErrorModal(true);
      return;
    }

    const commentData: CreateCommentData = {
      content,
      post_id: postId,
      parent_id: parentId,
    };

    if (editingComment) {
      // Update existing comment
      const updated = await apiService.comments.updateComment(
        editingComment.id,
        currentUserId,
        { content }
      );

      if (updated) {
        setComments(prev => 
          prev.map(comment => {
            if (comment.id === updated.id) {
              return { ...comment, ...updated };
            }
            // Update in replies
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === updated.id ? { ...reply, ...updated } : reply
                ),
              };
            }
            return comment;
          })
        );
        setEditingComment(null);
      } else {
        throw new Error('Failed to update comment');
      }
    } else {
      // Create new comment
      const newComment = await apiService.comments.createComment(currentUserId, commentData);
      
      if (newComment) {
        let updatedComments: CommentWithUser[];
        
        if (parentId) {
          // Add reply to parent comment
          updatedComments = comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment],
                replies_count: (comment.replies_count || 0) + 1,
              };
            }
            return comment;
          });
        } else {
          // Add new parent comment at the beginning
          updatedComments = [newComment, ...comments];
        }
        
        setComments(updatedComments);
        
        // Only clear replyingTo if this was actually a reply
        if (parentId) {
          setReplyingTo(null);
        }
        
        // Calculate total comments using updated state
        const totalComments = updatedComments.reduce((total, comment) => {
          return total + 1 + (comment.replies_count || 0);
        }, 0);
        
        // Check if user has commented
        const hasUserCommentedNow = updatedComments.some(comment => 
          comment.user_id === currentUserId || 
          comment.replies?.some(reply => reply.user_id === currentUserId)
        );
        
        // Notify via event emitter
        CommentEventEmitter.emitCommentAdded(postId, totalComments, hasUserCommentedNow);
      } else {
        throw new Error('Failed to create comment');
      }
    }
  }, [currentUserId, postId, editingComment, apiService.comments, t, comments]);


  const handleDeleteComment = useCallback((commentId: number) => {
    // Check if this is a parent comment with replies
    const parentComment = comments.find(c => c.id === commentId);
    const hasReplies = parentComment && parentComment.replies && parentComment.replies.length > 0;
    
    setDeleteCommentId(commentId);
    setDeleteCommentHasReplies(hasReplies || false);
    setDeleteCommentReplyCount(parentComment?.replies?.length || 0);
    setShowDeleteModal(true);
  }, [comments]);
  
  const confirmDeleteComment = useCallback(async () => {
    if (!deleteCommentId || !currentUserId) return;
    
    const success = await apiService.comments.deleteComment(deleteCommentId, currentUserId);
    if (success) {
      // First filter parent comments
      let updatedComments = comments.filter(comment => comment.id !== deleteCommentId);
      
      // Then filter replies
      updatedComments = updatedComments.map(comment => {
        if (comment.replies) {
          const filteredReplies = comment.replies.filter(reply => reply.id !== deleteCommentId);
          if (filteredReplies.length !== comment.replies.length) {
            return {
              ...comment,
              replies: filteredReplies,
              replies_count: filteredReplies.length
            };
          }
        }
        return comment;
      });
      
      setComments(updatedComments);
      
      // Calculate total comments using updated state
      const totalComments = updatedComments.reduce((total, comment) => {
        return total + 1 + (comment.replies_count || 0);
      }, 0);
      
      // Check if user still has comments
      const stillHasComments = updatedComments.some(comment => 
        comment.user_id === currentUserId || 
        comment.replies?.some(reply => reply.user_id === currentUserId)
      );
      
      CommentEventEmitter.emitCommentDeleted(postId, totalComments, stillHasComments);
    }
    
    setShowDeleteModal(false);
    setDeleteCommentId(null);
  }, [deleteCommentId, currentUserId, apiService.comments, comments, postId]);

  const handleReportComment = useCallback((commentId: number) => {
    setReportTargetId(commentId);
    setSelectedReportReason(null);
    setShowReportModal(true);
  }, []);

  const confirmReport = async () => {
    if (!reportTargetId || !selectedReportReason) return;

    try {
      const success = await apiService.reports.reportComment(
        currentUserId || '',
        reportTargetId,
        selectedReportReason
      );

      setShowReportModal(false);

      if (success) {
        setShowReportSuccessModal(true);
      } else {
        setShowReportErrorModal(true);
      }
    } catch (error) {
      setShowReportModal(false);
      setShowReportErrorModal(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <CommentList
          postId={postId}
          comments={comments}
          loading={loading && page === 0}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onUserPress={onUserPress}
          onReplyPress={setReplyingTo}
          onEditPress={setEditingComment}
          onDeletePress={handleDeleteComment}
          onReportPress={handleReportComment}
          currentUserId={currentUserId}
          hasMore={hasMore}
          ListHeaderComponent={ListHeaderComponent}
        />
      </View>
      
      <CommentInput
        onSubmit={handleSubmitComment}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        editingComment={editingComment}
        onCancelEdit={() => setEditingComment(null)}
        autoFocus={autoFocusInput}
      />
      
      {/* Delete Comment Modal */}
      <FishivoModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteCommentId(null);
        }}
        preset="delete"
        title={t('common.deleteComment')}
        description={deleteCommentHasReplies 
          ? t('common.deleteCommentWithRepliesConfirm', { count: deleteCommentReplyCount })
          : t('common.deleteCommentConfirm')
        }
        primaryButton={{
          text: t('common.delete'),
          onPress: confirmDeleteComment
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => {
            setShowDeleteModal(false);
            setDeleteCommentId(null);
          }
        }}
      />
      
      {/* Report Modal */}
      <FishivoModal
        visible={showReportModal}
        title={t('home.reportTitle')}
        onClose={() => setShowReportModal(false)}
        backdropCloseable={false}
        showCloseButton={true}
        description={t('home.reportDescription')}
        buttons={[
          {
            text: t('common.cancel'),
            variant: 'secondary',
            onPress: () => setShowReportModal(false)
          },
          {
            text: t('common.report'),
            variant: 'destructive',
            onPress: confirmReport,
            disabled: !selectedReportReason
          }
        ]}
        contentAlign="left"
        renderRadioOptions={{
          options: Object.values(ReportReason).map(reason => ({
            key: reason,
            label: t(`home.reportReasons.${reason}`)
          })),
          selectedKey: selectedReportReason,
          onSelect: (key: string) => setSelectedReportReason(key as ReportReason)
        }}
      />
      
      {/* Report Success Modal */}
      <FishivoModal
        visible={showReportSuccessModal}
        onClose={() => setShowReportSuccessModal(false)}
        preset="success"
        title={t('common.success')}
        description={t('home.reportSuccess')}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowReportSuccessModal(false)
        }}
      />
      
      {/* Report Error Modal */}
      <FishivoModal
        visible={showReportErrorModal}
        onClose={() => setShowReportErrorModal(false)}
        preset="error"
        title={t('common.error')}
        description={t('home.reportError')}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowReportErrorModal(false)
        }}
      />
      
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
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    flex: 1,
  },
});

export default CommentSection;