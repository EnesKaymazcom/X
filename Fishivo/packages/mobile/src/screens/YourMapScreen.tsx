import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ScreenContainer } from '../components/ScreenContainer';
import { Icon } from '../components/Icon';
import { AppHeader } from '../components/AppHeader';
import { SuccessModal } from '../components/SuccessModal';
import { theme } from '../theme';
import { apiService } from '../services/apiService';
import { convertAndFormatSync } from '../utils/unitConversion';

// Mapbox access token
Mapbox.setAccessToken('pk.eyJ1IjoiZmlzaGl2byIsImEiOiJjbHpxdGZqZGcwMGNrMmxzZGJhZGNqZGNhIn0.example');

interface MarkerData {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'favorite' | 'private' | 'myspot' | 'catch';
  data: any;
}

interface MarkerDetailModalProps {
  marker: MarkerData | null;
  isVisible: boolean;
  onClose: () => void;
  onPressProfile: (userId: string) => void;
  onPressDetails: (postId: string) => void;
  convertAndFormat: (value: any, type: string) => string;
}

interface YourMapScreenProps {
  navigation: any;
}

const YourMapScreen: React.FC<YourMapScreenProps> = ({ navigation }) => {
  const mapRef = useRef<Mapbox.MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([29.0, 41.0]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [spots, setSpots] = useState<any[]>([]);
  const [catches, setCatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // API'den veri yükle
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        
        // Kullanıcının spotlarını ve avlarını getir
        const [spotsResponse, catchesResponse] = await Promise.all([
          apiService.getUserSpots(),
          apiService.getUserCatches()
        ]);
        
        setSpots(spotsResponse.data || []);
        setCatches(catchesResponse.data || []);
      } catch (error) {
        console.error('Map data loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  // Kullanıcının spotlarını al
  const getUserSpots = () => {
    return spots.map(spot => ({
      id: `spot-${spot.id}`,
      name: spot.name,
      coordinates: [spot.longitude, spot.latitude] as [number, number],
      type: spot.isPrivate ? 'private' : 'myspot' as const,
      data: spot
    }));
  };

  // Kullanıcının avlarını al
  const getUserCatches = () => {
    return catches.map(catch_ => ({
      id: `catch-${catch_.id}`,
      name: catch_.species,
      coordinates: getCoordinatesForCatch(catch_),
      type: 'catch' as const,
      data: catch_
    }));
  };

  // Av için koordinatları belirle
  const getCoordinatesForCatch = (catch_: any): [number, number] => {
    if (catch_.longitude && catch_.latitude) {
      return [catch_.longitude, catch_.latitude];
    }
    if (catch_.spot && catch_.spot.longitude && catch_.spot.latitude) {
      return [catch_.spot.longitude, catch_.spot.latitude];
    }
    return [29.0, 41.0]; // Varsayılan konum
  };

  // Tüm markerları birleştir
  const allMarkers = [...getUserSpots(), ...getUserCatches()];
  const displayMarkers = allMarkers;

  // Konum izni ve mevcut konumu al
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        
        if (result === RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            (position) => {
              const userLocation: [number, number] = [
                Number(position.coords.longitude),
                Number(position.coords.latitude)
              ];
              setCurrentLocation(userLocation);
              setIsLocationLoading(false);
            },
            (error) => {
              console.error('Location error:', error);
              setIsLocationLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000
            }
          );
        } else {
          setIsLocationLoading(false);
        }
      } catch (error) {
        setIsLocationLoading(false);
      }
    };

    initializeLocation();
  }, []);

  // Konuma git fonksiyonu
  const goToUserLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const userLocation: [number, number] = [
          Number(position.coords.longitude),
          Number(position.coords.latitude)
        ];

        // Force update: Önce farklı bir koordinat, sonra gerçek koordinat
        setCurrentLocation([userLocation[0] + 0.0001, userLocation[1] + 0.0001]);

        // 50ms sonra gerçek koordinata git (animasyonlu)
        setTimeout(() => {
          setCurrentLocation(userLocation);
        }, 50);
      },
      (error) => {
        setSuccessMessage('Konumunuz alınamadı. GPS açık mı kontrol edin.');
        setShowSuccessModal(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  // Marker'a tıklayınca detay göster
  const handleMarkerPress = (marker: MarkerData) => {
    setSelectedMarker(marker);
    setShowDetailModal(true);
  };

  // Marker rengi ve ikonu
  const getMarkerStyle = (type: string) => {
    switch (type) {
      case 'favorite':
        return { color: '#E91E63', icon: 'heart' };
      case 'private':
        return { color: '#9C27B0', icon: 'lock' };
      case 'myspot':
        return { color: '#2196F3', icon: 'map-pin' };
      case 'catch':
        return { color: '#4CAF50', icon: 'fish' };
      default:
        return { color: theme.colors.primary, icon: 'map-pin' };
    }
  };

  // Measurement object'ini formatla
  const formatMeasurementValue = (measurement: any) => {
    if (!measurement) return '';
    if (typeof measurement === 'string') return measurement;
    if (measurement.displayValue) return measurement.displayValue;
    if (measurement.value && measurement.unit) {
      return `${measurement.value} ${measurement.unit}`;
    }
    return '';
  };

  if (isLocationLoading || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Icon name="map" size={40} color={theme.colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Haritam"
        leftButtons={[
          {
            icon: "arrow-left",
            onPress: () => navigation.goBack()
          }
        ]}
      />
      
      <ScreenContainer paddingHorizontal="none" paddingVertical="none">
        {/* Mapbox MapView */}
        <View style={styles.mapContainer}>
          <Mapbox.MapView
            ref={mapRef}
            style={styles.map}
            styleURL="mapbox://styles/mapbox/streets-v12"
            zoomEnabled={true}
            scrollEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
            compassEnabled={false}
            scaleBarEnabled={false}
            logoEnabled={false}
            attributionEnabled={false}
          >
            {/* Camera */}
            <Mapbox.Camera
              centerCoordinate={currentLocation}
              zoomLevel={12}
              animationMode="easeTo"
              animationDuration={400}
            />

            {/* User location puck */}
            <Mapbox.LocationPuck
              visible={true}
              pulsing={{ isEnabled: true }}
              puckBearingEnabled={true}
              puckBearing="heading"
            />

            {/* Tüm markerlar */}
            {displayMarkers.map((marker) => {
              const style = getMarkerStyle(marker.type);
              return (
                <Mapbox.PointAnnotation
                  key={marker.id}
                  id={marker.id}
                  coordinate={marker.coordinates}
                  onSelected={() => handleMarkerPress(marker)}
                >
                  <View style={[styles.markerContainer, { backgroundColor: style.color }]}>
                    <Icon name={style.icon} size={16} color="#FFFFFF" />
                  </View>
                </Mapbox.PointAnnotation>
              );
            })}
          </Mapbox.MapView>

          {/* Center Crosshair */}
          <View style={styles.crosshair}>
            <View style={styles.crosshairHorizontal} />
            <View style={styles.crosshairVertical} />
            <View style={styles.crosshairCenter} />
          </View>

          {/* Geolocation Button */}
          <View style={styles.geolocateContainer}>
            <TouchableOpacity
              style={styles.geolocateButton}
              onPress={goToUserLocation}
              activeOpacity={0.7}
            >
              <Icon
                name="my-location"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {displayMarkers.length} nokta • Kişisel haritanız
            </Text>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: '#E91E63' }]}>
                <Icon name="heart" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.legendText}>Favoriler</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: '#9C27B0' }]}>
                <Icon name="lock" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.legendText}>Gizli</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: '#2196F3' }]}>
                <Icon name="map-pin" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.legendText}>Spotlarım</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: '#4CAF50' }]}>
                <Icon name="fish" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.legendText}>Avlarım</Text>
            </View>
          </View>
        </View>

        {/* Marker Detail Modal */}
        <MarkerDetailModal
          marker={selectedMarker}
          isVisible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onPressProfile={(userId) => {}}
          onPressDetails={(postId) => {}}
          convertAndFormat={convertAndFormatSync}
        />

        <SuccessModal
          visible={showSuccessModal}
          title="Bilgi"
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      </ScreenContainer>
    </SafeAreaView>
  );
};

// Marker detay modal bileşeni
const MarkerDetailModal: React.FC<MarkerDetailModalProps> = ({ 
  marker, 
  isVisible, 
  onClose, 
  onPressProfile, 
  onPressDetails, 
  convertAndFormat 
}) => {
  if (!marker) return null;

  const shareLocation = () => {
    const message = `🎣 ${marker.name}\n📍 ${marker.coordinates[1].toFixed(6)}°K, ${marker.coordinates[0].toFixed(6)}°D\n\nFishivo'dan paylaşıldı`;
    console.log('Kopyalandı:', message);
    onPressDetails(marker.id);
  };

  // Measurement object'ini formatla
  const formatMeasurementValue = (measurement: any) => {
    if (!measurement) return '';
    if (typeof measurement === 'string') return measurement;
    if (measurement.displayValue) return measurement.displayValue;
    if (measurement.value && measurement.unit) {
      return `${measurement.value} ${measurement.unit}`;
    }
    return '';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderContent = () => {
    switch (marker.type) {
      case 'favorite':
        const favData = marker.data;
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            {favData.image && (
              <Image source={{ uri: favData.image }} style={styles.modalImage} />
            )}
            
            {/* Title & Rating */}
            <View style={styles.modalHeaderSection}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{marker.name}</Text>
                <View style={styles.spotTypeContainer}>
                  <Icon name="heart" size={16} color="#E91E63" />
                  <Text style={styles.spotTypeText}>Favori Spot</Text>
                </View>
              </View>
              {favData.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{favData.rating}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Bilgiler</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="droplet" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Su Türü</Text>
                  <Text style={styles.infoValue}>{favData.waterType === 'saltwater' ? 'Tuzlu Su' : 'Tatlı Su'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="trending-down" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Derinlik</Text>
                  <Text style={styles.infoValue}>{favData.depth}m</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="award" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Zorluk</Text>
                  <Text style={styles.infoValue}>{favData.difficulty}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="user" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Ekleyen</Text>
                  <Text style={styles.infoValue}>{favData.addedBy}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{favData.description}</Text>
            </View>

            {/* Fish Species */}
            {favData.fishSpecies && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Balık Türleri</Text>
                <View style={styles.speciesContainer}>
                  {favData.fishSpecies.map((species, index) => (
                    <View key={index} style={styles.speciesTag}>
                      <Text style={styles.speciesText}>{species}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tips */}
            {favData.tips && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>İpuçları</Text>
                {favData.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="lightbulb" size={14} color={theme.colors.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Last Catch */}
            {favData.lastCatch && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Son Av</Text>
                <View style={styles.catchInfo}>
                  <Text style={styles.catchText}>
                    {favData.lastCatch.species} - {favData.lastCatch.weight || '-'}
                  </Text>
                  <Text style={styles.catchDate}>{favData.lastCatch.date}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.dateText}>
                Favorilere eklendi: {formatDate(favData.addedDate)}
              </Text>
            </View>
          </ScrollView>
        );

      case 'private':
        const privData = marker.data;
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            {privData.image && (
              <Image source={{ uri: privData.image }} style={styles.modalImage} />
            )}
            
            {/* Title & Rating */}
            <View style={styles.modalHeaderSection}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{marker.name}</Text>
                <View style={styles.spotTypeContainer}>
                  <Icon name="lock" size={16} color="#9C27B0" />
                  <Text style={styles.spotTypeText}>Gizli Spot</Text>
                </View>
              </View>
              {privData.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{privData.rating}</Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Bilgiler</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="droplet" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Su Türü</Text>
                  <Text style={styles.infoValue}>{privData.waterType === 'saltwater' ? 'Tuzlu Su' : 'Tatlı Su'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="trending-down" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Derinlik</Text>
                  <Text style={styles.infoValue}>{privData.depth}m</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="award" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Zorluk</Text>
                  <Text style={styles.infoValue}>{privData.difficulty}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="calendar" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Son Ziyaret</Text>
                  <Text style={styles.infoValue}>{formatDate(privData.lastVisited)}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{privData.description}</Text>
            </View>

            {/* Fish Species */}
            {privData.fishSpecies && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Balık Türleri</Text>
                <View style={styles.speciesContainer}>
                  {privData.fishSpecies.map((species, index) => (
                    <View key={index} style={styles.speciesTag}>
                      <Text style={styles.speciesText}>{species}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Catch History */}
            {privData.catchHistory && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Av Geçmişi</Text>
                {privData.catchHistory.map((catch_, index) => (
                  <View key={index} style={styles.catchHistoryItem}>
                    <View style={styles.catchHistoryInfo}>
                      <Text style={styles.catchHistorySpecies}>{catch_.species}</Text>
                      <Text style={styles.catchHistoryWeight}>{catch_.weight || '-'}</Text>
                    </View>
                    <Text style={styles.catchHistoryDate}>{catch_.date}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {privData.tips && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>İpuçları</Text>
                {privData.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="lightbulb" size={14} color={theme.colors.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.dateText}>
                Oluşturuldu: {formatDate(privData.createdDate)}
              </Text>
            </View>
          </ScrollView>
        );

      case 'myspot':
        const myData = marker.data;
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            {myData.image && (
              <Image source={{ uri: myData.image }} style={styles.modalImage} />
            )}
            
            {/* Title & Stats */}
            <View style={styles.modalHeaderSection}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{marker.name}</Text>
                <View style={styles.spotTypeContainer}>
                  <Icon name="map-pin" size={16} color="#2196F3" />
                  <Text style={styles.spotTypeText}>Benim Spotım</Text>
                </View>
              </View>
              {myData.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{myData.rating}</Text>
                </View>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="heart" size={16} color="#E91E63" />
                <Text style={styles.statNumber}>{myData.likes}</Text>
                <Text style={styles.statLabel}>Beğeni</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="eye" size={16} color={theme.colors.primary} />
                <Text style={styles.statNumber}>{myData.views}</Text>
                <Text style={styles.statLabel}>Görüntüleme</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="share" size={16} color={theme.colors.primary} />
                <Text style={styles.statNumber}>{myData.shares}</Text>
                <Text style={styles.statLabel}>Paylaşım</Text>
              </View>
            </View>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Bilgiler</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="droplet" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Su Türü</Text>
                  <Text style={styles.infoValue}>{myData.waterType === 'saltwater' ? 'Tuzlu Su' : 'Tatlı Su'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="trending-down" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Derinlik</Text>
                  <Text style={styles.infoValue}>{convertAndFormat(myData.depth, 'depth')}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="award" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Zorluk</Text>
                  <Text style={styles.infoValue}>{myData.difficulty}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="globe" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Durum</Text>
                  <Text style={styles.infoValue}>{myData.isPublic ? 'Herkese Açık' : 'Özel'}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{myData.description}</Text>
            </View>

            {/* Fish Species */}
            {myData.fishSpecies && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Balık Türleri</Text>
                <View style={styles.speciesContainer}>
                  {myData.fishSpecies.map((species, index) => (
                    <View key={index} style={styles.speciesTag}>
                      <Text style={styles.speciesText}>{species}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tips */}
            {myData.tips && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>İpuçları</Text>
                {myData.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="lightbulb" size={14} color={theme.colors.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Last Catch */}
            {myData.lastCatch && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Son Av</Text>
                <View style={styles.catchInfo}>
                  <Text style={styles.catchText}>
                    {myData.lastCatch.species} - {myData.lastCatch.weight || '-'}
                  </Text>
                  <Text style={styles.catchDate}>{myData.lastCatch.date}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.dateText}>
                Oluşturuldu: {formatDate(myData.createdDate)}
              </Text>
            </View>
          </ScrollView>
        );

      case 'catch':
        const catchData = marker.data;
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            {catchData.image && (
              <Image source={{ uri: catchData.image }} style={styles.modalImage} />
            )}
            
            {/* Title */}
            <View style={styles.modalHeaderSection}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{catchData.species}</Text>
                <View style={styles.spotTypeContainer}>
                  <Icon name="fish" size={16} color="#4CAF50" />
                  <Text style={styles.spotTypeText}>Av Kaydı</Text>
                </View>
              </View>
            </View>

            {/* Catch Stats */}
            <View style={styles.catchStatsContainer}>
              <View style={styles.catchStatItem}>
                <Icon name="package" size={20} color={theme.colors.primary} />
                <Text style={styles.catchStatNumber}>{catchData.weight || '-'}</Text>
                <Text style={styles.catchStatLabel}>Ağırlık</Text>
              </View>
              {catchData.length && (
                <View style={styles.catchStatItem}>
                  <Icon name="maximize" size={20} color={theme.colors.primary} />
                  <Text style={styles.catchStatNumber}>{catchData.length || '-'}</Text>
                  <Text style={styles.catchStatLabel}>Uzunluk</Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Av Bilgileri</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="calendar" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Tarih</Text>
                  <Text style={styles.infoValue}>{formatDate(catchData.date)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="clock" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Saat</Text>
                  <Text style={styles.infoValue}>{catchData.time}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="map-pin" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Konum</Text>
                  <Text style={styles.infoValue}>{catchData.location}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="cloud" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Hava</Text>
                  <Text style={styles.infoValue}>{catchData.weather}</Text>
                </View>
              </View>
            </View>

            {/* Technique & Bait */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Teknik & Yem</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="tool" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Teknik</Text>
                  <Text style={styles.infoValue}>{catchData.technique}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="package" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Yem</Text>
                  <Text style={styles.infoValue}>{catchData.bait}</Text>
                </View>
              </View>
            </View>

            {/* Equipment */}
            {catchData.equipment && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Kullanılan Ekipman</Text>
                <View style={styles.equipmentList}>
                  {catchData.equipment.map((item, index) => (
                    <View key={index} style={styles.equipmentItem}>
                      <Icon name="tool" size={14} color={theme.colors.primary} />
                      <Text style={styles.equipmentText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Notes */}
            {catchData.notes && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Notlar</Text>
                <Text style={styles.description}>{catchData.notes}</Text>
              </View>
            )}

            {/* Images */}
            {catchData.images && catchData.images.length > 1 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Fotoğraflar ({catchData.images.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.imageGallery}>
                    {catchData.images.slice(1).map((image, index) => (
                      <Image key={index} source={{ uri: image }} style={styles.galleryImage} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.dateText}>
                Yakalandı: {formatDate(catchData.date)}
              </Text>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={isVisible}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeaderBar}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Icon name="x" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalShareButton} onPress={shareLocation}>
            <Icon name="share" size={20} color={theme.colors.primary} />
            <Text style={styles.modalShareText}>Paylaş</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          {renderContent()}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  infoCard: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  // Crosshair stilleri
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    marginTop: -60,
    marginLeft: -60,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 120,
    height: 1,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: 120,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  crosshairCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  // Geolocation buton stilleri
  geolocateContainer: {
    position: 'absolute',
    top: 20,
    right: theme.spacing.md,
  },
  geolocateButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legend: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  legendIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  modalSection: {
    marginBottom: theme.spacing.md,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  // Modal stilleri
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  modalHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalCloseButton: {
    padding: theme.spacing.sm,
  },
  modalShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  modalShareText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  modalHeaderSection: {
    marginBottom: theme.spacing.lg,
  },
  modalTitleContainer: {
    marginBottom: theme.spacing.sm,
  },
  spotTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  spotTypeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  infoSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  infoItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  speciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  speciesTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  speciesText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  catchInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  catchText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  catchDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  catchHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  catchHistoryInfo: {
    flex: 1,
  },
  catchHistorySpecies: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  catchHistoryWeight: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  catchHistoryDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  catchStatsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  catchStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  catchStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  catchStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  equipmentList: {
    gap: theme.spacing.xs,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  equipmentText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  imageGallery: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.sm,
  },
  modalFooter: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default YourMapScreen;