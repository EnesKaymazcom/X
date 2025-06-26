import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  AddButton,
  AppHeader,
  ScreenContainer,
  SuccessModal
} from '@fishivo/ui';
import { theme } from '@fishivo/shared/theme';
import { apiService } from '@fishivo/shared/services';

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
      name: 'Yapay Yem',
      icon: 'fishing-lure',
      items: ['Rapala', 'Silikon Yem', 'Metal Jig', 'Spinner', 'Spoon', 'Popper', 'Wobbler']
    },
    {
      id: 'hook',
      name: 'İğne & Terminal',
      icon: 'fishing-hook',
      items: ['Circle Hook', 'J Hook', 'Treble Hook', 'Kurşun', 'Swivel', 'Snap']
    },
    {
      id: 'line',
      name: 'Misina & İp',
      icon: 'fishing-line',
      items: ['Monofilament', 'Braided', 'Fluorocarbon', 'Steel Leader']
    },
    {
      id: 'reel',
      name: 'Makine',
      icon: 'fishing-reel',
      items: ['Spinning Makine', 'Casting Makine', 'Surf Makine', 'Trolling Makine']
    },
    {
      id: 'rod',
      name: 'Olta Kamışı',
      icon: 'fishing-rod',
      items: ['Spinning Kamış', 'Casting Kamış', 'Surf Kamış', 'Trolling Kamış', 'Fly Kamış']
    },
    {
      id: 'accessory',
      name: 'Aksesuarlar',
      icon: 'fishing-net',
      items: ['Çanta', 'Kutu', 'Pinset', 'Net', 'Balık Tartısı', 'Kesici', 'İğne Kesici']
    },
    {
      id: 'clothing',
      name: 'Giyim & Güvenlik',
      icon: 'fishing-vest',
      items: ['Yelek', 'Çizme', 'Eldiven', 'Şapka', 'Gözlük', 'Can Yeleği']
    }
  ];

  // API'den ekipman veritabanını çek
  const [existingGearDatabase, setExistingGearDatabase] = useState<ExistingGear[]>([]);
  
  useEffect(() => {
    const loadGearDatabase = async () => {
      try {
        // Real API çağrısı
        const gearData = await apiService.getGearDatabase();
        setExistingGearDatabase(gearData.items || []);
      } catch (error) {
        console.error('Gear database yüklenirken hata:', error);
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

  const handleConfirmAddGear = () => {
    setShowConfirmModal(false);
    // Burada API call yapılacak
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 100);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
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
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (!gearData.name || !gearData.category || !gearData.brand || !gearData.modelName) {
      setErrorMessage('Lütfen zorunlu alanları doldurun (Kategori, Marka, Model Adı, Ekipman Adı)');
      setShowErrorModal(true);
      return;
    }

    try {
      setSuccessMessage('Yeni ekipman başarıyla eklendi ve moderasyona gönderildi');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Ekipman eklenirken bir hata oluştu');
      setShowErrorModal(true);
    }
  };

  const selectedCategoryData = gearCategories.find(cat => cat.id === selectedCategory);
  const selectedFormCategory = gearCategories.find(cat => cat.id === gearData.category);

  const renderCategoryItem = ({ item }: { item: GearCategory }) => (
    <TouchableOpacity
      style={styles.categoryListItem}
      onPress={() => handleSelectCategory(item.id)}
    >
      <View style={styles.categoryIconContainer}>
        <Icon name={item.icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryItems}>
          {item.items.slice(0, 3).join(', ')}
          {item.items.length > 3 && '...'}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderBrandItem = ({ item }: { item: CategoryBrand }) => (
    <TouchableOpacity
      style={styles.brandListItem}
      onPress={() => handleSelectBrand(item.brand)}
    >
      <Text style={styles.brandName}>{item.brand}</Text>
      <View style={styles.brandRight}>
        <Text style={styles.brandCount}>{item.productCount} ürün</Text>
        <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: ExistingGear }) => (
    <TouchableOpacity
      style={styles.productListItem}
      onPress={() => handleSelectProduct(item)}
    >
      <View style={styles.productImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.productPlaceholder}>
            <Icon name="package" size={24} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productUsage}>{item.usageCount} kişi kullanıyor</Text>
      </View>
      <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderCategoriesScreen = () => (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kategori ara..."
          value={categorySearchQuery}
          onChangeText={setCategorySearchQuery}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <FlatList
        data={filteredCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );

  const renderBrandsScreen = () => (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Marka ara..."
          value={brandSearchQuery}
          onChangeText={setBrandSearchQuery}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <FlatList
        data={categoryBrands}
        renderItem={renderBrandItem}
        keyExtractor={(item) => item.brand}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <TouchableOpacity style={styles.quickAddButton} onPress={handleGoToCustomForm}>
            <View style={styles.quickAddContent}>
              <Icon name="plus" size={20} color={theme.colors.primary} />
              <View style={styles.quickAddTextContainer}>
                <Text style={styles.quickAddTitle}>Yeni Marka Ekle</Text>
                <Text style={styles.quickAddSubtitle}>Bulamadığınız markayı ekleyin</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        }
      />
    </View>
  );

  const renderProductsScreen = () => (
    <View style={styles.container}>
      <FlatList
        data={categoryProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <TouchableOpacity style={styles.quickAddButton} onPress={handleGoToCustomForm}>
            <View style={styles.quickAddContent}>
              <Icon name="plus" size={20} color={theme.colors.primary} />
              <View style={styles.quickAddTextContainer}>
                <Text style={styles.quickAddTitle}>Yeni Ürün Ekle</Text>
                <Text style={styles.quickAddSubtitle}>Bulamadığınız ürünü ekleyin</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        }
      />
    </View>
  );

  const renderCustomFormScreen = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Kategori *</Text>
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.selectorText, !gearData.category && styles.placeholderText]}>
            {selectedFormCategory?.name || 'Kategori seçin'}
          </Text>
          <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Marka *</Text>
        <TextInput
          style={styles.input}
          value={gearData.brand}
          onChangeText={(text) => setGearData(prev => ({ ...prev, brand: text }))}
          placeholder="Marka adı"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Model Adı *</Text>
        <TextInput
          style={styles.input}
          value={gearData.modelName}
          onChangeText={(text) => setGearData(prev => ({ ...prev, modelName: text }))}
          placeholder="Model adı"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Ekipman Adı *</Text>
        <TextInput
          style={styles.input}
          value={gearData.name}
          onChangeText={(text) => setGearData(prev => ({ ...prev, name: text }))}
          placeholder="Ekipman adı"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Ürün Serisi</Text>
        <TextInput
          style={styles.input}
          value={gearData.productLine}
          onChangeText={(text) => setGearData(prev => ({ ...prev, productLine: text }))}
          placeholder="Ürün serisi (opsiyonel)"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Notlar</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={gearData.notes}
          onChangeText={(text) => setGearData(prev => ({ ...prev, notes: text }))}
          placeholder="Ekipman hakkında notlar..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Ekipmanı Kaydet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'categories':
        return 'Ekipman Ekle';
      case 'brands':
        return selectedCategoryData?.name || 'Markalar';
      case 'products':
        return selectedBrand;
      case 'customForm':
        return 'Yeni Ekipman';
      default:
        return 'Ekipman Ekle';
    }
  };

  return (
    <ScreenContainer>
      <AppHeader 
        title={getScreenTitle()}
        showBackButton 
        onBackPress={handleGoBack}
      />
      
      {currentScreen === 'categories' && renderCategoriesScreen()}
      {currentScreen === 'brands' && renderBrandsScreen()}
      {currentScreen === 'products' && renderProductsScreen()}
      {currentScreen === 'customForm' && renderCustomFormScreen()}

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.modalCancelText}>İptal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Kategori Seç</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <FlatList
            data={gearCategories}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setGearData(prev => ({ ...prev, category: item.id }));
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
                {gearData.category === item.id && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            {selectedProduct && (
              <View style={styles.confirmProductContainer}>
                <View style={styles.confirmProductImageContainer}>
                  {selectedProduct.imageUrl ? (
                    <Image source={{ uri: selectedProduct.imageUrl }} style={styles.confirmProductImage} />
                  ) : (
                    <View style={styles.confirmProductPlaceholder}>
                      <Icon name="package" size={24} color={theme.colors.textSecondary} />
                    </View>
                  )}
                </View>
                <View style={styles.confirmProductInfo}>
                  <Text style={styles.confirmProductName}>{selectedProduct.name}</Text>
                  <Text style={styles.confirmProductBrand}>{selectedProduct.brand}</Text>
                  <Text style={styles.confirmProductUsage}>{selectedProduct.usageCount} kişi kullanıyor</Text>
                </View>
              </View>
            )}
            
            <Text style={styles.confirmModalTitle}>Ekipmanı Ekle</Text>
            <Text style={styles.confirmModalDescription}>
              Bu ekipmanı koleksiyonunuza eklemek istediğinizden emin misiniz?
            </Text>
            
            <View style={styles.confirmModalActions}>
              <TouchableOpacity 
                style={styles.confirmCancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.confirmCancelText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmAddButton}
                onPress={handleConfirmAddGear}
              >
                <Icon name="plus" size={16} color={theme.colors.background} />
                <Text style={styles.confirmAddText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={successMessage || 'Ekipman başarıyla eklendi!'}
        onClose={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <SuccessModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    paddingVertical: 0,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  categoryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  categoryItems: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  brandListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  brandName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    flex: 1,
  },
  brandRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandCount: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  productListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  productImageContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  productImage: {
    width: 48,
    height: 48,
  },
  productPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  productBrand: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  productUsage: {
    fontSize: theme.typography.xs,
    color: theme.colors.primary,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  quickAddContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickAddTextContainer: {
    marginLeft: theme.spacing.sm,
  },
  quickAddTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  quickAddSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  selectorText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  saveButtonContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  modalCancelText: {
    fontSize: theme.typography.base,
    color: theme.colors.primary,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalItemText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
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
});

export default AddGearScreen;