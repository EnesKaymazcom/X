import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, AppHeader, ScreenContainer } from '@fishivo/ui';
import { theme, useUnits } from '@fishivo/shared';
// Mock JSON dosyaları kaldırıldı - API'den gelecek

interface FishDetailScreenProps {
  navigation: any;
  route: any;
}

interface FishTechnique {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface FishLocation {
  id: string;
  name: string;
  region: string;
  depth: string;
}

const FishDetailScreen: React.FC<FishDetailScreenProps> = ({ navigation, route }) => {
  const { speciesId } = route.params;
  const [species, setSpecies] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { convertAndFormatSync } = useUnits();
  const [activeTab, setActiveTab] = useState<'info' | 'techniques' | 'locations'>('info');

  // Mock data kaldırıldı - hardcoded data
  const allTechniques: FishTechnique[] = [
    { id: '1', name: 'Jigging', icon: '🎣', description: 'Dikey hareket ile avlama tekniği' },
    { id: '2', name: 'Trolling', icon: '🚤', description: 'Tekne ile çekerek avlama' },
    { id: '3', name: 'Casting', icon: '🎯', description: 'Atış yaparak avlama' }
  ];
  const allLocations: FishLocation[] = [
    { id: '1', name: 'Boğaziçi', region: 'İstanbul', depth: '5-15m' },
    { id: '2', name: 'Marmara Denizi', region: 'İstanbul', depth: '10-30m' }
  ];

  if (!species) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Balık bilgisi bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return '#22C55E';
      case 'Orta': return '#F59E0B';
      case 'Zor': return '#EF4444';
      default: return theme.colors.textSecondary;
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${species.name} (${species.scientificName}) - Fishivo'da keşfet!`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={species.name}
        leftButtons={[
          {
            icon: "arrow-left",
            onPress: () => navigation.goBack()
          }
        ]}
        rightButtons={[
          {
            icon: "share",
            onPress: handleShare
          }
        ]}
      />
      <ScreenContainer>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.fishIcon}>
              <Image
                source={{ uri: species.image }}
                style={styles.fishImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.fishName}>{species.name}</Text>
            <Text style={styles.scientificName}>{species.scientificName}</Text>
            
            <View style={styles.badges}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(species.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(species.difficulty) }]}>
                  {species.difficulty}
                </Text>
              </View>
              <View style={styles.seasonBadge}>
                <Icon name="clock" size={12} color={theme.colors.textSecondary} />
                <Text style={styles.seasonText}>{species.season}</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{species.postCount}</Text>
                <Text style={styles.statLabel}>Gönderi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2.4k</Text>
                <Text style={styles.statLabel}>Takipçi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.2</Text>
                <Text style={styles.statLabel}>Puan</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
                Bilgiler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'techniques' && styles.activeTab]}
              onPress={() => setActiveTab('techniques')}
            >
              <Text style={[styles.tabText, activeTab === 'techniques' && styles.activeTabText]}>
                Teknikler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'locations' && styles.activeTab]}
              onPress={() => setActiveTab('locations')}
            >
              <Text style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>
                Lokasyonlar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <View style={styles.tabContent}>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Genel Bilgiler</Text>
                <Text style={styles.description}>{species.description}</Text>
                
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Av Zorluğu</Text>
                    <Text style={styles.infoValue}>{species.difficulty}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Mevsim</Text>
                    <Text style={styles.infoValue}>{species.season}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ortalama Uzunluk</Text>
                    <Text style={styles.infoValue}>{convertAndFormatSync(parseFloat(species.averageLength), 'length')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Maksimum Ağırlık</Text>
                    <Text style={styles.infoValue}>{convertAndFormatSync(parseFloat(species.maximumWeight), 'weight')}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Habitat</Text>
                <Text style={styles.description}>
                  Kayalık alanlarda ve kumsal zonlarda yaşar. Sığ sulardan orta derinliklere kadar bulunabilir.
                  Genellikle sürüler halinde hareket eder.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Beslenme</Text>
                <Text style={styles.description}>
                  Küçük balıklar, kabuklular ve çok hücreli organizmalarla beslenir. 
                  Aktif bir avcıdır ve günün farklı saatlerinde beslenebilir.
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'techniques' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Önerilen Teknikler</Text>
              {species.techniques?.map((techniqueId: string) => {
                const technique = allTechniques.find(t => t.id === techniqueId);
                if (!technique) return null;
                
                return (
                  <View key={technique.id} style={styles.techniqueCard}>
                    <View style={styles.techniqueHeader}>
                      <Text style={styles.techniqueIcon}>{technique.icon}</Text>
                      <Text style={styles.techniqueName}>{technique.name}</Text>
                    </View>
                    <Text style={styles.techniqueDescription}>{technique.description}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {activeTab === 'locations' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Popüler Lokasyonlar</Text>
              {species.locations?.map((locationId: string) => {
                const location = allLocations.find(l => l.id === locationId);
                if (!location) return null;
                
                return (
                  <View key={location.id} style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      <Text style={styles.locationRegion}>{location.region}</Text>
                    </View>
                    <Text style={styles.locationDepth}>Derinlik: {location.depth}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: theme.spacing.xl }} />
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
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  fishIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  fishImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  fishName: {
    fontSize: theme.typography['3xl'],
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  badges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  difficultyText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.full,
  },
  seasonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
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
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.semibold,
  },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  infoSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  infoItem: {
    width: '45%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  infoLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  techniqueCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  techniqueIcon: {
    fontSize: theme.typography.xl,
  },
  techniqueName: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  techniqueDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  locationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  locationName: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  locationRegion: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  locationDepth: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default FishDetailScreen;