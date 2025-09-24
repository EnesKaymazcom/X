import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Icon,
  AppHeader,
  ScreenContainer,
  Button,
  SectionHeader,
  FishivoModal,
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface SpotDetailScreenProps {
  navigation: any;
  route: {
    params: {
      spotId: string;
      spotData?: any;
    };
  };
}

interface SpotSpecies {
  species_id: string;
  species_name: string;
  species_name_tr: string;
  catch_count: number;
  last_caught: string;
  image_url?: string;
}

const SpotDetailScreen: React.FC<SpotDetailScreenProps> = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useSupabaseUser();
  const styles = createStyles(theme);
  
  const { spotId, spotData: initialSpotData } = route.params;
  
  const [spot, setSpot] = useState(initialSpotData);
  const [spotSpecies, setSpotSpecies] = useState<SpotSpecies[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const apiService = createNativeApiService();

  useEffect(() => {
    loadSpotDetails();
  }, [spotId]);

  const loadSpotDetails = async () => {
    try {
      setIsLoading(true);
      
      // Get spot details if not provided
      if (!spot) {
        const spotDetails = await apiService.spotsService.getSpotById(spotId);
        if (spotDetails) {
          setSpot(spotDetails);
        }
      }
      
      // Get species caught at this spot
      const species = await apiService.spotsService.getSpotSpecies(spotId);
      setSpotSpecies(species);
      
    } catch (error) {
      console.error('Error loading spot details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddSpot', {
      editMode: true,
      spotId: spot.id,
      spotData: spot
    });
  };

  const handleDelete = async () => {
    try {
      const success = await apiService.spotsService.deleteSpot(spotId);
      if (success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error deleting spot:', error);
    }
    setShowDeleteModal(false);
  };

  const formatLastCaught = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: locale === 'tr' ? tr : enUS
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('spots.detail.title')}
          leftButtons={[{
            icon: 'arrow-left',
            onPress: () => navigation.goBack()
          }]}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={spot?.name || t('spots.detail.title')}
        leftButtons={[{
          icon: 'arrow-left',
          onPress: () => navigation.goBack()
        }]}
        rightButtons={
          spot?.user_id === user?.id ? [
            {
              icon: 'edit',
              onPress: handleEdit
            },
            {
              icon: 'trash-2',
              onPress: () => setShowDeleteModal(true)
            }
          ] : []
        }
      />
      
      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Spot Images */}
          {spot?.images && spot.images.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}
            >
              {spot.images.map((image: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.spotImage}
                />
              ))}
            </ScrollView>
          )}

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.spotName}>{spot?.name}</Text>
            {spot?.description && (
              <Text style={styles.description}>{spot.description}</Text>
            )}
            
            <View style={styles.infoRow}>
              <Icon name="droplet" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>
                {spot?.water_type === 'freshwater' ? t('spots.waterType.freshwater') : t('spots.waterType.saltwater')}
              </Text>
            </View>
            
            {spot?.depth_min && (
              <View style={styles.infoRow}>
                <Icon name="arrow-down" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  {t('spots.detail.depth')}: {spot.depth_min}-{spot.depth_max || spot.depth_min}m
                </Text>
              </View>
            )}
          </View>

          {/* Species Caught at This Spot */}
          <View style={styles.section}>
            <SectionHeader 
              title={t('spots.detail.speciesCaught')} 
              subtitle={spotSpecies.length > 0 ? `${spotSpecies.length} ${t('spots.detail.species')}` : undefined}
            />
            
            {spotSpecies.length > 0 ? (
              <View style={styles.speciesList}>
                {spotSpecies.map((species) => (
                  <TouchableOpacity
                    key={species.species_id}
                    style={styles.speciesCard}
                    onPress={() => navigation.navigate('FishDetail', { 
                      species: { id: species.species_id }
                    })}
                  >
                    <View style={styles.speciesImageContainer}>
                      {species.image_url ? (
                        <Image 
                          source={{ uri: species.image_url }}
                          style={styles.speciesImage}
                        />
                      ) : (
                        <Icon name="fish" size={24} color={theme.colors.textSecondary} />
                      )}
                    </View>
                    
                    <View style={styles.speciesInfo}>
                      <Text style={styles.speciesName}>
                        {locale === 'tr' ? species.species_name_tr || species.species_name : species.species_name}
                      </Text>
                      <Text style={styles.catchCount}>
                        {species.catch_count} {t('spots.detail.catches')}
                      </Text>
                      <Text style={styles.lastCaught}>
                        {t('spots.detail.lastCaught')}: {formatLastCaught(species.last_caught)}
                      </Text>
                    </View>
                    
                    <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="fish" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>{t('spots.detail.noSpeciesYet')}</Text>
                <Text style={styles.emptySubtext}>{t('spots.detail.beFirstToCatch')}</Text>
                <Button 
                  variant="primary"
                  size="md"
                  onPress={() => navigation.navigate('AddCatch')}
                  style={styles.addCatchButton}
                >
                  {t('spots.detail.addCatch')}
                </Button>
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* Delete Confirmation Modal */}
      <FishivoModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        preset="danger"
        title={t('spots.detail.deleteTitle')}
        description={t('spots.detail.deleteMessage')}
        primaryButton={{
          text: t('common.delete'),
          onPress: handleDelete
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => setShowDeleteModal(false)
        }}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesContainer: {
    marginBottom: theme.spacing.lg,
  },
  spotImage: {
    width: 300,
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  spotName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  speciesList: {
    marginTop: theme.spacing.md,
  },
  speciesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  speciesImageContainer: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  speciesImage: {
    width: 45,
    height: 35,
    resizeMode: 'contain',
  },
  speciesInfo: {
    flex: 1,
  },
  speciesName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  catchCount: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  lastCaught: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  addCatchButton: {
    paddingHorizontal: theme.spacing.xl,
  },
});

export default SpotDetailScreen;