import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  Platform,
  View,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Extrapolation,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Icon from '@/components/ui/Icon';
import Svg, { Path, G } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import {
  FAB_BOTTOM_POSITION,
  FAB_SIZE,
  FAB_BORDER_RADIUS,
  FAB_SHADOW_OPACITY,
  FAB_SHADOW_RADIUS
} from '@/constants/fab';

interface MenuItemData {
  id: string;
  title: string;
  icon: string;
  customIcon?: React.ReactNode;
  onPress: () => void;
  color: string;
}

interface FloatingActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogCatch: () => void;
  onLogTrip: () => void;
  onAddWaypoints: () => void;
  onAddGear: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// FishivoMarker'dan balık iconunu ayıklayacak component
const FishIcon = ({ color }: { color: string }) => (
  <Svg width="14" height="14" viewBox="0 0 596.71 606.41">
    <Path 
      fill={color} 
      d="M588.78,235.36c-2.57-3.06-5.25-6.02-7.83-9.07-29.12-34.4-63.3-62.75-102.31-85.26-48.55-28.02-100.6-45.08-156.57-49.93-2.7-.23-5.63-1.98-7.75-3.83-5.65-4.91-10.76-10.45-16.37-15.41-33.16-29.27-70.91-50.22-113.5-62.31-17.17-4.87-34.6-8.34-52.7-9.55.29.8.38,1.29.63,1.69,12.63,19.73,20.72,40.91,22.91,64.51,2.07,22.32-2.21,42.58-15.36,60.84-.57.79-1.03,1.66-2.06,3.32,22.61-10.87,45.47-17.23,68.96-21.73-1.09.91-2.29,1.56-3.56,2.04-11.31,4.27-22.95,7.81-33.89,12.88-51.98,24.06-94.98,59.21-127.88,106.21C16.68,265.22,2.12,304.55.16,348.05c-1.11,24.71,3.65,48.57,12.59,71.57,2.93,7.55,6.61,14.8,9.46,21.1.97-10.43,1.03-21.62,3.18-32.4,9.21-46.13,34.67-82.44,71.22-110.73,29.85-23.11,65.08-33.5,102.26-38.24,25.48-3.25,50.75-3.07,76,1.46,5.19.93,10.28,2.42,15.94,3.78-25.37,25.73-54.98,43.54-85.6,60.94,57.34,11.57,113.56,10.77,170.16-5.57-22.2-24.8-31.61-53.13-27.08-84.91,4.78-33.56,28.64-70.45,46.59-74.02-1.06,1.49-2.67,2.42-4.07,3.6-1.39,1.18-2.72,2.49-3.82,3.94-20.42,27.1-24.98,57.35-16.98,89.7,6.89,27.88,24.19,48.8,46.44,66.02,1.41,1.09,3.72,1.82,5.44,1.58,16.87-2.44,33.98-3.97,50.49-7.97,35.69-8.66,67.56-25.62,96.19-48.54,9.68-7.75,18.79-16.2,28.14-24.31-3.08-3.77-5.47-6.76-7.93-9.68ZM488.67,213.17c-.35,11-10.37,21.56-22.9,20.83-12.31-.01-22.41-10.02-22.65-22.43-.22-11.29,10.41-21.82,22.12-21.91,12.69-.1,23.83,10.82,23.43,23.51Z"
    />
    <Path 
      fill={color} 
      d="M174.51,432.56c-16.5-3.46-33.12-6.58-49.36-11.05-17.9-4.92-33.25-14.32-43.67-30.36-7.63-11.76-10.83-24.84-11.35-38.69-.11-2.97-.02-5.94-.02-8.91-15.05,20.89-23.82,43.81-27.53,68.58-3.34,22.31-1.2,44.53,3.64,66.35,9.67,43.55,30.39,81.3,61.69,113.13,4.94,5.02,10.41,9.51,16.26,14.81,14.52-37.43,17.27-74.74,9.62-113.15,23.88,3.95,46.89,2.9,69.76-2.47,20.41-4.79,40.96-8.46,62.07-7.49.61.03,1.24-.2,3.03-.51-5.87-4.97-10.84-9.38-16.02-13.53-23.08-18.51-49.16-30.63-78.12-36.71Z"
    />
  </Svg>
);

// SpotMarker'dan okyanus dalga iconunu ayıklayacak component
const WaveIcon = ({ color }: { color: string }) => (
  <Svg width="14" height="14" viewBox="0 -1.09 20.232 20.232">
    <G transform="translate(-2 -2.956)">
      <Path 
        d="M9,20h6M6,16H18" 
        fill="none" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="3"
      />
      <Path 
        d="M21,12c-1.82-.51-1.82-2-2.1-3.79C18.52,5.76,15.19,1.45,11,6a3,3,0,0,1,3,3h0a3,3,0,0,1-3,3H3" 
        fill="none" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="3"
      />
    </G>
  </Svg>
);

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  visible,
  onClose,
  onLogCatch,
  onLogTrip,
  onAddWaypoints,
  onAddGear,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const [isRendered, setIsRendered] = useState(false);
  const menuScale = useSharedValue(0);
  const itemTranslateY0 = useSharedValue(100);
  const itemTranslateY1 = useSharedValue(100);
  const itemTranslateY2 = useSharedValue(100);
  const itemTranslateY3 = useSharedValue(100);
  const itemTranslateY = useMemo(() => [itemTranslateY0, itemTranslateY1, itemTranslateY2, itemTranslateY3], [itemTranslateY0, itemTranslateY1, itemTranslateY2, itemTranslateY3]);
  const itemOpacity0 = useSharedValue(0);
  const itemOpacity1 = useSharedValue(0);
  const itemOpacity2 = useSharedValue(0);
  const itemOpacity3 = useSharedValue(0);
  const itemOpacity = useMemo(() => [itemOpacity0, itemOpacity1, itemOpacity2, itemOpacity3], [itemOpacity0, itemOpacity1, itemOpacity2, itemOpacity3]);
  const itemScale0 = useSharedValue(0.3);
  const itemScale1 = useSharedValue(0.3);
  const itemScale2 = useSharedValue(0.3);
  const itemScale3 = useSharedValue(0.3);
  const itemScale = useMemo(() => [itemScale0, itemScale1, itemScale2, itemScale3], [itemScale0, itemScale1, itemScale2, itemScale3]);
  const xButtonOpacity = useSharedValue(0);
  const xButtonRotation = useSharedValue(-180); // Daha fazla dönüş
  const menuItems = useMemo((): MenuItemData[] => [
    {
      id: 'catch',
      title: t('common.addCatch'),
      icon: 'fish',
      customIcon: <FishIcon color={theme.colors.primary} />,
      onPress: onLogCatch,
      color: theme.colors.primary,
    },
    {
      id: 'spot',
      title: t('common.addSpot'),
      icon: 'anchor',
      customIcon: <WaveIcon color="#10B981" />,
      onPress: onLogTrip,
      color: '#10B981',
    },
    {
      id: 'waypoints',
      title: t('common.addWaypoints'),
      icon: 'map-pin',
      onPress: onAddWaypoints,
      color: '#F59E0B',
    },
    {
      id: 'gear',
      title: t('common.addGear'),
      icon: 'backpack',
      onPress: onAddGear,
      color: '#8B5CF6',
    },
  ], [t, theme.colors.primary, onLogCatch, onLogTrip, onAddWaypoints, onAddGear]);
  
  const onAnimationComplete = useCallback(() => {
    'worklet';
    if (!visible) {
      runOnJS(setIsRendered)(false);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      
      menuScale.value = withSpring(1, {
        damping: 12,
        stiffness: 180,
      });
      
      // X butonu animasyonu - + dan X'e dönüşüm
      xButtonOpacity.value = withTiming(1, {
        duration: 100, // Daha hızlı belirme
      });
      xButtonRotation.value = withSpring(0, {
        damping: 12,
        stiffness: 150,
      });
      
      menuItems.forEach((_, index) => {
        const delay = index * 50;
        
        itemTranslateY[index].value = withDelay(
          delay,
          withSpring(0, {
            damping: 15,
            stiffness: 200,
            mass: 0.8,
          })
        );
        
        itemOpacity[index].value = withDelay(
          delay,
          withTiming(1, {
            duration: 200,
            easing: Easing.out(Easing.quad),
          })
        );
        
        itemScale[index].value = withDelay(
          delay,
          withSpring(1, {
            damping: 12,
            stiffness: 180,
            overshootClamping: false,
          })
        );
      });
    } else if (isRendered) {
      menuScale.value = withSpring(0.95, {
        damping: 20,
        stiffness: 100,
      });
      
      // X butonu kapanma animasyonu - X'ten +'ya dönüşüm
      xButtonOpacity.value = withTiming(0, {
        duration: 200,
      });
      xButtonRotation.value = withSpring(-180, {
        damping: 12,
        stiffness: 150,
      });
      
      menuItems.forEach((_, index) => {
        const reverseIndex = menuItems.length - 1 - index;
        const delay = reverseIndex * 50;
        itemTranslateY[index].value = withDelay(
          delay,
          withSpring(60, {
            damping: 18,
            stiffness: 150,
            mass: 0.8,
          })
        );
        itemOpacity[index].value = withDelay(
          delay,
          withTiming(0, {
            duration: 200,
            easing: Easing.in(Easing.quad),
          }, (finished) => {
            if (finished && index === 0) {
              onAnimationComplete();
            }
          })
        );
        itemScale[index].value = withDelay(
          delay,
          withSpring(0.5, {
            damping: 15,
            stiffness: 180,
          })
        );
      });
    }
  }, [visible, isRendered, onAnimationComplete, menuScale, xButtonOpacity, xButtonRotation, itemTranslateY, itemOpacity, itemScale, menuItems]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: menuScale.value },
    ],
    opacity: interpolate(
      menuScale.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  // Create individual animated styles for each menu item (required by React Hooks rules)
  const itemAnimatedStyle0 = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: itemTranslateY[0]?.value ?? 0 },
        { scale: itemScale[0]?.value ?? 1 },
      ],
      opacity: itemOpacity[0]?.value ?? 0,
    };
  });

  const itemAnimatedStyle1 = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: itemTranslateY[1]?.value ?? 0 },
        { scale: itemScale[1]?.value ?? 1 },
      ],
      opacity: itemOpacity[1]?.value ?? 0,
    };
  });

  const itemAnimatedStyle2 = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: itemTranslateY[2]?.value ?? 0 },
        { scale: itemScale[2]?.value ?? 1 },
      ],
      opacity: itemOpacity[2]?.value ?? 0,
    };
  });

  const itemAnimatedStyle3 = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: itemTranslateY[3]?.value ?? 0 },
        { scale: itemScale[3]?.value ?? 1 },
      ],
      opacity: itemOpacity[3]?.value ?? 0,
    };
  });

  const iconContainerStyle0 = useAnimatedStyle(() => {
    const scaleValue = itemScale[0]?.value ?? 1;
    
    return {
      transform: [
        {
          scale: interpolate(
            scaleValue,
            [0.85, 1],
            [0.95, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const iconContainerStyle1 = useAnimatedStyle(() => {
    const scaleValue = itemScale[1]?.value ?? 1;
    
    return {
      transform: [
        {
          scale: interpolate(
            scaleValue,
            [0.85, 1],
            [0.95, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const iconContainerStyle2 = useAnimatedStyle(() => {
    const scaleValue = itemScale[2]?.value ?? 1;
    
    return {
      transform: [
        {
          scale: interpolate(
            scaleValue,
            [0.85, 1],
            [0.95, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const iconContainerStyle3 = useAnimatedStyle(() => {
    const scaleValue = itemScale[3]?.value ?? 1;
    
    return {
      transform: [
        {
          scale: interpolate(
            scaleValue,
            [0.85, 1],
            [0.95, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Stable array references for the animated styles
  const itemAnimatedStyles = useMemo(() => [
    itemAnimatedStyle0,
    itemAnimatedStyle1,
    itemAnimatedStyle2,
    itemAnimatedStyle3
  ], [itemAnimatedStyle0, itemAnimatedStyle1, itemAnimatedStyle2, itemAnimatedStyle3]);

  const iconContainerStyles = useMemo(() => [
    iconContainerStyle0,
    iconContainerStyle1,
    iconContainerStyle2,
    iconContainerStyle3
  ], [iconContainerStyle0, iconContainerStyle1, iconContainerStyle2, iconContainerStyle3]);
  
  const xButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: xButtonOpacity.value,
    transform: [
      { rotate: `${xButtonRotation.value}deg` },
    ],
  }));

  const handleItemPress = (index: number) => {
    'worklet';
    // Type-safe bounds checking
    if (index < 0 || index >= itemScale.length || index >= menuItems.length) {
      return;
    }
    
    const scaleSharedValue = itemScale[index];
    const menuItem = menuItems[index];
    
    if (scaleSharedValue && menuItem) {
      scaleSharedValue.value = withSequence(
        withTiming(0.85, { duration: 100 }),
        withSpring(1, {
          damping: 8,
          stiffness: 200,
        })
      );
      
      runOnJS(menuItem.onPress)();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      
      {/* FAB X Butonu - TabNavigator tarzı */}
      <Animated.View style={[
        styles.fabContainer, 
        xButtonAnimatedStyle
      ]}>
        <Pressable
          style={styles.fabButton}
          onPress={onClose}
          hitSlop={10}
        >
          <Icon name="x" color="#FFFFFF" size={18} />
        </Pressable>
      </Animated.View>
      
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        
        <Animated.View
          style={[
            styles.container,
            containerAnimatedStyle,
          ]}
          pointerEvents="box-none"
        >
          {menuItems.map((item, index) => {
              // Type-safe style access
              const itemStyle = itemAnimatedStyles[index];
              const iconStyle = iconContainerStyles[index];
              
              if (!itemStyle || !iconStyle) {
                return null;
              }
              
              return (
                <Animated.View
                  key={item.id}
                  style={[styles.menuItem, itemStyle]}
                >
                  <AnimatedPressable
                    style={styles.menuButton}
                    onPress={() => handleItemPress(index)}
                    android_ripple={Platform.OS === 'android' ? {
                      color: isDark ? `${item.color}30` : `${item.color}20`,
                      borderless: false,
                    } : undefined}
                  >
                    <Animated.View 
                      style={[
                        styles.iconContainer, 
                        { backgroundColor: `${item.color}15` },
                        iconStyle,
                      ]}
                    >
                      {item.customIcon || <Icon name={item.icon} size={18} color={item.color} />}
                    </Animated.View>
                    <Text style={styles.menuText}>{item.title}</Text>
                  </AnimatedPressable>
                </Animated.View>
              );
            })}
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.65)',
  },
  fabContainer: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    bottom: FAB_BOTTOM_POSITION,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: FAB_SHADOW_OPACITY,
    shadowRadius: FAB_SHADOW_RADIUS,
    elevation: 999,
    zIndex: 999,
  },
  fabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 110,
    paddingHorizontal: theme.spacing.lg,
  },
  menuItem: {
    marginBottom: theme.spacing.sm,
    width: '100%',
    maxWidth: 221, // 260 * 0.85 = 221
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface, // Tema surface rengi kullan
    paddingVertical: Math.round((theme.spacing.sm + 2) * 0.85), // %15 azaltıldı
    paddingHorizontal: Math.round(theme.spacing.md * 0.85), // %15 azaltıldı
    borderRadius: theme.borderRadius.lg || 12,
    minHeight: Math.round(52 * 0.85), // 52 * 0.85 = 44
    gap: Math.round(theme.spacing.sm * 0.85), // %15 azaltıldı
    // Light mode: güçlü shadow
    ...(!isDark && {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    }),
    // Dark mode: subtle border + shadow
    ...(isDark && {
      borderWidth: 1,
      borderColor: theme.colors.border || '#374151',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md || 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: theme.typography.sm + 1,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.2,
  },
});

export default FloatingActionMenu; 