import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import Button from './Button';
import { theme } from '@fishivo/shared';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  title?: string;
  onClose: () => void;
  buttonText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  title = 'Başarılı!',
  onClose,
  buttonText = 'Tamam'
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.blurContainer}>
          <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Icon name="check" size={32} color={theme.colors.success} />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {title}
          </Text>
          
          {/* Message */}
          <Text style={styles.message}>
            {message}
          </Text>

          {/* Close Button */}
          <Button
            onPress={onClose}
            style={styles.button}
          >
            {buttonText}
          </Button>
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
    backgroundColor: `${theme.colors.success}15`,
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
  button: {
    width: '100%',
  },
});

export default SuccessModal;