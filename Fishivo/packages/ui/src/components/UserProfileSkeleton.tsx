import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';

// This is a simplified skeleton loader. For a more advanced version,
// you could use libraries like 'react-native-skeleton-placeholder'
// to add shimmering animations.

const SkeletonBlock = ({ width, height, style }: { width: number | string; height: number; style?: any }) => (
  <View style={[{ width, height, backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.borderRadius.md }, style]} />
);

const UserProfileSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonBlock width={100} height={100} style={{ borderRadius: 50 }} />
        <View style={styles.statsContainer}>
          <SkeletonBlock width={50} height={20} />
          <SkeletonBlock width={60} height={20} />
          <SkeletonBlock width={50} height={20} />
        </View>
      </View>

      {/* Info Skeleton */}
      <View style={styles.info}>
        <SkeletonBlock width="60%" height={24} style={{ marginBottom: theme.spacing.sm }} />
        <SkeletonBlock width="40%" height={16} style={{ marginBottom: theme.spacing.md }} />
        <SkeletonBlock width="100%" height={16} />
        <SkeletonBlock width="80%" height={16} style={{ marginTop: theme.spacing.xs }}/>
      </View>

      {/* Buttons Skeleton */}
      <View style={styles.buttons}>
        <SkeletonBlock width="80%" height={40} />
        <SkeletonBlock width={40} height={40} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  info: {
    marginBottom: theme.spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
});

export default UserProfileSkeleton;