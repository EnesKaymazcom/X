import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  CatchCard, 
  AppHeader, 
  ScreenContainer, 
  SuccessModal 
} from '@fishivo/ui';
import { theme } from '@fishivo/shared';

// Spot koordinatları helper fonksiyonu
const getCoordinatesForLocation = (location: string): [number, number] => {
  const locationCoordinates: { [key: string]: [number, number] } = {
    'Boğaziçi': [28.9784, 41.0082],
    'Galata Köprüsü': [28.9744, 41.0199],
    'Kadıköy İskelesi': [29.0158, 40.9833],
    'Büyükada': [29.1189, 40.8606],
  };
  return locationCoordinates[location] || [28.9784, 41.0082]; // Default: İstanbul Boğazı
};

interface HomeScreenProps {
  navigation: any;
}

interface CatchItem {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    location: string;
    country?: string;
    isPro?: boolean;
  };
  fish: {
    species: string;
    weight: string;
    length: string;
  };
  image: string;
  images?: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  equipmentDetails?: Array<{
    id: string;
    name: string;
    category: string;
    brand?: string;
    icon: string;
    condition: 'excellent' | 'good' | 'fair';
  }>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [posts, setPosts] = useState<CatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  
  // Mock data for now - will be replaced with API calls
  const loadCatches = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockCatches: CatchItem[] = [
        {
          id: '1',
          user: {
            id: '1',
            name: 'Ahmet Yılmaz',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            location: 'İstanbul, Türkiye',
            country: 'Türkiye',
            isPro: true
          },
          fish: {
            species: 'Levrek',
            weight: '2.5 kg',
            length: '45 cm'
          },
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
          images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'],
          likes: 24,
          comments: 8,
          timeAgo: '2 saat önce',
          equipmentDetails: []
        },
        {
          id: '2',
          user: {
            id: '2',
            name: 'Mehmet Demir',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            location: 'Antalya, Türkiye',
            country: 'Türkiye',
            isPro: false
          },
          fish: {
            species: 'Çupra',
            weight: '1.8 kg',
            length: '38 cm'
          },
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
          images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'],
          likes: 15,
          comments: 3,
          timeAgo: '4 saat önce',
          equipmentDetails: []
        }
      ];
      
      setPosts(mockCatches);
    } catch (error) {
      console.error('Error loading catches:', error);
      setPosts([]);
      Alert.alert('Hata', 'Gönderiler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCatches();
  };

  const showMoreOptions = (userName: string) => {
    setSelectedUser(userName);
    setShowOptionsModal(true);
  };

  const handleReport = () => {
    setShowOptionsModal(false);
    setSuccessMessage('Bu gönderiyi inceleme için bildirdik. Teşekkürler.');
    setShowSuccessModal(true);
  };

  const handleBlock = () => {
    setShowOptionsModal(false);
    setSuccessMessage(`${selectedUser} artık gönderilerini görmeyeceksiniz.`);
    setShowSuccessModal(true);
  };

  // Update post likes in state
  const handlePostLikeChange = (postId: string, liked: boolean, newCount: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: newCount }
          : post
      )
    );
  };

  // Handle showing likers list
  const handleShowLikers = (postId: string) => {
    setSelectedPostId(postId);
    setShowLikersModal(true);
  };

  // Handle user press from likers list
  const handleLikerUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const renderCatchItem = ({ item }: { item: CatchItem }) => {
    const handleUserPress = () => {
      navigation.navigate('UserProfile', { userId: item.user.id });
    };

    const handlePostPress = () => {
      const postData = {
        id: item.id,
        user: {
          name: item.user.name,
          avatar: item.user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          location: 'İstanbul, Türkiye',
          isPro: item.user.isPro,
        },
        fish: {
          species: item.fish.species,
          weight: item.fish.weight,
          length: item.fish.length,
        },
        photo: item.image,
        images: item.images || [item.image],
        likes: item.likes,
        comments: item.comments,
        timeAgo: item.timeAgo,
        description: `Bugün ${item.user.location} spot'unda güzel bir ${item.fish.species} yakaladım! ${item.fish.weight} ağırlığında harika bir deneyimdi.`,
        equipmentDetails: item.equipmentDetails,
        catchLocation: item.user.location,
        coordinates: getCoordinatesForLocation(item.user.location),
      };
      navigation.navigate('PostDetail', { postData });
    };

    const handleMorePress = () => {
      showMoreOptions(item.user.name);
    };

    return (
      <CatchCard
        item={item}
        onUserPress={handleUserPress}
        onPostPress={handlePostPress}
        onMorePress={handleMorePress}
        onLikeChange={(liked, newCount) => handlePostLikeChange(item.id, liked, newCount)}
        onShowLikers={handleShowLikers}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Keşfet"
        rightButtons={[
          {
            icon: "search",
            onPress: () => navigation.navigate('ExploreSearch')
          },
          {
            icon: "bell",
            onPress: () => navigation.navigate('Notifications')
          }
        ]}
      />

      <ScreenContainer paddingHorizontal="none">
        <FlatList
          data={posts}
          renderItem={renderCatchItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={() => (
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Postlar yükleniyor...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="fish" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>Henüz post yok</Text>
              </View>
            )
          )}
        />
      </ScreenContainer>

      {/* More Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.optionItem} onPress={handleReport}>
              <Icon name="flag" size={20} color={theme.colors.error} />
              <Text style={styles.optionText}>Bildir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleBlock}>
              <Icon name="user-x" size={20} color={theme.colors.error} />
              <Text style={styles.optionText}>Engelle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, styles.cancelOption]} 
              onPress={() => setShowOptionsModal(false)}
            >
              <Icon name="x" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.optionText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <SuccessModal
        visible={showSuccessModal}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    minWidth: 200,
    gap: theme.spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  cancelOption: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
  },
  optionText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
});

export default HomeScreen;