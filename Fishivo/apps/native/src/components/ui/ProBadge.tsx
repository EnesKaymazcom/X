import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '@/components/ui/Icon';
import CrownIcon from '@/components/ui/CrownIcon';
import { useTheme } from '@/contexts/ThemeContext';

interface ProBadgeProps {
  variant?: 'icon' | 'badge' | 'banner' | 'button';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: any;
  showText?: boolean;
  text?: string;
}

const ProBadge: React.FC<ProBadgeProps> = ({
  variant = 'badge',
  size = 'md',
  onPress,
  style,
  showText = true,
  text = 'PRO',
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 17;
      case 'md': return 24;
      case 'lg': return 28;
      default: return 24;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return theme.typography.xs;
      case 'md': return theme.typography.sm;
      case 'lg': return theme.typography.base;
      default: return theme.typography.sm;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingHorizontal: theme.spacing.xs, paddingVertical: 2 };
      case 'md': return { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs };
      case 'lg': return { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm };
      default: return { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs };
    }
  };

  const renderIcon = () => (
    <CrownIcon size={getIconSize()} />
  );

  const renderText = () => showText && (
    <Text style={[
      styles.proText,
      { fontSize: getFontSize() },
      variant === 'icon' && { color: theme.colors.accent }
    ]}>
      {text}
    </Text>
  );

  // Icon-only variant
  if (variant === 'icon') {
    if (onPress) {
      return (
        <TouchableOpacity
          style={[styles.iconContainer, style]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {renderIcon()}
          {showText && (
            <Text style={[styles.iconText, { fontSize: getFontSize() }]}>
              {text}
            </Text>
          )}
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={[styles.iconContainer, style]}>
          {renderIcon()}
          {showText && (
            <Text style={[styles.iconText, { fontSize: getFontSize() }]}>
              {text}
            </Text>
          )}
        </View>
      );
    }
  }

  // Badge variant
  if (variant === 'badge') {
    if (onPress) {
      return (
        <TouchableOpacity
          style={[
            styles.badgeContainer,
            getPadding(),
            style
          ]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {renderIcon()}
          {renderText()}
        </TouchableOpacity>
      );
    } else {
      return (
        <View
          style={[
            styles.badgeContainer,
            getPadding(),
            style
          ]}
        >
          {renderIcon()}
          {renderText()}
        </View>
      );
    }
  }

  // Banner variant (wider, more prominent)
  if (variant === 'banner') {
    if (onPress) {
      return (
        <TouchableOpacity
          style={[styles.bannerContainer, style]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.bannerContent}>
            {renderIcon()}
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>PRO</Text>
              <Text style={styles.bannerSubtitle}>Premium Özellik</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={[styles.bannerContainer, style]}>
          <View style={styles.bannerContent}>
            {renderIcon()}
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>PRO</Text>
              <Text style={styles.bannerSubtitle}>Premium Özellik</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={16} color="#FFFFFF" />
        </View>
      );
    }
  }

  // Button variant (call to action)
  if (variant === 'button') {
    return (
      <TouchableOpacity
        style={[styles.buttonContainer, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {renderIcon()}
        <Text style={styles.buttonText}>PRO'ya Geç</Text>
      </TouchableOpacity>
    );
  }

  return null;
};

const createStyles = (theme: any) => StyleSheet.create({
  // Icon variant
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconText: {
    color: theme.colors.accent,
    fontWeight: theme.typography.bold,
  },

  // Badge variant
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E', // Koyu arka plan
    borderRadius: theme.borderRadius.sm, // Daha küçük radius
    gap: theme.spacing.xs,
    elevation: 2,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  proText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.bold,
    letterSpacing: 0.5,
  },

  // Banner variant
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    elevation: 3,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  bannerText: {
    gap: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    color: '#FFFFFF',
    fontSize: theme.typography.xs,
    opacity: 0.9,
  },

  // Button variant
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    elevation: 4,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    letterSpacing: 0.5,
  },
});

export default ProBadge; 