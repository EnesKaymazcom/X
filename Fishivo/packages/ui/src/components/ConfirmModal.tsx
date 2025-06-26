import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import Button from './Button';
import { theme } from '../theme/index';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'destructive' | 'success' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Tamam',
  cancelText = 'İptal',
  type = 'default'
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'destructive':
        return { icon: 'trash-2', color: theme.colors.error };
      case 'success':
        return { icon: 'check', color: theme.colors.success };
      case 'warning':
        return { icon: 'alert-triangle', color: theme.colors.warning };
      default:
        return { icon: 'info', color: theme.colors.primary };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.blurContainer}>
          <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <Icon name={icon} size={32} color={color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {title}
          </Text>
          
          {/* Message */}
          {message && (
            <Text style={styles.message}>
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              variant="secondary"
              onPress={onCancel}
              style={styles.cancelButton}
            >
              {cancelText}
            </Button>
            <Button
              variant={type === 'destructive' ? 'destructive' : 'primary'}
              onPress={onConfirm}
              style={styles.confirmButton}
            >
              {confirmText}
            </Button>
          </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default ConfirmModal;