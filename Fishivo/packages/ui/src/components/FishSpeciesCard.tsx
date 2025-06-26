import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from './Icon';
import { theme } from '@fishivo/shared';

interface FishSpeciesCardProps {
  species: {
    id: string;
    name: string;
    scientificName: string;
    image?: string;
    habitat: string;
    difficulty: 'easy' | 'medium' | 'hard';
    averageWeight: string;
    averageLength: string;
    season: string[];
  };
  onPress: (speciesId: string) => void;
}

const FishSpeciesCard: React.FC<FishSpeciesCardProps> = ({
  species,
  onPress,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Kolay';
      case 'medium':
        return 'Orta';
      case 'hard':
        return 'Zor';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(species.id)}
      activeOpacity={0.7}
    >
      {species.image ? (
        <Image source={{ uri: species.image }} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Icon name="fish" size={32} color={theme.colors.textSecondary} />
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {species.name}
          </Text>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: `${getDifficultyColor(species.difficulty)}20` }
          ]}>
            <Text style={[
              styles.difficultyText,
              { color: getDifficultyColor(species.difficulty) }
            ]}>
              {getDifficultyText(species.difficulty)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.scientificName} numberOfLines={1}>
          {species.scientificName}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="map-pin" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {species.habitat}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="ruler" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {species.averageLength}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="weight" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {species.averageWeight}
            </Text>
          </View>
        </View>
        
        <View style={styles.seasonContainer}>
          <Icon name="calendar" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.seasonText} numberOfLines={1}>
            {species.season.join(', ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.medium,
  },
  scientificName: {
    fontSize: theme.typography.sm,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  seasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seasonText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    flex: 1,
  },
});

export default FishSpeciesCard;