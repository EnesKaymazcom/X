import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Button, AppHeader, ScreenContainer, FishivoModal, GearListItem } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { uploadImage } from '@/utils/unified-upload-service';
import { imageCropService } from '@fishivo/api/services/image/image-crop.native';
import type { User } from '@supabase/supabase-js';

interface AddGearScreenProps {
  navigation: any;
}

interface GearCategory {
  id: string;
  name: string;
  icon: string;
  items: string[];
}

interface Brand {
  id: string;
  name: string;
}

interface ExistingGear {
  id: string;
  name: string;
  brand: string;
  category: string;
  productLine?: string;
  modelName: string;
  imageUrl?: string;
  usageCount: number;
}

interface CategoryBrand {
  brand: string;
  productCount: number;
}

type ScreenState = 'categories' | 'brands' | 'products' | 'customForm';

const AddGearScreen: React.FC<AddGearScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  
  const [gearData, setGearData] = useState({
    name: '',
    category: '',
    brand: '',
    productLine: '',
    modelName: '',

    notes: '',
    imageUri: '',
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ExistingGear | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const gearCategories: GearCategory[] = [
    {
      id: 'lure',
      name: t('addGear.categories.lure'),
      icon: 'fishing-lure',
      items: ['rapala', 'siliconeBait', 'metalJig', 'spinner', 'spoon', 'popper', 'wobbler'].map(item => t(`addGear.gearItems.${item}`))
    },
    {
      id: 'hook',
      name: t('addGear.categories.hook'),
      icon: 'fishing-hook',
      items: ['circleHook', 'jHook', 'trebleHook', 'lead', 'swivel', 'snap'].map(item => t(`addGear.gearItems.${item}`))
    },
    {
      id: 'line',
      name: t('addGear.categories.line'),
      icon: 'fishing-line',
      items: ['monofilament', 'braided', 'fluorocarbon', 'steelLeader'].map(item => t(`addGear.gearItems.${item}`))
    },
    {
      id: 'reel',
      name: t('addGear.categories.reel'),
      icon: 'fishing-reel',
      items: ['spinningReel', 'castingReel', 'surfReel', 'trollingReel'].map(item => t(`addGear.gearItems.${item}`))
    },
    {
      id: 'rod',
      name: t('addGear.categories.rod'),
      icon: 'fishing-rod',
      items: ['spinningRod', 'castingRod', 'surfRod', 'trollingRod', 'flyRod'].map(item => t(`addGear.gearItems.${item}`))
    },
    {
      id: 'accessory',
      name: t('addGear.categories.accessory'),
      icon: 'fishing-net',
      items: ['bag', 'box', 'tweezers', 'net', 'fishScale', 'cutter', 'hookRemover'].map(item => t(`addGear.gearItems.${item}`))
    },
    {
      id: 'clothing',
      name: t('addGear.categories.clothing'),
      icon: 'fishing-vest',
      items: ['vest', 'boots', 'gloves', 'hat', 'glasses', 'lifeJacket'].map(item => t(`addGear.gearItems.${item}`))
    }
  ];

  // API'den ekipman veritabanını çek
  const [existingGearDatabase, setExistingGearDatabase] = useState<ExistingGear[]>([]);
  
  // Get user info
  useEffect(() => {
    const supabase = getNativeSupabaseClient();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
  }, []);
  
  useEffect(() => {
    const loadGearDatabase = async () => {
      try {
        // TODO: Gear database API'si eklendiğinde burası implementasyon yapılacak
        // const gearData = await equipmentService.getEquipmentDatabase();
        // setExistingGearDatabase(gearData);
        
        setExistingGearDatabase([]);
      } catch (error) {
        setExistingGearDatabase([]);
      }
    };
    
    loadGearDatabase();
  }, []);


  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery) return gearCategories;
    
    return gearCategories.filter(category =>
      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      category.items.some(item => 
        item.toLowerCase().includes(categorySearchQuery.toLowerCase())
      )
    );
  }, [categorySearchQuery]);

  // Get brands for selected category
  const categoryBrands = useMemo(() => {
    if (!selectedCategory) return [];
    
    const brandsInCategory = existingGearDatabase
      .filter(gear => gear.category === selectedCategory)
      .reduce((acc, gear) => {
        const existingBrand = acc.find(b => b.brand === gear.brand);
        if (existingBrand) {
          existingBrand.productCount++;
        } else {
          acc.push({ brand: gear.brand, productCount: 1 });
        }
        return acc;
      }, [] as CategoryBrand[]);

    if (!brandSearchQuery) return brandsInCategory;
    
    return brandsInCategory.filter(brand =>
      brand.brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
    );
  }, [selectedCategory, brandSearchQuery]);

  // Get products for selected category and brand
  const categoryProducts = useMemo(() => {
    if (!selectedCategory || !selectedBrand) return [];
    
    return existingGearDatabase
      .filter(gear => gear.category === selectedCategory && gear.brand === selectedBrand);
  }, [selectedCategory, selectedBrand]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentScreen('brands');
  };

  const handleSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentScreen('products');
  };

  const handleSelectProduct = (gear: ExistingGear) => {
    setSelectedProduct(gear);
    setShowConfirmModal(true);
  };

  const handleConfirmAddGear = async () => {
    setShowConfirmModal(false);
    try {
      if (selectedProduct && user?.id) {
        const apiService = createNativeApiService();
        
        // Equipment service'e yeni ekipman ekle
        await apiService.equipment.createEquipment(user.id, {
          name: selectedProduct.name,
          category: selectedProduct.category,
          brand: selectedProduct.brand,
          model: selectedProduct.modelName,
          condition: 'good' as const,
          notes: ''
        });
        
        setShowSuccessModal(true);
      }
    } catch (error) {
      setErrorMessage(t('addGear.saveError'));
      setShowErrorModal(true);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');
  };

  const handleGoToCustomForm = () => {
    setCurrentScreen('customForm');
  };

  const handleGoBack = () => {
    if (currentScreen === 'brands') {
      setCurrentScreen('categories');
      setSelectedCategory('');
    } else if (currentScreen === 'products') {
      setCurrentScreen('brands');
      setSelectedBrand('');
    } else if (currentScreen === 'customForm') {
      if (selectedBrand) {
        setCurrentScreen('products');
      } else if (selectedCategory) {
        setCurrentScreen('brands');
      } else {
        setCurrentScreen('categories');
      }
    } else {
      navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');
    }
  };

  const handleSave = async () => {
    if (!gearData.name || !gearData.category || !gearData.brand || !gearData.modelName) {
      setErrorMessage(t('addGear.requiredFieldsError'));
      setShowErrorModal(true);
      return;
    }

    try {
      if (user?.id) {
        const apiService = createNativeApiService();
        
        await apiService.equipment.createEquipment(user.id, {
          name: gearData.name,
          category: gearData.category,
          brand: gearData.brand,
          model: gearData.modelName,
          condition: 'good' as const,
          notes: gearData.notes
        });
        
        setSuccessMessage(t('addGear.saveSuccessMessage'));
        setShowSuccessModal(true);
      }
    } catch (error) {
      setErrorMessage(t('addGear.saveError'));
      setShowErrorModal(true);
    }
  };

  const selectedCategoryData = gearCategories.find(cat => cat.id === selectedCategory);
  const selectedFormCategory = gearCategories.find(cat => cat.id === gearData.category);




  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'categories': return t('addGear.categorySelect');
      case 'brands': return selectedCategoryData?.name || t('addGear.brandSelect');
      case 'products': return t('addGear.productSelect', { brand: selectedBrand });
      case 'customForm': return t('addGear.newGearTitle');
      default: return t('addGear.title');
    }
  };

  const getSearchProps = () => {
    switch (currentScreen) {
      case 'categories':
        return {
          value: categorySearchQuery,
          onChangeText: setCategorySearchQuery,
          placeholder: t('addGear.searchCategory')
        };
      case 'brands':
        return {
          value: brandSearchQuery,
          onChangeText: setBrandSearchQuery,
          placeholder: t('addGear.searchBrand')
        };
      default:
        return undefined;
    }
  };

  if (currentScreen === 'customForm') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title={getHeaderTitle()}
          leftButtons={[
            {
              icon: 'arrow-left',
              onPress: handleGoBack
            }
          ]}
          rightComponent={
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t('addGear.save')}</Text>
            </TouchableOpacity>
          }
        />

        <ScreenContainer paddingVertical="none">
          <ScrollView contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
          {/* Fotoğraf Ekleme */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('addGear.photo')}</Text>
            <TouchableOpacity 
              style={styles.photoContainer} 
              onPress={async () => {
                try {
                  const croppedUri = await imageCropService.openPickerWithCrop({
                    aspectRatio: 'square', // 1:1 for gear photos
                    quality: 0.8,
                    cropperTitle: t('common.cropPhoto')
                  });
                  
                  setGearData(prev => ({ ...prev, imageUri: croppedUri }));
                } catch (error) {
                }
              }}
            >
              {gearData.imageUri ? (
                <Image source={{ uri: gearData.imageUri }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Icon name="camera" size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.photoPlaceholderText}>{t('addGear.addPhoto')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('addGear.gearName')}</Text>
            <TextInput
              style={styles.input}
              value={gearData.name}
              onChangeText={(text) => setGearData(prev => ({ ...prev, name: text }))}
              placeholder={t('addGear.gearNamePlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('addGear.category')}</Text>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <View style={styles.categoryLeft}>
                {selectedFormCategory ? (
                  <>
                    <View style={styles.categoryIcon}>
                      <Icon name={selectedFormCategory.icon} size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.categoryText}>{selectedFormCategory.name}</Text>
                  </>
                ) : (
                  <Text style={styles.categoryPlaceholder}>{t('addGear.categoryPlaceholder')}</Text>
                )}
              </View>
              <Icon name="chevron-down" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('addGear.brand')}</Text>
            <TextInput
              style={styles.input}
              value={gearData.brand}
              onChangeText={(text) => setGearData(prev => ({ ...prev, brand: text }))}
              placeholder={t('addGear.brandPlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('addGear.modelName')}</Text>
            <TextInput
              style={styles.input}
              value={gearData.modelName}
              onChangeText={(text) => setGearData(prev => ({ ...prev, modelName: text }))}
              placeholder={t('addGear.modelNamePlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>



          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('addGear.notes')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={gearData.notes}
              onChangeText={(text) => setGearData(prev => ({ ...prev, notes: text }))}
              placeholder={t('addGear.notesPlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              textAlignVertical="top"
            />
          </View>
          </ScrollView>
        </ScreenContainer>

        {/* Category Modal */}
        <FishivoModal
          visible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          preset="selector"
          title={t('addGear.categorySelect')}
          renderRadioOptions={{
            options: gearCategories.map((category) => ({
              key: category.id,
              label: category.name
            })),
            selectedKey: gearData.category,
            onSelect: (key) => {
              setGearData(prev => ({ ...prev, category: key }));
              setShowCategoryModal(false);
            }
          }}
        />

        <FishivoModal
          visible={showSuccessModal}
          title={t('addGear.success')}
          onClose={() => {
            setShowSuccessModal(false);
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');
          }}
          preset="success"
          description={successMessage}
          primaryButton={{
            text: t('addGear.ok'),
            onPress: () => {
              setShowSuccessModal(false);
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');
            }
          }}
        />

        <FishivoModal
          visible={showErrorModal}
          title={t('addGear.error')}
          onClose={() => setShowErrorModal(false)}
          preset="error"
          description={errorMessage}
          primaryButton={{
            text: t('common.ok'),
            onPress: () => setShowErrorModal(false)
          }}
        />

        <FishivoModal
          visible={showErrorModal}
          title={t('addGear.error')}
          onClose={() => setShowErrorModal(false)}
          preset="error"
          description={errorMessage}
          primaryButton={{
            text: t('common.ok'),
            onPress: () => setShowErrorModal(false)
          }}
        />

      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={getHeaderTitle()}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: handleGoBack
          }
        ]}
        searchBar={getSearchProps()}
      />

      <ScreenContainer paddingVertical="none">
        {currentScreen === 'categories' && (
          <>
            {/* Quick Add Section - Moved above categories list */}
            <View style={styles.quickAddContainer}>
            <View style={styles.quickAddIconContainer}>
              <Icon name="help-circle" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.quickAddContent}>
              <Text style={styles.quickAddTitle}>{t('addGear.notFoundTitle.category')}</Text>
              <Text style={styles.quickAddSubtitle}>
                {t('addGear.notFoundSubtitle')}
              </Text>
            </View>
            <Button 
              variant="primary"
              size="sm"
              onPress={handleGoToCustomForm}
              icon="plus"
            >
              {t('common.add')}
            </Button>
          </View>

            {/* Categories List */}
            <FlatList
              data={filteredCategories}
              renderItem={({ item }) => (
                <GearListItem
                  name={item.name}
                  subtitle={item.items.slice(0, 3).join(', ') + (item.items.length > 3 ? '...' : '')}
                  icon={item.icon}
                  onPress={() => handleSelectCategory(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        {currentScreen === 'brands' && (
          <>
            {/* Quick Add Section - Moved above brands list */}
            <View style={styles.quickAddContainer}>
            <View style={styles.quickAddIconContainer}>
              <Icon name="help-circle" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.quickAddContent}>
              <Text style={styles.quickAddTitle}>{t('addGear.notFoundTitle.brand')}</Text>
              <Text style={styles.quickAddSubtitle}>
                {t('addGear.notFoundSubtitle')}
              </Text>
            </View>
            <Button 
              variant="primary"
              size="sm"
              onPress={handleGoToCustomForm}
              icon="plus"
            >
              {t('common.add')}
            </Button>
          </View>

            {/* Brands List */}
            <FlatList
              data={categoryBrands}
              renderItem={({ item }) => (
                <GearListItem
                  name={item.brand}
                  subtitle={selectedCategoryData?.name || ''}
                  usageCount={item.productCount}
                  icon="package"
                  onPress={() => handleSelectBrand(item.brand)}
                />
              )}
              keyExtractor={(item) => item.brand}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        {currentScreen === 'products' && (
          <>
            {/* Quick Add Section - Moved above products list */}
            <View style={styles.quickAddContainer}>
            <View style={styles.quickAddIconContainer}>
              <Icon name="help-circle" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.quickAddContent}>
              <Text style={styles.quickAddTitle}>{t('addGear.notFoundTitle.model')}</Text>
              <Text style={styles.quickAddSubtitle}>
                {t('addGear.notFoundSubtitle')}
              </Text>
            </View>
            <Button 
              variant="primary"
              size="sm"
              onPress={handleGoToCustomForm}
              icon="plus"
            >
              {t('common.add')}
            </Button>
          </View>

            {/* Products List */}
            <FlatList
              data={categoryProducts}
              renderItem={({ item }) => (
                <GearListItem
                  name={item.name}
                  subtitle={item.modelName}
                  usageCount={item.usageCount}
                  imageUrl={item.imageUrl}
                  onPress={() => handleSelectProduct(item)}
                />
              )}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </ScreenContainer>

      {/* Confirmation Modal */}
      <FishivoModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        preset="confirm"
        title={t('addGear.confirmAddTitle')}
        description={`${selectedProduct?.name} - ${selectedProduct?.brand}\n${t('addGear.confirmAddDescription')}`}
        primaryButton={{
          text: t('common.add'),
          onPress: handleConfirmAddGear
        }}
        secondaryButton={{
          text: t('addGear.cancel'),
          onPress: () => setShowConfirmModal(false)
        }}
      />

      {/* Success Modal - duplicate removed */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  saveButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.background,
    fontWeight: theme.typography.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: theme.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  categoryText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  categoryPlaceholder: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: theme.spacing.md,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  modalBody: {
    padding: theme.spacing.md,
  },
  categoryModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  list: {
    flex: 1,
  },
  quickAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickAddIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  quickAddContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  quickAddTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  quickAddSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },

  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  confirmModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  confirmProductContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    width: '100%',
  },
  confirmProductImageContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  confirmProductImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
  confirmProductPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmProductIcon: {
    fontSize: 24,
  },
  confirmProductInfo: {
    flex: 1,
  },
  confirmProductName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  confirmProductBrand: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  confirmProductUsage: {
    fontSize: theme.typography.xs,
    color: theme.colors.primary,
  },
  confirmModalTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  confirmModalDescription: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
  },
  confirmAddButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmAddText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.background,
    marginLeft: theme.spacing.sm,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  successButton: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.background,
  },
  saveButtonContainer: {
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  photoContainer: {
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  photoPlaceholderText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default AddGearScreen; 