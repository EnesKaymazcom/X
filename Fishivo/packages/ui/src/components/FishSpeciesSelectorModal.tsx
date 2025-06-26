import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import Icon from './Icon';
import BottomSheetModal from './BottomSheetModal';
import { theme } from '@fishivo/shared';

interface FishSpeciesSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (species: string, waterType: 'freshwater' | 'saltwater') => void;
  selectedSpecies?: string;
}

const FishSpeciesSelectorModal: React.FC<FishSpeciesSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedSpecies,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredSpecies, setFilteredSpecies] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'freshwater' | 'saltwater' | null>(null);
  const [fishSpecies, setFishSpecies] = useState<{
    saltwater: string[];
    freshwater: string[];
  }>({
    saltwater: [],
    freshwater: []
  });

  const categories = [
    { id: 'saltwater', title: 'Tuzlu Su', icon: 'waves' },
    { id: 'freshwater', title: 'Tatlı Su', icon: 'droplet' },
  ] as const;

  useEffect(() => {
    let currentSpecies: string[] = [];
    
    if (selectedCategory === 'saltwater') {
      currentSpecies = fishSpecies.saltwater;
    } else if (selectedCategory === 'freshwater') {
      currentSpecies = fishSpecies.freshwater;
    } else {
      // Kategori seçilmediğinde boş liste
      currentSpecies = [];
    }

    if (searchText.trim() === '') {
      setFilteredSpecies(currentSpecies);
    } else {
      const filtered = currentSpecies.filter(species =>
        species.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSpecies(filtered);
    }
  }, [searchText, selectedCategory, fishSpecies]);

  useEffect(() => {
    if (visible) {
      setSelectedCategory(null);
      setSearchText('');
      loadSpecies();
    }
  }, [visible]);

  const loadSpecies = async () => {
    try {
      // Fallback veriler - gerçek uygulamada API'den gelecek
      setFishSpecies({
        saltwater: [
          'Levrek', 'Çupra', 'Kalkan', 'Barbun', 'Mercan', 'Kefal', 'Palamut', 
          'Lüfer', 'Sarıkanat', 'İstavrit', 'Hamsi', 'Mezgit', 'Tekir', 'Uskumru',
          'Çinekop', 'Dil Balığı', 'Fangri', 'Karagöz', 'Sardalya', 'Trakonya'
        ],
        freshwater: [
          'Alabalık', 'Sazan', 'Turna', 'Sudak', 'Yayın', 'Kadife', 'Tatlısu Kefali',
          'Gölbaşı', 'Siraz', 'Çapak', 'Tatlısu Levreği', 'Pike', 'Karabalık'
        ]
      });
    } catch (error) {
      console.error('Balık türleri yüklenirken hata:', error);
    }
  };

  const handleSelect = (species: string) => {
    if (selectedCategory) {
      onSelect(species, selectedCategory);
      onClose();
    }
  };

  const renderSpeciesItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.speciesItem,
        selectedSpecies === item && styles.selectedSpeciesItem
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.speciesContent}>
        <View style={styles.fishIcon}>
          <Icon name="fish" size={20} color={theme.colors.primary} />
        </View>
        <Text style={[
          styles.speciesName,
          selectedSpecies === item && styles.selectedSpeciesName
        ]}>
          {item}
        </Text>
      </View>
      {selectedSpecies === item && (
        <Icon name="check" size={16} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      maxHeight="80%"
    >
      <Text style={styles.title}>Balık Türü Seç</Text>
      <Text style={styles.subtitle}>Yakaladığınız balığın türünü seçin</Text>

          {/* Kategoriler */}
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Icon 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? '#FFFFFF' : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Arama */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={16} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Balık türü ara..."
              placeholderTextColor={theme.colors.textSecondary}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="x" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Balık Türleri Listesi */}
          <View style={styles.listContainer}>
            {selectedCategory === null ? (
              <View style={styles.noResultsContainer}>
                <Icon name="droplet" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.noResultsText}>Su türü seçin</Text>
                <Text style={styles.noResultsSubtext}>
                  Önce tatlı su veya tuzlu su seçeneğini seçin
                </Text>
              </View>
            ) : filteredSpecies.length > 0 ? (
              <FlatList
                data={filteredSpecies}
                renderItem={renderSpeciesItem}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                style={styles.speciesList}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Icon name="search" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.noResultsText}>Balık türü bulunamadı</Text>
                <Text style={styles.noResultsSubtext}>
                  Farklı anahtar kelimeler deneyin
                </Text>
              </View>
            )}
          </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelText}>İptal</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.typography.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    padding: 0,
  },
  listContainer: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  speciesList: {
    flex: 1,
  },
  speciesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  selectedSpeciesItem: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}05`,
  },
  speciesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fishIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  speciesName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    flex: 1,
  },
  selectedSpeciesName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.semibold,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  noResultsText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  noResultsSubtext: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.textSecondary,
  },
});

export default FishSpeciesSelectorModal;