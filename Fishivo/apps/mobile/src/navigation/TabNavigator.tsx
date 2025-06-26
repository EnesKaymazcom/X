import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';

import { Icon, FloatingActionMenu } from '@fishivo/ui';
import { theme } from '@fishivo/shared';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import WeatherScreen from '../screens/WeatherScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Map: { selectedLocation: any } | undefined;
  Weather: undefined;
  Profile: undefined;
};

// Tab Bar Icon Renderer
const renderIcon = (routeName: string, selectedTab: string) => {
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
      style={styles.tabbarItem}
    >
      {renderIcon(routeName, selectedTab)}
    </TouchableOpacity>
  );
};

export default function TabNavigator() {
  const navigation = useNavigation();
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const handleLogCatch = () => {
    setShowFloatingMenu(false);
    navigation.navigate('AddCatch' as never);
  };

  const handleLogTrip = () => {
    setShowFloatingMenu(false);
    navigation.navigate('AddSpot' as never);
  };

  return (
    <>
      {/* @ts-ignore */}
      <CurvedBottomBarExpo.Navigator
        type="DOWN"
        style={styles.bottomBar}
        shadowStyle={styles.shadow}
        height={65}
        circleWidth={50}
        bgColor={theme.colors.surface}
        initialRouteName="Home"
        borderTopLeftRight
        renderCircle={() => (
          <Animated.View style={styles.btnCircleUp}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowFloatingMenu(true)}
            >
              <Icon name="plus" color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </Animated.View>
        )}
        tabBar={renderTabBar}
      >
        <CurvedBottomBarExpo.Screen
          name="Home"
          position="LEFT"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Map"
          position="LEFT"
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Weather"
          position="RIGHT"
          component={WeatherScreen}  
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Profile"
          position="RIGHT"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </CurvedBottomBarExpo.Navigator>
      
      <FloatingActionMenu
        visible={showFloatingMenu}
        onClose={() => setShowFloatingMenu(false)}
        onLogCatch={handleLogCatch}
        onLogTrip={handleLogTrip}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bottomBar: {},
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btnCircleUp: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    bottom: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 1,
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
});