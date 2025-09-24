import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import { Icon } from '@/components/ui';
import { CommentWithUser } from '@fishivo/types';
import { validateCommentContent, getValidationErrorMessage, CommentValidationResult } from '@fishivo/utils';

interface CommentInputProps {
  onSubmit: (content: string, parentId?: number) => Promise<void>;
  replyingTo?: CommentWithUser | null;
  onCancelReply?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  editingComment?: CommentWithUser | null;
  onCancelEdit?: () => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  replyingTo,
  onCancelReply,
  placeholder,
  autoFocus = false,
  editingComment,
  onCancelEdit,
}) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const styles = createStyles(theme);
  const inputRef = useRef<TextInput>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  
  // Single function to clear input - no duplicates
  const clearInput = useCallback(() => {
    setContent('');
    setValidationError(null);
    // Force TextInput remount to ensure clearing
    setInputKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (editingComment) {
      setContent(editingComment.content);
      inputRef.current?.focus();
    }
  }, [editingComment]);

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleContentChange = (text: string) => {
    setContent(text);
    
    // Real-time validation
    if (text.trim()) {
      const validation: CommentValidationResult = validateCommentContent(text);
      if (!validation.isValid && validation.reason) {
        setValidationError(getValidationErrorMessage(validation.reason, locale as 'tr' | 'en'));
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    
    // Early validation checks
    if (!trimmedContent) {
      clearInput();
      return;
    }
    
    if (isSubmitting || validationError) {
      return;
    }

    // Final validation before submit
    const validation: CommentValidationResult = validateCommentContent(trimmedContent);
    if (!validation.isValid) {
      if (validation.reason) {
        setValidationError(getValidationErrorMessage(validation.reason, locale as 'tr' | 'en'));
      }
      clearInput();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedContent, replyingTo?.id);
      clearInput();
      Keyboard.dismiss();
      
      if (editingComment && onCancelEdit) {
        onCancelEdit();
      }
    } catch (error) {
      clearInput();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (editingComment && onCancelEdit) {
      onCancelEdit();
      clearInput();
    } else if (replyingTo && onCancelReply) {
      onCancelReply();
      clearInput();
    }
    Keyboard.dismiss();
  };

  const getPlaceholder = () => {
    if (editingComment) {
      return t('common.editComment');
    }
    if (replyingTo) {
      return t('common.replyTo', { username: replyingTo.user.username });
    }
    return placeholder || t('common.addComment');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={styles.keyboardAvoidingView}
        >
          <View style={[
            styles.container,
            isFocused && styles.focusedContainer
          ]}>
            {(replyingTo || editingComment) && (
              <View style={styles.replyHeader}>
                <View style={styles.replyInfo}>
                  <Icon 
                    name={editingComment ? 'edit-2' : 'chevron-right'} 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                  {editingComment ? (
                    <Text style={styles.replyText}>
                      {t('common.editingComment')}
                    </Text>
                  ) : (
                    <Text style={styles.replyTextContainer}>
                      <Text style={styles.replyTextUsername}>
                        @{replyingTo?.user.username}
                      </Text>
                      <Text style={styles.replyTextNormal}>
                        {' ' + t('common.replyingToUser')}
                      </Text>
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  onPress={handleCancel}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="x" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <TextInput
                  key={inputKey}
                  ref={inputRef}
                  style={[
                    styles.input,
                    validationError && styles.inputError
                  ]}
                  value={content}
                  onChangeText={handleContentChange}
                  placeholder={getPlaceholder()}
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  maxLength={500}
                  autoFocus={autoFocus}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  returnKeyType="default"
                  blurOnSubmit={false}
                  onSubmitEditing={handleSubmit}
                />

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!content.trim() || isSubmitting || validationError) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!content.trim() || isSubmitting || !!validationError}
                  activeOpacity={0.7}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.background} />
                  ) : (
                    <Icon 
                      name="send" 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  )}
                </TouchableOpacity>
              </View>
              
              {validationError && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color={theme.colors.error} />
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
  },
  wrapper: {
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 0,
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  focusedContainer: {
    // borderTopColor kaldırıldı - çizgi mavi olmasın
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  replyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xs,
  },
  replyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  replyTextContainer: {
    fontSize: 12,
    flex: 1,
  },
  replyTextNormal: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  replyTextUsername: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  cancelButton: {
    // No background style - just the X icon
  },
  inputWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xs : 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: 56,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 14,
    color: theme.colors.text,
    textAlignVertical: 'center',
    lineHeight: 20,
  },
  inputError: {
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    flex: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  sendButtonDisabled: {
    backgroundColor: '#007AFF',
    borderWidth: 0,
    opacity: 0.5,
  },
});

export default CommentInput;