import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, EmptyState } from '@/components/ui';
import { Theme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

interface UserLocation {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  type: string;
  catches: number;
  isFavorite: boolean;
}

interface ProfileSpotsTabProps {
  userLocations: UserLocation[];
  onSelectSpot: (location: UserLocation) => void;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ProfileSpotsTab: React.FC<ProfileSpotsTabProps> = ({ 
  userLocations, 
  onSelectSpot 
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const styles = createStyles(theme);

  if (userLocations.length === 0) {
    return (
      <View style={styles.tabContent}>
        <EmptyState 
          title={t('profile.spots.noSpots')}
          subtitle={t('profile.spots.addFirstSpot')}
        />
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.spotStats}>
        <View style={styles.statItem}>
          <Icon name="map-pin" size={24} color={theme.colors.primary} />
          <Text style={styles.spotStatNumber}>{userLocations.length}</Text>
          <Text style={styles.spotStatLabel}>{t('profile.spots.totalSpots')}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="star" size={24} color={theme.colors.warning} />
          <Text style={styles.spotStatNumber}>
            {userLocations.filter(spot => spot.isFavorite).length}
          </Text>
          <Text style={styles.spotStatLabel}>{t('profile.spots.favorites')}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="fish" size={24} color={theme.colors.success} />
          <Text style={styles.spotStatNumber}>
            {userLocations.reduce((total, spot) => total + (spot.catches || 0), 0)}
          </Text>
          <Text style={styles.spotStatLabel}>{t('profile.spots.totalCatches')}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('profile.spots.recentSpots')}</Text>
      </View>
      
      <View style={styles.recentSpots}>
        {userLocations.slice(0, 3).map(spot => (
          <TouchableOpacity 
            key={spot.id} 
            style={styles.recentSpotItem}
            onPress={() => onSelectSpot(spot)}
          >
            <View style={styles.spotIcon}>
              <Icon name="map-pin" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.spotInfo}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotLocation}>{spot.location}</Text>
            </View>
            <TouchableOpacity style={styles.spotAction} onPress={() => onSelectSpot(spot)}>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {userLocations.length > 3 && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('LocationManagement')}
        >
          <Text style={styles.viewAllText}>{t('profile.spots.viewAllSpots')}</Text>
          <Icon name="arrow-right" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  tabContent: {},
  
  spotStats: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  spotStatNumber: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  spotStatLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  
  recentSpots: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  recentSpotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  spotIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  spotLocation: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  spotAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.xs,
  },
  viewAllText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.primary,
  },
});