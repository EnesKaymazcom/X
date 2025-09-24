import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import { CommentWithUser } from '@fishivo/types';
import { Avatar, Icon, UserDisplayName, FishivoModal, LikeButton } from '@/components/ui';
import { likesServiceNative } from '@fishivo/api';

interface CommentItemProps {
  comment: CommentWithUser;
  onUserPress: (userId: string) => void;
  onReplyPress: (comment: CommentWithUser) => void;
  onEditPress?: (comment: CommentWithUser) => void;
  onDeletePress?: (commentId: number) => void;
  onReportPress?: (commentId: number) => void;
  currentUserId?: string;
  isReply?: boolean;
  showReplies?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUserPress,
  onReplyPress,
  onEditPress,
  onDeletePress,
  onReportPress,
  currentUserId,
  isReply = false,
  showReplies = true,
}) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const styles = createStyles(theme);
  const [showAllReplies, setShowAllReplies] = useState(false);
  
  // Like states - Professional pattern from CatchCard
  const [isLiked, setIsLiked] = useState(comment.is_liked || false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  
  // Modal states
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const isOwnComment = currentUserId && currentUserId === comment.user_id;
  
  // Check if comment can still be edited (5 minutes limit)
  const canEditComment = () => {
    if (!isOwnComment) return false;
    
    const commentTime = new Date(comment.created_at).getTime();
    const currentTime = new Date().getTime();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes
    
    return (currentTime - commentTime) < fiveMinutesInMs;
  };

  const formatTimeAgo = (date: string) => {
    try {
      const now = new Date();
      const then = new Date(date);
      const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
      
      if (seconds < 60) return locale === 'tr' ? 'az önce' : 'just now';
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return locale === 'tr' ? `${minutes}dk` : `${minutes}m`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return locale === 'tr' ? `${hours}sa` : `${hours}h`;
      
      const days = Math.floor(hours / 24);
      if (days < 7) return locale === 'tr' ? `${days}g` : `${days}d`;
      
      const weeks = Math.floor(days / 7);
      if (weeks < 4) return locale === 'tr' ? `${weeks}h` : `${weeks}w`;
      
      const months = Math.floor(days / 30);
      if (months < 12) return locale === 'tr' ? `${months}ay` : `${months}mo`;
      
      const years = Math.floor(days / 365);
      return locale === 'tr' ? `${years}y` : `${years}y`;
    } catch (error) {
      return '';
    }
  };

  // Professional like handler - Same pattern as CatchCard
  const handleLikePress = useCallback(async () => {
    if (isLiking) {
      return;
    }
    
    setIsLiking(true);
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    
    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    
    try {
      const success = newIsLiked 
        ? await likesServiceNative.likeComment(comment.id)
        : await likesServiceNative.unlikeComment(comment.id);
      
      if (!success) {
        // Rollback on failure
        setIsLiked(!newIsLiked);
        setLikesCount(likesCount);
      }
    } catch (error) {
      // Rollback on error
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  }, [isLiked, likesCount, isLiking, comment.id]);

  const handleLongPress = () => {
    setShowOptionsModal(true);
  };
  
  const handleEditExpired = () => {
    setShowOptionsModal(false);
    setModalMessage(t('common.editTimeExpiredMessage'));
    setShowInfoModal(true);
  };
  
  const handleEdit = () => {
    setShowOptionsModal(false);
    if (onEditPress) onEditPress(comment);
  };
  
  const handleDelete = () => {
    setShowOptionsModal(false);
    if (onDeletePress) onDeletePress(comment.id);
  };
  
  const handleReport = () => {
    setShowOptionsModal(false);
    if (onReportPress) onReportPress(comment.id);
  };

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      <TouchableOpacity onPress={() => onUserPress(comment.user.id)}>
        <Avatar
          size={isReply ? 28 : 32}
          uri={comment.user.avatar_url}
          name={comment.user.full_name || comment.user.username}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => onUserPress(comment.user.id)}
          >
            <UserDisplayName
              user={comment.user}
              fontSize={14}
              color={theme.colors.text}
            />
            <Text style={styles.timeAgo}>{formatTimeAgo(comment.created_at)}</Text>
            {comment.edited && (
              <Text style={styles.edited}>{t('common.edited')}</Text>
            )}
          </TouchableOpacity>
          
          {comment.is_pinned && (
            <View style={styles.pinnedBadge}>
              <Icon name="thumbtack" size={14} color={theme.colors.primary} />
              <Text style={styles.pinnedText}>{t('common.pinned')}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <Text style={styles.commentText}>{comment.content}</Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          <LikeButton 
            likes={likesCount}
            isLiked={isLiked}
            size={17}
            onPress={handleLikePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          />

          {!isReply && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onReplyPress(comment)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="message-circle" size={19} color={theme.colors.textSecondary} />
              <Text style={styles.actionText}>{t('common.reply')}</Text>
            </TouchableOpacity>
          )}
          
          {isOwnComment && (
            <>
              {onEditPress && canEditComment() && (
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => onEditPress(comment)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="edit-2" size={19} color={theme.colors.textSecondary} />
                  <Text style={styles.actionText}>{t('common.edit')}</Text>
                </TouchableOpacity>
              )}
              
              {onDeletePress && (
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => onDeletePress(comment.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="trash-2" size={19} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error }]}>{t('common.delete')}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          {!isOwnComment && onReportPress && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onReportPress(comment.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="flag" size={19} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Nested Replies with View/Hide Control */}
        {showReplies && comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {/* Show first 2 replies always */}
            {comment.replies.slice(0, showAllReplies ? undefined : 2).map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onUserPress={onUserPress}
                onReplyPress={onReplyPress}
                onEditPress={onEditPress}
                onDeletePress={onDeletePress}
                onReportPress={onReportPress}
                currentUserId={currentUserId}
                isReply={true}
                showReplies={false}
              />
            ))}
            
            {/* View/Hide replies button */}
            {comment.replies.length > 2 && (
              <TouchableOpacity
                style={styles.viewRepliesButton}
                onPress={() => setShowAllReplies(!showAllReplies)}
              >
                <Icon 
                  name={showAllReplies ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.viewRepliesText}>
                  {showAllReplies 
                    ? t('common.hideReplies')
                    : t('common.viewMoreReplies', { count: comment.replies.length - 2 })
                  }
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      {/* Options Modal */}
      <FishivoModal
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        title={t('common.options')}
      >
        <View style={styles.optionsContainer}>
          {isOwnComment ? (
            <>
              {onEditPress && canEditComment() && (
                <TouchableOpacity 
                  key="edit-option"
                  style={styles.optionButton} 
                  onPress={handleEdit}
                >
                  <Icon name="edit-2" size={20} color={theme.colors.text} />
                  <Text style={styles.optionText}>{t('common.edit')}</Text>
                </TouchableOpacity>
              )}
              
              {onEditPress && !canEditComment() && (
                <TouchableOpacity 
                  key="edit-expired-option"
                  style={styles.optionButton} 
                  onPress={handleEditExpired}
                >
                  <Icon name="clock" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.optionText, { color: theme.colors.textSecondary }]}>
                    {t('common.editTimeExpired')}
                  </Text>
                </TouchableOpacity>
              )}
              
              {onDeletePress && (
                <TouchableOpacity 
                  key="delete-option"
                  style={styles.optionButton} 
                  onPress={handleDelete}
                >
                  <Icon name="trash-2" size={20} color={theme.colors.error} />
                  <Text style={[styles.optionText, { color: theme.colors.error }]}>
                    {t('common.delete')}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            onReportPress && (
              <TouchableOpacity 
                key="report-option"
                style={styles.optionButton} 
                onPress={handleReport}
              >
                <Icon name="flag" size={20} color={theme.colors.error} />
                <Text style={[styles.optionText, { color: theme.colors.error }]}>
                  {t('common.report')}
                </Text>
              </TouchableOpacity>
            )
          )}
          
          <TouchableOpacity 
            key="cancel-option"
            style={[styles.optionButton, styles.cancelButton]} 
            onPress={() => setShowOptionsModal(false)}
          >
            <Icon name="x" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.optionText, { color: theme.colors.textSecondary }]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </FishivoModal>

      {/* Info Modal */}
      <FishivoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        preset="info"
        title={t('common.info')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowInfoModal(false)
        }}
      />
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  replyContainer: {
    paddingLeft: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timeAgo: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  edited: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  pinnedText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  commentText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  likedText: {
    color: theme.colors.error,
  },
  repliesContainer: {
    marginTop: theme.spacing.sm,
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
  viewRepliesText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default CommentItem;