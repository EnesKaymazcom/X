import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps {
  children: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surface}
      highlightColor={theme.colors.surfaceVariant}
    >
      {children}
    </SkeletonPlaceholder>
  );
};

// Re-export Item for convenience
export const SkeletonItem = SkeletonPlaceholder.Item;

export default Skeleton;