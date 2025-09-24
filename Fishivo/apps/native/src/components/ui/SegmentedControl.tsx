import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface Segment {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  selectedValue,
  onValueChange,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const selectedIndex = segments.findIndex(s => s.value === selectedValue);
    if (selectedIndex !== -1 && containerWidth > 0) {
      const padding = theme.spacing.sm;
      const totalPadding = padding * 2;
      const gap = 4; // Her segment arasında boşluk
      const availableWidth = containerWidth - totalPadding - (gap * (segments.length - 1));
      const segmentWidth = availableWidth / segments.length;
      
      Animated.spring(slideAnim, {
        toValue: padding + (selectedIndex * (segmentWidth + gap)),
        useNativeDriver: false,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [selectedValue, segments, containerWidth, theme.spacing.sm]);

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.slider,
            {
              width: (containerWidth - (theme.spacing.sm * 2) - (4 * (segments.length - 1))) / segments.length,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        />
      )}
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment.value}
          style={[
            styles.segment,
            index === 0 && styles.firstSegment,
            index === segments.length - 1 && styles.lastSegment,
          ]}
          onPress={() => !disabled && onValueChange(segment.value)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text
            style={[
              styles.segmentText,
              selectedValue === segment.value && styles.selectedSegmentText,
              disabled && styles.disabledSegmentText,
            ]}
          >
            {segment.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    top: theme.spacing.sm,
    bottom: theme.spacing.sm,
    left: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  firstSegment: {
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  lastSegment: {
    borderTopRightRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  segmentText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.textSecondary,
  },
  selectedSegmentText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.semibold,
  },
  disabledSegmentText: {
    opacity: 0.5,
  },
});

export default SegmentedControl;