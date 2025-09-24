import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import Icon from '@/components/ui/Icon';
import { getConservationStatusInfo, getConservationStatusColors } from '@/utils/conservation-status';
import { FishSpecies } from '@fishivo/types';
import { getProxiedImageUrl } from '@fishivo/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface FishCardProps {
  fish: FishSpecies;
  onPress: () => void;
}

const FishCard: React.FC<FishCardProps> = ({ fish, onPress }) => {
  const { theme, isDark } = useTheme();
  const { locale, t } = useTranslation();
  const [imageError, setImageError] = React.useState(false);
  
  // Animation values
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);

  // Get display name
  const getDisplayName = () => {
    if (locale === 'tr' && fish.common_names_tr && fish.common_names_tr.length > 0) {
      return fish.common_names_tr[0];
    }
    return fish.common_name;
  };

  // Conservation status
  const conservationStatus = fish.conservation_status ? getConservationStatusInfo(fish.conservation_status) : null;
  const statusColors = fish.conservation_status ? getConservationStatusColors(fish.conservation_status) : null;

  // Gesture handler
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      'worklet';
      scale.value = withSpring(0.95, {
        damping: 20,
        stiffness: 300,
      });
    },
    onActive: (event) => {
      'worklet';
      // Calculate rotation based on touch position
      const centerX = CARD_WIDTH / 2;
      const centerY = 200; // Approximate card height center
      
      const rotationX = (event.x - centerX) / 15; // Daha hassas rotasyon
      const rotationY = -(event.y - centerY) / 15;
      
      x.value = withSpring(rotationX, {
        damping: 10,
        stiffness: 100,
      });
      y.value = withSpring(rotationY, {
        damping: 10,
        stiffness: 100,
      });
    },
    onEnd: () => {
      'worklet';
      x.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      y.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
    },
  });

  // Card animation style
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { scale: scale.value },
        { rotateY: `${x.value}deg` },
        { rotateX: `${y.value}deg` },
      ],
    };
  });

  // Image animation style
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      x.value,
      [-10, 0, 10],
      [5, 0, -5],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      y.value,
      [-10, 0, 10],
      [5, 0, -5],
      Extrapolate.CLAMP
    );
    const imageScale = interpolate(
      scale.value,
      [0.98, 1],
      [1, 1.05],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { scale: imageScale },
      ],
    };
  });

  // Text animation style
  const textAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      x.value,
      [-10, 0, 10],
      [3, 0, -3],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      y.value,
      [-10, 0, 10],
      [3, 0, -3],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX },
        { translateY },
      ],
    };
  });

  const styles = createStyles(theme, isDark);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, cardAnimatedStyle]}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={1}
          style={styles.touchable}
        >
          {/* Background Card */}
          <View style={styles.card}>
            {/* Image Container */}
            <View style={styles.imageWrapper}>
              <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
                {fish.image_url && !imageError ? (
                  <Image
                    source={{ uri: getProxiedImageUrl(fish.image_url) }}
                    style={styles.image}
                    onError={() => setImageError(true)}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={isDark ? ['#1E3A8A', '#1E40AF'] : ['#EFF6FF', '#DBEAFE']}
                    style={styles.imagePlaceholder}
                  >
                    <Icon name="fish" size={48} color="#60A5FA" />
                  </LinearGradient>
                )}
              </Animated.View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Fish Name */}
              <Animated.View style={textAnimatedStyle}>
                <Text style={styles.name} numberOfLines={1}>
                  {getDisplayName()}
                </Text>
              </Animated.View>

              {/* Scientific Name */}
              {fish.scientific_name && (
                <Animated.View style={textAnimatedStyle}>
                  <Text style={styles.scientificName} numberOfLines={1}>
                    {fish.scientific_name}
                  </Text>
                </Animated.View>
              )}

              {/* Family */}
              {fish.family && (
                <Animated.View style={textAnimatedStyle}>
                  <Text style={styles.family} numberOfLines={1}>
                    {t('fishSpecies.card.family')} {fish.family}
                  </Text>
                </Animated.View>
              )}

              {/* Conservation Status */}
              {conservationStatus && statusColors && (
                <Animated.View style={[styles.statusContainer, textAnimatedStyle]}>
                  <View style={[
                    styles.statusBadge,
                    { 
                      backgroundColor: statusColors.bgColor,
                      borderColor: statusColors.borderColor
                    }
                  ]}>
                    <Text style={[styles.statusCode, { color: statusColors.color }]}>
                      {conservationStatus.code}
                    </Text>
                  </View>
                  <Text style={styles.statusLabel} numberOfLines={1}>
                    {conservationStatus.label[locale]}
                  </Text>
                </Animated.View>
              )}

              {/* View Details */}
              <Animated.View style={textAnimatedStyle}>
                <Text style={styles.viewDetails}>
                  {t('fishSpecies.card.viewDetails')}
                </Text>
              </Animated.View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  touchable: {
    width: '100%',
  },
  card: {
    backgroundColor: isDark ? theme.colors.surface : '#F9FAFB',
    borderRadius: theme.borderRadius.xl,
    shadowColor: isDark ? theme.colors.primary : '#000',
    shadowOffset: {
      width: 0,
      height: isDark ? 8 : 2,
    },
    shadowOpacity: isDark ? 0.1 : 0.1,
    shadowRadius: isDark ? 32 : 3.84,
    elevation: isDark ? 16 : 5,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 3 / 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.lg,
  },
  name: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  scientificName: {
    fontSize: theme.typography.sm,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  family: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  statusCode: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  statusLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  viewDetails: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
    marginTop: theme.spacing.xs,
  },
});

export default FishCard;