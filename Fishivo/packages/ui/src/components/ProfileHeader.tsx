import React from 'react';
import { View, StyleSheet } from 'react-native';
import UserDisplayName from './UserDisplayName';
import ProBadge from './ProBadge';
import { theme } from '@fishivo/shared';

interface ProfileHeaderProps {
  name: string;
  isPro?: boolean;
  onProPress?: () => void;
  nameSize?: 'sm' | 'md' | 'lg';
  showUsername?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  isPro = false,
  onProPress,
  nameSize = 'lg',
  showUsername = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Real Name + PRO Badge */}
      <View style={styles.nameRow}>
        <UserDisplayName name={name} size={nameSize} showFullName={true} />
        {isPro && (
          <ProBadge 
            variant="icon" 
            size="sm" 
            showText={false}
            onPress={onProPress}
          />
        )}
      </View>
      
      {/* Username */}
      {showUsername && (
        <View style={styles.usernameRow}>
          <UserDisplayName name={name} size="md" showFullName={false} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  usernameRow: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
});

export default ProfileHeader;