import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import AppHeader from '../components/AppHeader';
import { theme } from '../theme';
import { ScreenContainer } from '../components';
// Mock JSON dosyası kaldırıldı - API'den gelecek
import { apiService } from '../services/api';

interface FishSpeciesScreenProps {
  navigation: any;
}

interface FishSpecies {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  postCount: number;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  season: string;
  image: string;
  minWeight?: number;
  maxWeight?: number;
  averageLength?: number;
  habitat?: string;
  baitTypes?: string[];
  bestTimeOfDay?: string[];
  waterDepth?: string;
}

// Mock data kaldırıldı - API'den gelecek
const allFishSpecies: FishSpecies[] = [];

const FishSpeciesScreen: React.FC<FishSpeciesScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [allFishSpecies, setAllFishSpecies] = useState<FishSpecies[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(true);

  // API'den fish species yükle
  useEffect(() => {
    const loadSpecies = async () => {
      try {
        setLoading(true);
        const speciesData = await apiService.getSpecies();
        
        // API response'u component format'ına çevir
        const formattedSpecies = speciesData.map((species: any) => ({
          id: species.id.toString(),
          name: species.name,
          scientificName: species.latin_name || species.scientific_name || '',
          description: species.description || 'Açıklama mevcut değil',
          postCount: 0, // TODO: API'den gelecek
          difficulty: 'Orta' as const, // TODO: API'den gelecek
          season: 'Tüm yıl', // TODO: API'den gelecek
          image: species.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
          minWeight: species.min_weight,
          maxWeight: species.max_weight,
          averageLength: species.average_length,
          habitat: species.habitat,
          baitTypes: species.bait_types,
          bestTimeOfDay: species.best_time_of_day,
          waterDepth: species.water_depth
        }));
        
        setAllFishSpecies(formattedSpecies);
        setFilteredSpecies(formattedSpecies);
      } catch (error) {
        console.error('Fish species yüklenirken hata:', error);
        setAllFishSpecies([]);
        setFilteredSpecies([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpecies();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredSpecies(allFishSpecies);
    } else {
      const filtered = allFishSpecies.filter(species =>
        species.name.toLowerCase().includes(text.toLowerCase()) ||
        species.scientificName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSpecies(filtered);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return '#22C55E';
      case 'Orta': return '#F59E0B';
      case 'Zor': return '#EF4444';
      default: return theme.colors.textSecondary;
    }
  };

  const handleSpeciesPress = (species: FishSpecies) => {
    navigation.navigate('FishDetail', { species });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Balık Türleri"
        leftButtons={[
          {
            icon: "arrow-left",
            onPress: () => navigation.goBack()
          }
        ]}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Balık türü ara..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="x" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredSpecies.length} tür • {filteredSpecies.reduce((sum, species) => sum + species.postCount, 0)} gönderi
        </Text>
      </View>

      {/* Fish Species List */}
      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
        {filteredSpecies.map((species) => (
          <TouchableOpacity
            key={species.id}
            style={styles.speciesCard}
            onPress={() => handleSpeciesPress(species)}
          >
            <View style={styles.speciesIcon}>
              <Image
                source={{ uri: species.image }}
                style={styles.speciesImage}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.speciesInfo}>
              <View style={styles.speciesHeader}>
                <Text style={styles.speciesName}>{species.name}</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(species.difficulty) + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(species.difficulty) }]}>
                    {species.difficulty}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.scientificName}>{species.scientificName}</Text>
              <Text style={styles.speciesDescription}>{species.description}</Text>
              
              <View style={styles.speciesStats}>
                <View style={styles.statItem}>
                  <Icon name="message-circle" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.statText}>{species.postCount} gönderi</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="clock" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.statText}>{species.season}</Text>
                </View>
              </View>
            </View>
            
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}
        </ScrollView>
      </ScreenContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  placeholder: {
    width: 24,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  statsText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  speciesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  speciesIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesImage: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
  },
  speciesInfo: {
    flex: 1,
  },
  speciesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  speciesName: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.semibold,
  },
  scientificName: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  speciesDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  speciesStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
});

export default FishSpeciesScreen;