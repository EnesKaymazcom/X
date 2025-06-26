import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Icon,
  EquipmentCard,
  AddButton,
  Button,
  TabSelector,
  PostsGrid,
  ProBadge,
  DefaultAvatar,
  UserDisplayName,
  ProfileHeader,
  UserProfileLayout,
  AppHeader,
  ScreenContainer,
  ConfirmModal,
  CatchCard,
} from '@fishivo/ui';
import { theme } from '@fishivo/shared';

interface ProfileScreenProps {
  navigation: any;
}

interface UserStats {
  totalCatches: number;
  totalSpots: number;
  followers: number;
  following: number;
}

interface FishingGear {
  id: string;
  name: string;
  category: string;
  brand?: string;
  icon: string;
  imageUrl?: string;
  condition: 'excellent' | 'good' | 'fair';
}

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
  equipmentDetails?: Array<{
    id: string;
    name: string;
    category: string;
    brand?: string;
    icon: string;
    condition: 'excellent' | 'good' | 'fair';
  }>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'catches' | 'gear' | 'spots'>('catches');
  const [showDeleteGearConfirm, setShowDeleteGearConfirm] = useState(false);
  const [gearToDelete, setGearToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentCatches, setRecentCatches] = useState<RecentCatch[]>([]);
  const [gearItems, setGearItems] = useState<FishingGear[]>([]);
  const [userLocations, setUserLocations] = useState<any[]>([]);

  // Mock user data
  const [userProfile, setUserProfile] = useState({
    name: 'Ahmet Yılmaz',
    location: 'İstanbul, Türkiye',
    bio: 'Balıkçılık tutkunu. Doğa sevgisi ve sabır ile her gün yeni deneyimler yaşıyorum.',
    avatar: '',
    isPro: true,
    proSince: '2024'
  });

  // User statistics state
  const [userStats, setUserStats] = useState<UserStats>({
    totalCatches: 47,
    totalSpots: 12,
    followers: 234,
    following: 156
  });

  // Mock data
  const mockCatches: RecentCatch[] = [
    {
      id: '1',
      species: 'Levrek',
      weight: {
        value: 2.5,
        unit: 'kg',
        originalUnit: 'kg',
        displayValue: '2.5 kg'
      },
      date: '2024-01-15',
      location: 'Bosphorus Köprüsü Altı',
      photo: undefined
    },
    {
      id: '2',
      species: 'Çupra',
      weight: {
        value: 1.8,
        unit: 'kg',
        originalUnit: 'kg',
        displayValue: '1.8 kg'
      },
      date: '2024-01-12',
      location: 'Sapanca Gölü',
      photo: undefined
    },
    {
      id: '3',
      species: 'Sazan',
      weight: {
        value: 3.2,
        unit: 'kg',
        originalUnit: 'kg',
        displayValue: '3.2 kg'
      },
      date: '2024-01-10',
      location: 'Sakarya Nehri',
      photo: undefined
    }
  ];

  const mockGear: FishingGear[] = [
    {
      id: '1',
      name: 'Shimano Stradic',
      category: 'reel',
      brand: 'Shimano',
      icon: 'refresh-cw',
      condition: 'excellent'
    },
    {
      id: '2',
      name: 'Daiwa Ninja',
      category: 'rod',
      brand: 'Daiwa',
      icon: 'fishing',
      condition: 'good'
    },
    {
      id: '3',
      name: 'Rapala X-Rap',
      category: 'lure',
      brand: 'Rapala',
      icon: 'anchor',
      condition: 'excellent'
    }
  ];

  const mockLocations = [
    {
      id: '1',
      name: 'Bosphorus Köprüsü Altı',
      location: 'İstanbul, Beşiktaş',
      coordinates: [29.0350, 41.0391],
      type: 'spot',
      catches: 15,
      isFavorite: true
    },
    {
      id: '2',
      name: 'Sapanca Gölü',
      location: 'Sakarya, Sapanca',
      coordinates: [30.2683, 40.6917],
      type: 'spot',
      catches: 8,
      isFavorite: true
    },
    {
      id: '3',
      name: 'Gizli Nokta',
      location: 'Sakarya Nehri',
      coordinates: [30.3781, 40.7569],
      type: 'private-spot',
      catches: 12,
      isFavorite: false
    }
  ];

  // Helper function to get icon for gear category
  const getIconForGearCategory = (category: string): string => {
    switch (category?.toLowerCase()) {
      case 'rod':
        return 'fishing';
      case 'reel':
        return 'refresh-cw';
      case 'lure':
        return 'anchor';
      case 'line':
        return 'git-branch';
      case 'hook':
        return 'corner-down-right';
      case 'accessory':
        return 'tool';
      default:
        return 'package';
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecentCatches(mockCatches);
      setGearItems(mockGear);
      setUserLocations(mockLocations);
      
    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert('Hata', 'Kullanıcı verileri yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const tabs = [
    { id: 'catches', label: 'Avlar', icon: 'fish' },
    { id: 'gear', label: 'Ekipmanlar', icon: 'backpack' },
    { id: 'spots', label: 'Spotlar', icon: 'anchor' },
  ];

  const handleSelectSpot = (location: any) => {
    navigation.navigate('Map', { selectedLocation: location });
  };

  const handleDeleteGear = (gearId: string) => {
    setGearToDelete(gearId);
    setShowDeleteGearConfirm(true);
  };

  const confirmDeleteGear = () => {
    if (gearToDelete) {
      setGearItems(prev => prev.filter(item => item.id !== gearToDelete));
      setGearToDelete(null);
    }
    setShowDeleteGearConfirm(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catches':
        return (
          <View style={styles.tabContent}>
            {recentCatches.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="fish" size={48} color={theme.colors.primary} />
                <Text style={styles.emptyStateText}>Henüz bir yakalama paylaşmadınız</Text>
                <Text style={styles.emptyStateSubtext}>İlk yakalamayı paylaşmak için "+" butonuna tıklayın</Text>
              </View>
            ) : (
              <FlatList
                data={recentCatches}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.catchCard}
                    onPress={() => navigation.navigate('FishDetail', { catchId: item.id })}
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
                )}
                contentContainerStyle={{ gap: theme.spacing.md }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        );
      case 'spots':
        return (
          <View style={styles.tabContent}>
            {userLocations.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="map-pin" size={48} color={theme.colors.primary} />
                <Text style={styles.emptyStateText}>Henüz bir balık noktası kaydetmediniz</Text>
                <Text style={styles.emptyStateSubtext}>İlk noktayı eklemek için haritayı kullanın</Text>
              </View>
            ) : (
              <>
                {/* Spot Statistics */}
                <View style={styles.spotStats}>
                  <View style={styles.statItem}>
                    <Icon name="map-pin" size={24} color={theme.colors.primary} />
                    <Text style={styles.spotStatNumber}>{userLocations.length}</Text>
                    <Text style={styles.spotStatLabel}>Toplam Nokta</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="star" size={24} color={theme.colors.warning} />
                    <Text style={styles.spotStatNumber}>
                      {userLocations.filter(spot => spot.isFavorite).length}
                    </Text>
                    <Text style={styles.spotStatLabel}>Favori</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="fish" size={24} color={theme.colors.success} />
                    <Text style={styles.spotStatNumber}>
                      {userLocations.reduce((total, spot) => total + (spot.catches || 0), 0)}
                    </Text>
                    <Text style={styles.spotStatLabel}>Toplam Av</Text>
                  </View>
                </View>

                {/* Recent Spots */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Son Kullanılan Noktalar</Text>
                </View>
                <View style={styles.recentSpots}>
                  {userLocations.slice(0, 3).map(spot => (
                    <TouchableOpacity 
                      key={spot.id} 
                      style={styles.recentSpotItem}
                      onPress={() => handleSelectSpot(spot)}
                    >
                      <View style={styles.spotIcon}>
                        <Icon name="map-pin" size={20} color={theme.colors.primary} />
                      </View>
                      <View style={styles.spotInfo}>
                        <Text style={styles.spotName}>{spot.name}</Text>
                        <Text style={styles.spotLocation}>{spot.location}</Text>
                      </View>
                      <TouchableOpacity style={styles.spotAction} onPress={() => handleSelectSpot(spot)}>
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
                    <Text style={styles.viewAllText}>Tüm Noktaları Görüntüle</Text>
                    <Icon name="arrow-right" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        );
      case 'gear':
        return (
          <View style={styles.tabContent}>
            {gearItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="backpack" size={48} color={theme.colors.primary} />
                <Text style={styles.emptyStateText}>Henüz ekipman eklemediniz</Text>
                <Text style={styles.emptyStateSubtext}>İlk ekipmanı eklemek için "+" butonuna tıklayın</Text>
              </View>
            ) : (
              <FlatList
                data={gearItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <EquipmentCard
                    item={item}
                    onDelete={() => handleDeleteGear(item.id)}
                  />
                )}
                contentContainerStyle={{ gap: theme.spacing.md }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Profil"
        rightButtons={[
          {
            icon: "bell",
            onPress: () => navigation.navigate('Notifications')
          },
          {
            icon: "settings",
            onPress: () => navigation.navigate('Settings')
          }
        ]}
      />

      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <UserProfileLayout
            userData={{
              name: userProfile.name,
              location: userProfile.location,
              bio: userProfile.bio,
              avatar: userProfile.avatar,
              catchCount: userStats.totalCatches,
              followers: userStats.followers,
              following: userStats.following,
              isPro: userProfile.isPro,
            }}
            isOwnProfile={true}
            onPrimaryAction={() => navigation.navigate('EditProfile')}
            onShareAction={() => {
              Alert.alert('Paylaş', 'Bu özellik yakında eklenecek!');
            }}
            onProPress={() => navigation.navigate('Premium')}
            noPadding={true}
          />

          {/* Haritam Section */}
          <View style={styles.quickActionsSection}>
            <TouchableOpacity 
              style={styles.yourMapCard}
              onPress={() => navigation.navigate('YourMap')}
            >
              <View style={styles.yourMapIcon}>
                <Icon name="navigation" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.yourMapContent}>
                <Text style={styles.yourMapTitle}>Haritam</Text>
                <Text style={styles.yourMapSubtitle}>
                  Favori spotlar, gizli noktalar ve av geçmişiniz
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={(tabId) => setActiveTab(tabId as 'catches' | 'gear' | 'spots')}
          />

          {/* Tab Content */}
          {renderTabContent()}

          {/* Bottom Padding */}
          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </ScreenContainer>

      <ConfirmModal
        visible={showDeleteGearConfirm}
        title="Ekipmanı Sil"
        message="Bu ekipmanı silmek istediğinizden emin misiniz?"
        onConfirm={confirmDeleteGear}
        onCancel={() => {
          setShowDeleteGearConfirm(false);
          setGearToDelete(null);
        }}
        confirmText="Sil"
        cancelText="İptal"
        type="destructive"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
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
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  // Spot Stats Styles
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
  // Recent Spots Styles
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
  // YourMap Section Styles
  quickActionsSection: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  yourMapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  yourMapIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yourMapContent: {
    flex: 1,
  },
  yourMapTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  yourMapSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

export default ProfileScreen;