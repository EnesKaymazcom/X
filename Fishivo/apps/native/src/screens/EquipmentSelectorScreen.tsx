import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FishingGearUI } from '@fishivo/types';
import { createNativeApiService } from '@fishivo/api/services/native';
import { Icon, Button, EquipmentCard, AppHeader, ScreenContainer, SearchBar } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
// Mock JSON dosyaları kaldırıldı - API'den gelecek

interface EquipmentSelectorScreenProps {
  navigation: any;
  route: {
    params: {
      selectedEquipment: string[];
      onSelect: (equipment: string[]) => void;
    };
  };
}

const EquipmentSelectorScreen: React.FC<EquipmentSelectorScreenProps> = ({ navigation, route }) => {
  const { selectedEquipment, onSelect } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { user } = useSupabaseUser();
  const [localSelection, setLocalSelection] = useState<string[]>(selectedEquipment);
  const [searchText, setSearchText] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState<FishingGearUI[]>([]);

  // API'den kullanıcının ekipmanlarını çek
  const [userEquipment, setUserEquipment] = useState<FishingGearUI[]>([]);
  
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        // Real API çağrısı
        const apiService = createNativeApiService();
        const equipment = await apiService.user.getUserEquipment(user?.id || '');
        setUserEquipment(equipment);
      } catch (error) {
        console.error('Equipment yüklenirken hata:', error);
        setUserEquipment([]);
      }
    };

    loadEquipment();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredEquipment(userEquipment);
    } else {
      const filtered = userEquipment.filter(equipment =>
        equipment.name.toLowerCase().includes(searchText.toLowerCase()) ||
        equipment.category.toLowerCase().includes(searchText.toLowerCase()) ||
        (equipment.brand && equipment.brand.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredEquipment(filtered);
    }
  }, [searchText]);

  useEffect(() => {
    setFilteredEquipment(userEquipment);
  }, []);

  const toggleEquipment = (equipment: FishingGearUI) => {
    setLocalSelection(prev => {
      if (prev.includes(equipment.name)) {
        return prev.filter(item => item !== equipment.name);
      } else {
        return [...prev, equipment.name];
      }
    });
  };

  const handleSave = () => {
    onSelect(localSelection);
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');
  };

  const handleAddNew = () => {
    // Profildeki ekipman ekleme sayfasına yönlendir
    navigation.navigate('AddEquipment', {
      onEquipmentAdded: (newEquipment: FishingGearUI) => {
        // Yeni ekipman eklendiğinde otomatik seçili yap
        setLocalSelection(prev => [...prev, newEquipment.name]);
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('equipment.selectEquipment')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
        searchBar={{
          value: searchText,
          onChangeText: setSearchText,
          placeholder: t('equipment.searchPlaceholder')
        }}
      />
      
      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <Button
          variant="primary"
          size="sm"
          onPress={handleSave}
        >
          {t('common.ok')}
        </Button>
      </View>

      <ScreenContainer paddingVertical="none">
        <ScrollView style={styles.content} contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
          {/* Selected count */}
          <View style={styles.section}>
            <Text style={styles.selectedCount}>
              {t('equipment.selectedCount', { count: localSelection.length })}
            </Text>
          </View>

          {/* Equipment grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('equipment.myEquipment')} ({filteredEquipment.length})
            </Text>
            {filteredEquipment.length > 0 ? (
              <View style={styles.equipmentGrid}>
                {filteredEquipment.map((equipment) => {
                  const isSelected = localSelection.includes(equipment.name);
                  return (
                    <View key={equipment.id} style={styles.equipmentCardContainer}>
                      <TouchableOpacity
                        style={[styles.equipmentCardWrapper, isSelected && styles.equipmentCardSelected]}
                        onPress={() => toggleEquipment(equipment)}
                      >
                        <EquipmentCard item={equipment} />
                        <View style={[styles.selectOverlay, isSelected && styles.selectOverlayActive]}>
                          <View style={[styles.selectCheckbox, isSelected && styles.selectCheckboxActive]}>
                            {isSelected && <Icon name="check" size={16} color="#FFFFFF" />}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noResultsContainer}>
                <Icon name="search" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.noResultsText}>{t('equipment.noEquipment')}</Text>
                <Text style={styles.noResultsSubtext}>
                  {t('equipment.noEquipmentDesc')}
                </Text>
              </View>
            )}
          </View>

          {/* Add new equipment */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.addNewButton} onPress={handleAddNew}>
              <Icon name="plus" size={20} color={theme.colors.primary} />
              <Text style={styles.addNewText}>{t('equipment.addNewEquipment')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  scrollContent: {
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  saveButtonContainer: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: theme.spacing.md,
  },
  selectedCount: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  equipmentList: {
    gap: theme.spacing.sm,
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  equipmentItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  equipmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  equipmentText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    flex: 1,
  },
  equipmentTextSelected: {
    fontWeight: theme.typography.semibold,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  addNewText: {
    fontSize: theme.typography.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    padding: 0,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  equipmentCardContainer: {
    width: '48%',
  },
  equipmentCardWrapper: {
    position: 'relative',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  equipmentCardSelected: {
    transform: [{ scale: 0.98 }],
  },
  selectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectOverlayActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  selectCheckbox: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 4,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCheckboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
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
});

export default EquipmentSelectorScreen; 