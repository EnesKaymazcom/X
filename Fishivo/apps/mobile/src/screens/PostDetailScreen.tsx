import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Image,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../components/Button';
import { ProBadge } from '../components/ProBadge';
import { UserDisplayName } from '../components/UserDisplayName';
import { EquipmentCard } from '../components/EquipmentCard';
import { Avatar } from '../components/Avatar';
import { CatchCard } from '../components/CatchCard';
import { AppHeader } from '../components/AppHeader';
import { theme } from '../theme';
import { ScreenContainer } from '../components/ScreenContainer';
import { SuccessModal } from '../components/SuccessModal';
import { useUnits } from '../hooks/useUnits';

interface PostDetailScreenProps {
  navigation: any;
  route: {
    params: {
      postData: PostData;
    };
  };
}

interface PostData {
  id: string;
  user: {
    name: string;
    avatar: string;
    location: string;
    isPro?: boolean;
  };
  fish: {
    species: string;
    weight: string;
    length: string;
  };
  imageUrl?: string;
  images?: string[];
  photo?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  description?: string;
  equipment?: string[];
  equipmentDetails?: Array<{
    id: string;
    name: string;
    category: string;
    brand?: string;
    icon: string;
    condition: 'excellent' | 'good' | 'fair';
  }>;
  liveBait?: string;
  useLiveBait?: boolean;
  catchLocation?: string;
  coordinates?: [number, number];
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ navigation, route }) => {
  const { postData } = route.params;
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formattedWeight, setFormattedWeight] = useState('');
  const [formattedLength, setFormattedLength] = useState('');
  const [formattedTemperature, setFormattedTemperature] = useState('');
  const [formattedSpeed, setFormattedSpeed] = useState('');
  const [formattedPressure, setFormattedPressure] = useState('');
  const { convertAndFormat } = useUnits();

  useEffect(() => {
    const formatMeasurements = async () => {
      // Parse weight and length from postData
      const weightMatch = postData.fish.weight.match(/^([\d.]+)/);
      const lengthMatch = postData.fish.length.match(/^([\d.]+)/);
      
      if (weightMatch) {
        const weightValue = parseFloat(weightMatch[1]);
        if (!isNaN(weightValue)) {
          const formatted = await convertAndFormat(weightValue, 'weight');
          setFormattedWeight(formatted);
        }
      }

      if (lengthMatch) {
        const lengthValue = parseFloat(lengthMatch[1]);
        if (!isNaN(lengthValue)) {
          const formatted = await convertAndFormat(lengthValue, 'length');
          setFormattedLength(formatted);
        }
      }

      // Format weather data
      const temp = await convertAndFormat(22, 'temperature');
      const speed = await convertAndFormat(15, 'speed');
      const pressure = await convertAndFormat(1013, 'pressure');
      
      setFormattedTemperature(temp);
      setFormattedSpeed(speed);
      setFormattedPressure(pressure);
    };

    formatMeasurements();
  }, [postData, convertAndFormat]);

  // Fish weight ve length parsing function - now returns the state values
  const parseAndFormatMeasurement = (measurement: string, category: string): string => {
    if (category === 'weight') return formattedWeight || measurement;
    if (category === 'length') return formattedLength || measurement;
    return measurement;
  };

  const showMoreOptions = () => {
    setShowOptionsModal(true);
  };

  const handleReport = () => {
    setShowOptionsModal(false);
    setSuccessMessage('Bu gönderiyi inceleme için bildirdik. Teşekkürler.');
    setShowSuccessModal(true);
  };

  const handleBlock = () => {
    setShowOptionsModal(false);
    setSuccessMessage(`${postData.user.name} artık gönderilerini görmeyeceksiniz.`);
    setShowSuccessModal(true);
  };

  const navigateToProfile = () => {
    const userProfileData = {
      id: postData.id + '_user',
      name: postData.user.name,
      avatar: postData.user.avatar,
      location: postData.user.location,
      catchCount: 35,
      followers: 650,
      following: 280,
      bio: 'Balık avına tutku ile bağlı bir avcı',
      isPro: postData.user.isPro,
    };
    navigation.navigate('UserProfile', { userData: userProfileData });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Gönderi"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScreenContainer>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* CatchCard */}
          <View style={styles.catchCardContainer}>
            <CatchCard
              item={{
                id: postData.id,
                user: {
                  id: postData.id + '_user',
                  name: postData.user.name,
                  avatar: postData.user.avatar,
                  location: postData.catchLocation || postData.user.location,
                  country: 'TR',
                  isPro: postData.user.isPro,
                },
                fish: postData.fish,
                image: postData.photo || '🐟',
                images: postData.images,
                likes: postData.likes,
                comments: postData.comments,
                timeAgo: postData.timeAgo,
              }}
              onUserPress={navigateToProfile}
              onPostPress={() => {}}
              onMorePress={showMoreOptions}
            />
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Icon name="map-pin" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.mapPlaceholderText}>Harita Görünümü</Text>
              <Text style={styles.locationName}>{postData.catchLocation || postData.user.location}</Text>
            </View>
          </View>

          {/* Fish Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Balık Bilgileri</Text>
            
            <View style={styles.fishCard}>
              <View style={styles.fishImageContainer}>
                <View style={styles.fishImagePlaceholder}>
                  <Text style={styles.fishEmoji}>🐟</Text>
                </View>
              </View>
              
              <View style={styles.fishInfoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Tür</Text>
                  <Text style={styles.infoValue}>{postData.fish.species}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Uzunluk</Text>
                  <Text style={styles.infoValue}>{parseAndFormatMeasurement(postData.fish.length, 'length')}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Ağırlık</Text>
                  <Text style={styles.infoValue}>{parseAndFormatMeasurement(postData.fish.weight, 'weight')}</Text>
                </View>
              </View>
              
              <View style={styles.releaseSection}>
                <View style={styles.releaseInfo}>
                  <Icon 
                    name="refresh-cw" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <Text style={styles.releaseLabel}>Suya Salındı</Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                  style={styles.releaseSwitch}
                />
              </View>
            </View>
          </View>

          {/* Weather Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Hava Durumu</Text>
            
            <View style={styles.weatherGrid}>
              <View style={styles.weatherItem}>
                <Icon name="thermometer" size={24} color={theme.colors.accent} />
                <Text style={styles.weatherLabel}>Sıcaklık</Text>
                <Text style={styles.weatherValue}>{formattedTemperature}</Text>
              </View>
              
              <View style={styles.weatherItem}>
                <Icon name="wind" size={24} color={theme.colors.secondary} />
                <Text style={styles.weatherLabel}>Rüzgar</Text>
                <Text style={styles.weatherValue}>{formattedSpeed} - KB</Text>
              </View>
              
              <View style={styles.weatherItem}>
                <Icon name="activity" size={24} color={theme.colors.primary} />
                <Text style={styles.weatherLabel}>Basınç</Text>
                <Text style={styles.weatherValue}>{formattedPressure}</Text>
              </View>
              
              <View style={styles.weatherItem}>
                <Icon name="sun" size={24} color="#FFA500" />
                <Text style={styles.weatherLabel}>Güneş</Text>
                <Text style={styles.weatherValue}>Güneydoğu</Text>
              </View>
              
              <View style={styles.weatherItem}>
                <Icon name="moon" size={24} color="#C0C0C0" />
                <Text style={styles.weatherLabel}>Ay Durumu</Text>
                <Text style={styles.weatherValue}>Hilal</Text>
              </View>
              
              <View style={styles.weatherItem}>
                <Icon name="clock" size={24} color={theme.colors.primary} />
                <Text style={styles.weatherLabel}>Av Tarihi</Text>
                <Text style={styles.weatherValue}>{postData.timeAgo}</Text>
              </View>
            </View>
          </View>

          {/* Equipment Section */}
          {postData.equipmentDetails && postData.equipmentDetails.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Kullanılan Ekipman</Text>
              <View style={styles.equipmentGrid}>
                {postData.equipmentDetails.map((item, index) => (
                  <View key={item.id} style={styles.equipmentItem}>
                    <EquipmentCard
                      item={item}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Live Bait Section */}
          {(postData.useLiveBait && postData.liveBait) && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Canlı Yem</Text>
              <View style={styles.baitContainer}>
                <View style={styles.baitItem}>
                  <Icon name="fish" size={16} color={theme.colors.accent} />
                  <Text style={styles.baitLabel}>Kullanılan:</Text>
                  <Text style={styles.baitValue}>{postData.liveBait}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsModal}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>Seçenekler</Text>
            <Text style={styles.modalSubtitle}>{postData.user.name} ile ilgili</Text>

            <View style={styles.optionsList}>
              <TouchableOpacity style={styles.optionItem} onPress={handleReport}>
                <Icon name="flag" size={20} color={theme.colors.error} />
                <Text style={[styles.optionText, { color: theme.colors.error }]}>
                  Şikayet Et
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem} onPress={handleBlock}>
                <Icon name="user-x" size={20} color={theme.colors.error} />
                <Text style={[styles.optionText, { color: theme.colors.error }]}>
                  Kullanıcıyı Engelle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionItem, styles.cancelOption]}
                onPress={() => setShowOptionsModal(false)}
              >
                <Icon name="x" size={20} color={theme.colors.text} />
                <Text style={styles.optionText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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
  content: {
    flex: 1,
  },
  catchCardContainer: {
    // CatchCard kendi padding'ini yönetir
  },
  // Map section
  mapContainer: {
    height: 250,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  mapPlaceholderText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  locationName: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    textAlign: 'center',
  },
  // Info sections
  infoSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.md,
  },
  // Fish card
  fishCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  fishImageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  fishImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishEmoji: {
    fontSize: 30,
  },
  fishInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  releaseSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  releaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  releaseLabel: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  releaseSwitch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  // Weather section
  weatherGrid: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '32%',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  weatherLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  weatherValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Equipment styles
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
  },
  equipmentItem: {
    width: '48%',
  },
  // Bait styles
  baitContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  baitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  baitLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  baitValue: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsModal: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  optionsList: {
    gap: theme.spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  cancelOption: {
    marginTop: theme.spacing.sm,
  },
});

export default PostDetailScreen;