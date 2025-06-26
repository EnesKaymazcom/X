import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  FlatList,
  Modal,
  Alert,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Button, EquipmentCard, EquipmentSection, TabSelector, PostsGrid, ProBadge, DefaultAvatar, UserDisplayName, ProfileHeader, UserProfileLayout, AppHeader, ScreenContainer, ConfirmModal, SuccessModal } from '@fishivo/ui';
import { theme, useUnits, apiService } from '@fishivo/shared';
import { useFollow } from '../contexts/FollowContext';

interface UserProfileProps {
  route: {
    params: {
      userId: string;
    };
  };
  navigation: any;
}

interface UserProfileData {
  id: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  is_pro?: boolean;
  followers_count: number;
  following_count: number;
  catches_count: number;
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

interface CatchPost {
  id: string;
  fishImage: string;
  fishSpecies: string;
  timeAgo: string;
  imageUrl: string;
  equipmentDetails?: Array<{
    id: string;
    name: string;
    category: string;
    brand?: string;
    icon: string;
    condition: 'excellent' | 'good' | 'fair';
  }>;
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
  image?: string;
}

const UserProfileScreen: React.FC<UserProfileProps> = ({ route, navigation }) => {
  const { userId } = route.params;
  const { isFollowing, follow, unfollow, refreshStatus, isPending } = useFollow();
  const [activeTab, setActiveTab] = useState<'posts' | 'equipment'>('posts');
  const { convertAndFormat } = useUnits();

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [userCatches, setUserCatches] = useState<RecentCatch[]>([]);
  const [userEquipment, setUserEquipment] = useState<FishingGear[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!userId) {
        setError('Kullanıcı kimliği bulunamadı.');
        return;
      }
      
      try {
        setError(null);
        
        const response = await apiService.getUserProfile(userId);
        if (response.success) {
          setUser(response.data);
        } else {
          throw new Error(response.error || 'Profil bilgileri alınamadı.');
        }
        
        const catchesResponse = await apiService.getUserCatches(userId);
        if (catchesResponse.success) {
          const formattedCatches = catchesResponse.data.items?.map((post: any) => ({
            id: post.id.toString(),
            species: post.catch_details?.species_name || 'Bilinmeyen Balık',
            weight: {
              value: post.catch_details?.weight || 0,
              unit: 'kg',
              originalUnit: 'kg',
              displayValue: `${post.catch_details?.weight || 0} kg`
            },
            length: {
              value: post.catch_details?.length || 0,
              unit: 'cm',
              originalUnit: 'cm',
              displayValue: `${post.catch_details?.length || 0} cm`
            },
            date: new Date(post.created_at).toLocaleDateString('tr-TR'),
            location: post.location?.city || 'Bilinmeyen',
            image: post.image_url
          })) || [];
          setUserCatches(formattedCatches);
        }

        // Ekipmanlar için de veri çek
        const equipmentResponse = await apiService.getEquipment().catch(() => []);
        setUserEquipment(equipmentResponse || []);
        
        refreshStatus(userId);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Profil yüklenirken bir hata oluştu.';
        console.error('Profil bilgileri yüklenirken hata:', err);
        setError(errorMessage);
        setUser(null);
      }
    };

    loadProfileData();
  }, [userId]);

  const tabs = [
    { id: 'posts', label: 'Avlar', icon: 'fish' },
    { id: 'equipment', label: 'Ekipman', icon: 'backpack' },
  ];
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<FishingGear | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await apiService.getUserProfile(userId);
      if (response.success) {
        setUser(response.data);
      }
      const catchesResponse = await apiService.getUserCatches(userId);
      if (catchesResponse.success) {
        const formattedCatches = catchesResponse.data.items?.map((post: any) => ({
          id: post.id.toString(),
          species: post.catch_details?.species_name || 'Bilinmeyen Balık',
          weight: {
            value: post.catch_details?.weight || 0,
            unit: 'kg',
            originalUnit: 'kg',
            displayValue: `${post.catch_details?.weight || 0} kg`
          },
          length: {
            value: post.catch_details?.length || 0,
            unit: 'cm',
            originalUnit: 'cm',
            displayValue: `${post.catch_details?.length || 0} cm`
          },
          date: new Date(post.created_at).toLocaleDateString('tr-TR'),
          location: post.location?.city || 'Bilinmeyen',
          image: post.image_url
        })) || [];
        setUserCatches(formattedCatches);
      }
    } catch (err) {
      setError('Veriler yenilenirken bir hata oluştu.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    setShowOptionsModal(false);
    setShowShareModal(true);
  };

  const handleShowQR = () => {
    setShowShareModal(false);
    setShowQRModal(true);
  };

  const handleNativeShare = async () => {
    if (!user) return;
    try {
      await Share.share({
        title: `${user.full_name} - Fishivo`,
        message: `${user.full_name} adlı kullanıcının Fishivo profilini inceleyin!\n\n${user.catches_count} balık yakaladı 🎣`,
        url: 'https://fishivo.app/profile/' + user.id,
      });
      setShowShareModal(false);
    } catch (error) {

    }
  };

  const handleCopyLink = () => {
    // Clipboard copy functionality burada olacak
    setSuccessMessage('Profil linki panoya kopyalandı!');
    setShowSuccessModal(true);
    setShowShareModal(false);
  };

  const handleFollow = async () => {
    if (!user) return;
    try {
      if (isFollowing(user.id)) {
        await unfollow(user.id);
      } else {
        await follow(user.id);
      }
      // Re-fetch user to update counts
      const updatedUser = await apiService.getUserProfile(user.id);
      setUser(updatedUser.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu';
      Alert.alert('Hata', message);
    }
  };

  const handleBlock = () => {
    setShowOptionsModal(false);
    setShowBlockConfirm(true);
  };

  const confirmBlock = () => {
    if (!user) return;
    setShowBlockConfirm(false);
    setSuccessMessage(`${user.full_name} başarıyla engellendi.`);
    setShowSuccessModal(true);
  };

  const handleReport = () => {
    setShowOptionsModal(false);
    setShowReportConfirm(true);
  };

  const confirmReport = () => {
    setShowReportConfirm(false);
    setSuccessMessage('Rapor başarıyla gönderildi. İncelemeye alınacak.');
    setShowSuccessModal(true);
  };

  const handleShareProfile = async () => {
    if (!user) return;
    try {
      await Share.share({
        message: `Fishivo'da ${user.full_name} kullanıcısının profiline göz atın: fishivo://user/${user.id}`,
      });
    } catch (error) {
      Alert.alert('Hata', 'Profil paylaşılamadı.');
    }
  };

  // Eğer user henüz yüklenmemişse boş bir div döndür
  if (!user) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  const renderContent = () => {
    if (activeTab === 'posts') {
      return (
        <PostsGrid
          data={userCatches}
          noPadding={true}
          onPostPress={(post) => {
            // JSON verilerinden PostDetail data'sı oluştur
            const postData = {
              id: post.id,
              user: {
                name: user.full_name,
                avatar: user.avatar_url || '',
                location: user.location || '',
                isPro: user.is_pro,
              },
              fish: {
                species: post.species,
                weight: typeof post.weight === 'string' ? post.weight : convertAndFormat(post.weight.value, 'weight'),
                length: '45cm', // catches.json'dan alınabilir
              },
              photo: post.photo,
              likes: 25, // Sabit değer
              comments: 8, // Sabit değer
              timeAgo: post.date,
              description: `${post.location} spot'unda ${post.species} yakaladım! ${typeof post.weight === 'string' ? post.weight : convertAndFormat(post.weight.value, 'weight')} ağırlığında harika bir deneyimdi.`,
            };
            navigation.navigate('PostDetail', { postData });
          }}
        />
      );
    } else {
      return (
        <View style={styles.equipmentContainer}>
          <EquipmentSection
            equipment={userEquipment as FishingGear[]}
            title="Ekipmanlar"
            showAddButton={false}
          />
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={user.full_name}
        leftButtons={[
          {
            icon: "arrow-left",
            onPress: () => navigation.goBack()
          }
        ]}
        rightButtons={[
          {
            icon: "more-horizontal",
            onPress: () => setShowOptionsModal(true)
          }
        ]}
      />

      <ScreenContainer>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <UserProfileLayout
            userData={{
              name: user.full_name,
              avatar: user.avatar_url,
              location: user.location || 'Konum belirtilmemiş',
              catchCount: user.catches_count,
              followers: user.followers_count,
              following: user.following_count,
              bio: user.bio || 'Henüz bir biyografi eklenmemiş.',
              isPro: user.is_pro,
            }}
            onPrimaryAction={() => navigation.navigate('EditProfile')}
            onShareAction={handleShare}
            onFollowToggle={handleFollow}
            followDisabled={isPending(userId)}
            isFollowing={isFollowing(userId)}
          />
          <View style={{ flex: 1 }}>
            <TabSelector
              tabs={tabs}
              activeTab={activeTab}
              onTabPress={(tabId) => setActiveTab(tabId as 'posts' | 'equipment')}
            />
            {renderContent()}
          </View>
        </ScrollView>
      </ScreenContainer>

      {showOptionsModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showOptionsModal}
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowOptionsModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitle}>Seçenekler</Text>
              <Text style={styles.modalSubtitle}>{user.full_name} ile ilgili</Text>

              <View style={styles.optionsList}>
                <TouchableOpacity style={styles.optionItem} onPress={handleShare}>
                  <Icon name="share" size={20} color={theme.colors.text} />
                  <Text style={styles.optionText}>Profili Paylaş</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={handleReport}>
                  <Icon name="flag" size={20} color={theme.colors.error} />
                  <Text style={[styles.optionText, { color: theme.colors.error }]}>
                    Raporla
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={handleBlock}>
                  <Icon name="user-x" size={20} color={theme.colors.error} />
                  <Text style={[styles.optionText, { color: theme.colors.error }]}>
                    Engelle
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.optionItem, styles.cancelOption]}
                  onPress={() => setShowOptionsModal(false)}
                >
                  <Text style={styles.optionText}>İptal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showShareModal}
          onRequestClose={() => setShowShareModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowShareModal(false)}
          >
            <View style={styles.shareModalContent}>
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitle}>Profili Paylaş</Text>
              <Text style={styles.modalSubtitle}>{user.full_name} profilini paylaş</Text>

              <View style={styles.shareOptionsList}>
                <TouchableOpacity style={styles.shareOptionItem} onPress={handleShowQR}>
                  <Icon name="smartphone" size={24} color={theme.colors.primary} />
                  <View style={styles.shareOptionInfo}>
                    <Text style={styles.shareOptionTitle}>QR Kod</Text>
                    <Text style={styles.shareOptionDesc}>QR kod ile profil paylaş</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareOptionItem} onPress={handleNativeShare}>
                  <Icon name="share" size={24} color={theme.colors.primary} />
                  <View style={styles.shareOptionInfo}>
                    <Text style={styles.shareOptionTitle}>Sistem Paylaşımı</Text>
                    <Text style={styles.shareOptionDesc}>Diğer uygulamalarla paylaş</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareOptionItem} onPress={handleCopyLink}>
                  <Icon name="copy" size={24} color={theme.colors.primary} />
                  <View style={styles.shareOptionInfo}>
                    <Text style={styles.shareOptionTitle}>Linki Kopyala</Text>
                    <Text style={styles.shareOptionDesc}>Profil linkini panoya kopyala</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.shareOptionItem, styles.cancelShareOption]}
                  onPress={() => setShowShareModal(false)}
                >
                  <Icon name="x" size={24} color={theme.colors.text} />
                  <View style={styles.shareOptionInfo}>
                    <Text style={styles.shareOptionTitle}>İptal</Text>
                    <Text style={styles.shareOptionDesc}>Paylaşımı iptal et</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showQRModal}
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={styles.qrModalContent}>
            {/* Header */}
            <View style={styles.qrHeader}>
              <TouchableOpacity 
                style={styles.qrBackButton}
                onPress={() => setShowQRModal(false)}
              >
                <Icon name="x" size={28} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.qrTitle}>Share profile</Text>
              <View style={styles.qrHeaderSpacer} />
            </View>

            {/* Content */}
            <View style={styles.qrContentContainer}>
              {/* Username */}
              <Text style={styles.qrUsername}>{user.full_name}</Text>

              {/* QR Code */}
              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodePlaceholder}>
                  {/* QR Pattern mockup - Simplified */}
                  <View style={styles.qrGrid}>
                    {Array.from({ length: 15 }, (_, rowIndex) => (
                      <View key={rowIndex} style={styles.qrRow}>
                        {Array.from({ length: 15 }, (_, colIndex) => {
                          const isBlack = (rowIndex + colIndex) % 2 === 0 || 
                                         (rowIndex < 7 && colIndex < 7) ||
                                         (rowIndex < 7 && colIndex > 7) ||
                                         (rowIndex > 7 && colIndex < 7);
                          return (
                            <View 
                              key={colIndex} 
                              style={[
                                styles.qrCell, 
                                { backgroundColor: isBlack ? '#000000' : '#FFFFFF' }
                              ]} 
                            />
                          );
                        })}
                      </View>
                    ))}
                  </View>
                  {/* User avatar in center */}
                  <View style={styles.qrCenterAvatar}>
                    <DefaultAvatar size={40} name={user.full_name} />
                  </View>
                </View>
              </View>

              {/* App Logo */}
              <View style={styles.qrAppLogo}>
                <Text style={styles.qrAppName}>Fishivo</Text>
              </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.qrActions}>
              <TouchableOpacity style={styles.qrActionItem} onPress={handleNativeShare}>
                <View style={styles.qrActionIcon}>
                  <Icon name="share" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.qrActionText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qrActionItem} onPress={handleCopyLink}>
                <View style={styles.qrActionIcon}>
                  <Icon name="link" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.qrActionText}>Copy link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qrActionItem}>
                <View style={styles.qrActionIcon}>
                  <Icon name="download" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.qrActionText}>Download</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qrActionItem}>
                <View style={styles.qrActionIcon}>
                  <Icon name="camera" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.qrActionText}>Scan QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedEquipment}
          onRequestClose={() => setSelectedEquipment(null)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedEquipment(null)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              
              <View style={styles.equipmentDetailHeader}>
                <View style={styles.equipmentDetailIconContainer}>
                  <Text style={styles.equipmentDetailIcon}>{selectedEquipment.icon}</Text>
                </View>
                <View style={styles.equipmentDetailInfo}>
                  <Text style={styles.equipmentDetailName}>{selectedEquipment.name}</Text>
                  <Text style={styles.equipmentDetailCategory}>{selectedEquipment.category}</Text>
                </View>
              </View>

              <View style={styles.equipmentDetailActions}>
                <TouchableOpacity 
                  style={styles.equipmentDetailAction}
                  onPress={() => setSelectedEquipment(null)}
                >
                  <Text style={styles.equipmentDetailActionText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <ConfirmModal
        visible={showBlockConfirm}
        title="Kullanıcıyı Engelle"
        message={`${user.full_name} kullanıcısını engellemek istediğinizden emin misiniz?`}
        onConfirm={confirmBlock}
        onCancel={() => setShowBlockConfirm(false)}
        confirmText="Engelle"
        cancelText="İptal"
        type="destructive"
      />

      <ConfirmModal
        visible={showReportConfirm}
        title="Rapor Et"
        message={`${user.full_name} kullanıcısını rapor etmek istediğinizden emin misiniz?`}
        onConfirm={confirmReport}
        onCancel={() => setShowReportConfirm(false)}
        confirmText="Rapor Et"
        cancelText="İptal"
        type="warning"
      />

      <SuccessModal
        visible={showSuccessModal}
        title="Başarılı"
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },

  headerTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.lg,
  },
  avatarText: {
    fontSize: 40,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  statLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profileInfo: {
    marginBottom: theme.spacing.lg,
  },
  profileName: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  bioText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },


  contentContainer: {
    backgroundColor: theme.colors.surface,
    minHeight: 200,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },

  postsRow: {
    justifyContent: 'space-between',
  },
  equipmentContainer: {
    // EquipmentSection'ın kendi marginHorizontal'ı var
  },
  emptyText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalHandle: {
    width: 50,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  optionsList: {
    width: '100%',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    width: '100%',
    gap: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  optionText: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  cancelOption: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.lg,
  },

  catchPostItem: {
    width: '32%',
    aspectRatio: 1,
    margin: '0.5%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  catchImageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  shareModalContent: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  shareOptionsList: {
    width: '100%',
  },
  shareOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    width: '100%',
    gap: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  shareOptionInfo: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  shareOptionDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cancelShareOption: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrModalContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  qrBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    flex: 1,
    textAlign: 'left',
    marginLeft: theme.spacing.md,
  },
  qrHeaderSpacer: {
    width: 40,
  },
  qrContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrUsername: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.xl,
  },
  qrCodeContainer: {
    width: 280,
    height: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodePlaceholder: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrGrid: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCell: {
    width: 12,
    height: 12,
    margin: 1,
  },
  qrCenterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  qrCenterAvatarText: {
    fontSize: 24,
  },
  qrAppLogo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  qrAppName: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
    letterSpacing: 0,
    fontFamily: 'System',
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  qrActionItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrActionIcon: {
    marginBottom: theme.spacing.xs,
  },
  qrActionText: {
    fontSize: theme.typography.xs,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    textAlign: 'center',
  },
  equipmentDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  equipmentDetailIconContainer: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
  },
  equipmentDetailIcon: {
    fontSize: 24,
  },
  equipmentDetailInfo: {
    flex: 1,
  },
  equipmentDetailName: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  equipmentDetailCategory: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  equipmentDetailActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
  },
  equipmentDetailAction: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  equipmentDetailActionText: {
    fontSize: theme.typography.base,
    color: '#FFFFFF',
    fontWeight: theme.typography.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});

export default UserProfileScreen;