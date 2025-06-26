import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';
import Button from './Button';
import Avatar from './Avatar';
import { theme } from '@fishivo/shared';

// Placeholder for ProfileHeader component
const ProfileHeader = ({ name, isPro, nameSize, onProPress }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <Text style={{ fontSize: nameSize === 'lg' ? 18 : 16, fontWeight: 'bold', color: theme.colors.text }}>
      {name}
    </Text>
    {isPro && (
      <TouchableOpacity onPress={onProPress}>
        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>PRO</Text>
      </TouchableOpacity>
    )}
  </View>
);

interface UserProfileLayoutProps {
  userData: {
    name: string;
    avatar?: string;
    location: string;
    catchCount: number;
    followers: number;
    following: number;
    bio: string;
    isPro?: boolean;
  };
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onPrimaryAction: () => void;
  onShareAction: () => void;
  onFollowToggle?: () => void;
  onProPress?: () => void;
  noPadding?: boolean;
  followDisabled?: boolean;
}

const UserProfileLayout: React.FC<UserProfileLayoutProps> = ({
  userData,
  isOwnProfile = false,
  isFollowing = false,
  onPrimaryAction,
  onShareAction,
  onFollowToggle,
  onProPress,
  noPadding = false,
  followDisabled = false,
}) => {
  return (
    <View style={[styles.profileSection, noPadding && styles.noPadding]}>
      <View style={styles.profileHeader}>
        <Avatar uri={userData.avatar} size={100} name={userData.name} />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(userData.catchCount || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Avlar</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(userData.followers || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Takipçi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(userData.following || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Takip</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <ProfileHeader 
          name={userData.name}
          isPro={userData.isPro}
          nameSize="lg"
          onProPress={onProPress}
        />
        <View style={styles.locationRow}>
          <Icon name="map-pin" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.locationText}>{userData.location}</Text>
        </View>
        <Text style={styles.bioText}>{userData.bio}</Text>
      </View>

      <View style={styles.actionButtons}>
        <Button 
          variant={isOwnProfile ? "secondary" : (isFollowing ? "secondary" : "primary")}
          size="md" 
          icon={isOwnProfile ? "edit" : (isFollowing ? "user" : "user-plus")}
          onPress={isOwnProfile ? onPrimaryAction : (onFollowToggle || (() => {}))}
          disabled={followDisabled}
          style={{ flex: 1 }}
        >
          {isOwnProfile ? 'Düzenle' : (isFollowing ? 'Takip Ediliyor' : 'Takip Et')}
        </Button>
        
        <Button 
          variant="ghost" 
          size="md" 
          icon="share" 
          onPress={onShareAction}
          style={{ width: 40, paddingHorizontal: 0, backgroundColor: theme.colors.surfaceVariant }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  statLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profileInfo: {
    marginBottom: theme.spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  bioText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
});

export default UserProfileLayout;