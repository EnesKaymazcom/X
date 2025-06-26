import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import AuthScreen from '../screens/AuthScreen';
// import UserProfileScreen from '../screens/UserProfileScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import EditProfileScreen from '../screens/EditProfileScreen';
// import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
// import UnitsSettingsScreen from '../screens/UnitsSettingsScreen';
// import BlockedUsersScreen from '../screens/BlockedUsersScreen';
// import AddGearScreen from '../screens/AddGearScreen';
// import AddCatchScreen from '../screens/AddCatchScreen';
// import AddSpotScreen from '../screens/AddSpotScreen';
// import PostDetailScreen from '../screens/PostDetailScreen';
// import LocationManagementScreen from '../screens/LocationManagementScreen';
// import AddLocationScreen from '../screens/AddLocationScreen';
// import ExploreSearchScreen from '../screens/ExploreSearchScreen';
// import FishSpeciesScreen from '../screens/FishSpeciesScreen';
// import FishDetailScreen from '../screens/FishDetailScreen';
// import NotificationsScreen from '../screens/NotificationsScreen';
// import YourMapScreen from '../screens/YourMapScreen';

import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🧭 AppNavigator: Render triggered', {
    isAuthenticated,
    isLoading,
    initialRoute: isAuthenticated ? "MainTabs" : "Auth"
  });

  // Loading durumunda boş ekran göster
  if (isLoading) {
    console.log('⏳ AppNavigator: Still loading, showing null');
    return null;
  }

  console.log('🚀 AppNavigator: Rendering Stack Navigator with route:', isAuthenticated ? "MainTabs" : "Auth");

  return (
    <Stack.Navigator 
      id={undefined}
      initialRouteName={isAuthenticated ? "MainTabs" : "Auth"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      {/* Temporarily commented out until screens are created
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="UnitsSettings" component={UnitsSettingsScreen} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
      <Stack.Screen name="AddGear" component={AddGearScreen} />
      <Stack.Screen name="AddCatch" component={AddCatchScreen} />
      <Stack.Screen name="AddSpot" component={AddSpotScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="LocationManagement" component={LocationManagementScreen} />
      <Stack.Screen name="AddLocation" component={AddLocationScreen} />
      <Stack.Screen name="ExploreSearch" component={ExploreSearchScreen} />
      <Stack.Screen name="FishSpecies" component={FishSpeciesScreen} />
      <Stack.Screen name="FishDetail" component={FishDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="YourMap" component={YourMapScreen} />
      */}
    </Stack.Navigator>
  );
}