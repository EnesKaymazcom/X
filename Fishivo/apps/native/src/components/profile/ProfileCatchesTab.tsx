import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Icon, EmptyState } from '@/components/ui';
import { Theme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

interface RecentCatch {
  id: string;
  species: string;
  weight: {
    value: number;
    unit: string;
    originalUnit: string;
    displayValue: string;
  };
  length?: {
    value: number;
    unit: string;
    originalUnit: string;
    displayValue: string;
  };
  date: string;
  location: string;
  photo?: string;
  imageUrl?: string;
}

interface ProfileCatchesTabProps {
  recentCatches: RecentCatch[];
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ProfileCatchesTab: React.FC<ProfileCatchesTabProps> = ({ recentCatches }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const styles = createStyles(theme);

  if (recentCatches.length === 0) {
    return (
      <View style={styles.tabContent}>
        <EmptyState 
          title={t('profile.catches.noCatches')}
          subtitle={t('profile.catches.addFirstCatch')}
        />
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={{ gap: theme.spacing.md }}>
        {recentCatches.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.catchCard}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          >
            <View style={styles.catchPhoto}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.catchPhotoImage} />
              ) : (
                <Icon name="fish" size={24} color={theme.colors.primary} />
              )}
            </View>
            <View style={styles.catchInfo}>
              <Text style={styles.catchSpecies}>{item.species}</Text>
              <Text style={styles.catchWeight}>{item.weight.displayValue}</Text>
              <Text style={styles.catchLocation}>{item.location}</Text>
              <Text style={styles.catchDate}>
                {item.date ? new Date(item.date).toLocaleDateString('tr-TR') : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  tabContent: {},
  
  catchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
  },
  catchPhoto: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catchPhotoImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  catchInfo: {
    flex: 1,
  },
  catchSpecies: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: 2,
  },
  catchWeight: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
    marginBottom: 2,
  },
  catchLocation: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  catchDate: {
    fontSize: theme.typography.xs,
    color: theme.colors.textTertiary,
  },
});