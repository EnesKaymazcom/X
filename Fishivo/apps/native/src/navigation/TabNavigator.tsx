import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, Pressable, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CurvedBottomBar } from 'react-native-curved-bottom-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui';
import Avatar from '@/components/ui/Avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';

import HomeScreen from '@/screens/HomeScreen';
import MapScreen from '@/screens/MapScreen';
import WeatherScreen from '@/screens/WeatherScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import {
  FAB_BOTTOM_POSITION,
  FAB_SIZE,
  FAB_BORDER_RADIUS,
  FAB_SHADOW_OPACITY,
  FAB_SHADOW_RADIUS
} from '@/constants/fab';

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
}

interface TabNavigatorProps {
  showFloatingMenu: boolean;
  setShowFloatingMenu: (show: boolean) => void;
  onLogCatch?: () => void;
  onLogTrip?: () => void;
  onAddWaypoints?: () => void;
  onAddGear?: () => void;
}

export default function TabNavigator({ 
  showFloatingMenu, 
  setShowFloatingMenu, 
  onLogCatch: _onLogCatch,
  onLogTrip: _onLogTrip,
  onAddWaypoints: _onAddWaypoints,
  onAddGear: _onAddGear 
}: TabNavigatorProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const { user } = useSupabaseUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const fabRotation = useSharedValue(0);
  const fabScale = useSharedValue(1);
  const iconOpacity = useSharedValue(1);
  const tabSpacing = Math.min(Math.max(width * 0.06, 25), 45); // %6 of width, min 25px, max 45px
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) {
      setUserProfile(null);
      return;
    }

    try {
      const supabase = getNativeSupabaseClient();
      const { data, error } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
        setAvatarKey(prev => prev + 1);
      }
    } catch (error) {
      // Silently fail
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!user?.id) return;

    const supabase = getNativeSupabaseClient();
    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setUserProfile({
              full_name: payload.new.full_name,
              avatar_url: payload.new.avatar_url
            });
            setAvatarKey(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  // Dimension change listener kaldırıldı - artık gerekli değil

  // Professional morphing animation when menu opens/closes
  const fabOpacity = useSharedValue(1);
  
  useEffect(() => {
    if (showFloatingMenu) {
      // Open animation - FAB gizlenme
      fabRotation.value = withSpring(180, { // 180 derece yarım tur
        damping: 14,
        stiffness: 120,
      });
      
      // Scale animasyonu kaldırıldı, büyümeyecek
      fabScale.value = 1;
      
      // FAB'ı smooth gizle
      fabOpacity.value = withTiming(0, {
        duration: 50, // Çok hızlı kaybolma
      });
      
      // Icon fade - tamamen kaybolmasın sadece soluksun
      iconOpacity.value = withTiming(0.3, {
        duration: 50,
      });
    } else {
      // Close animation - FAB görünme
      fabRotation.value = withSpring(0, {
        damping: 14,
        stiffness: 120,
      });
      
      // Scale animasyonu kaldırıldı
      fabScale.value = 1;
      
      // FAB'ı smooth göster - X kapanmadan önce başla
      fabOpacity.value = withTiming(1, {
        duration: 150, // Biraz daha uzun
      });
      
      iconOpacity.value = withTiming(1, {
        duration: 100,
      });
    }
  }, [showFloatingMenu, fabRotation, fabScale, iconOpacity, fabOpacity]);

  // Tab Bar Icon Renderer
  const renderIcon = (routeName: string, selectedTab: string) => {
    // Special case for Profile tab - show avatar
    if (routeName === 'Profile' && userProfile) {
      const avatarUrl = userProfile.avatar_url 
        ? `${userProfile.avatar_url}${userProfile.avatar_url.includes('?') ? '&' : '?'}v=${avatarKey}`
        : null;
      
      return (
        <Avatar
          uri={avatarUrl}
          name={userProfile.full_name || user?.email || ''}
          size={24}
          style={routeName === selectedTab ? styles.selectedAvatar : undefined}
        />
      );
    }

    let iconName: string;
    switch (routeName) {
      case 'Home': iconName = 'home'; break;
      case 'Map': iconName = 'map'; break;
      case 'Weather': iconName = 'cloud'; break;
      case 'Profile': iconName = 'user'; break;
      default: iconName = 'circle';
    }

    return (
      <Icon
        name={iconName}
        size={20}
        color={routeName === selectedTab ? theme.colors.primary : theme.colors.textSecondary}
      />
    );
  };

  // Tab Bar Renderer
  const renderTabBar = ({ routeName, selectedTab, navigate }: { routeName: string; selectedTab: string; navigate: (routeName: string) => void }) => {
    return (
      <TouchableOpacity
        onPress={() => navigate(routeName)}
        style={[
          styles.tabbarItem,
          // Map ve Weather arasına responsive boşluk
          routeName === 'Map' && { marginRight: tabSpacing },
          routeName === 'Weather' && { marginLeft: tabSpacing }
        ]}
      >
        {renderIcon(routeName, selectedTab)}
      </TouchableOpacity>
    );
  };


  const handleFabPress = () => {
    setShowFloatingMenu(!showFloatingMenu);
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${fabRotation.value}deg` },
      { scale: fabScale.value },
    ],
    opacity: fabOpacity.value, // Animasyonlu opacity
  }));
  

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    // Scale animasyonu kaldırıldı - boyut sabit kalsın
  }));

  return (
    <>
      {/* BAĞIMSIZ + BUTONU - TABBAR'DAN AYRI */}
      <Animated.View 
        style={[
          styles.fabButtonContainer,
          fabAnimatedStyle,
        ]}
        pointerEvents={showFloatingMenu ? 'none' : 'auto'}
      >
        <Pressable
          style={styles.button}
          onPress={handleFabPress}
          hitSlop={10}
        >
          <Animated.View style={iconAnimatedStyle}>
            <Icon name="plus" color="#FFFFFF" size={20} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* @ts-ignore */}
      <CurvedBottomBar.Navigator
        type="DOWN"
        style={styles.bottomBar}
        shadowStyle={styles.shadow}
        height={65}
        circleWidth={50}
        bgColor={theme.colors.surface}
        initialRouteName="Home"
        borderTopLeftRight
        renderCircle={() => <View />}
        tabBar={renderTabBar}
      >
        <CurvedBottomBar.Screen
          name="Home"
          position="LEFT"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBar.Screen
          name="Map"
          position="LEFT"
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBar.Screen
          name="Weather"
          position="RIGHT"
          component={WeatherScreen}  
          options={{ headerShown: false }}
        />
        <CurvedBottomBar.Screen
          name="Profile"
          position="RIGHT"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </CurvedBottomBar.Navigator>
    </>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  bottomBar: {},
  shadow: {},
  fabButtonContainer: {
    position: 'absolute',
    bottom: FAB_BOTTOM_POSITION, // EKRANIN EN ALTINDAN
    alignSelf: 'center',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
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
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAvatar: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
}); 