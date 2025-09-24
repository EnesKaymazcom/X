import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainerRef } from '@react-navigation/native';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import type { User } from '@supabase/supabase-js';
import type { RootStackParamList } from '@/types/navigation';
import AuthScreen from '@/screens/AuthScreen';
import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
import UserProfileScreen from '@/screens/UserProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import NotificationSettingsScreen from '@/screens/NotificationSettingsScreen';
import UnitsSettingsScreen from '@/screens/UnitsSettingsScreen';
import BlockedUsersScreen from '@/screens/BlockedUsersScreen';
import AddGearScreen from '@/screens/AddGearScreen';
import AddCatchScreen from '@/screens/AddCatchScreen';
import AddSpotScreen from '@/screens/AddSpotScreen';
import PostDetailScreen from '@/screens/PostDetailScreen';
import CommentsScreen from '@/screens/CommentsScreen';
import LikersScreen from '@/screens/LikersScreen';
import FollowersScreen from '@/screens/FollowersScreen';
import FollowingScreen from '@/screens/FollowingScreen';
import LocationManagementScreen from '@/screens/LocationManagementScreen';
import AddLocationScreen from '@/screens/AddLocationScreen';
import ExploreSearchScreen from '@/screens/ExploreSearchScreen';
import FishSpeciesScreen from '@/screens/FishSpeciesScreen';
import FishDetailScreen from '@/screens/FishDetailScreen';
import GearDetailScreen from '@/screens/GearDetailScreen';
import FishingDisciplinesScreen from '@/screens/FishingDisciplinesScreen';
import FishingDisciplineDetailScreen from '@/screens/FishingDisciplineDetailScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import YourMapScreen from '@/screens/YourMapScreen';
import FindFriendsScreen from '@/screens/FindFriendsScreen';
import ProDemoScreen from '@/screens/ProDemoScreen';
import TabNavigator from '@/navigation/TabNavigator';
import FloatingActionMenu from '@/components/ui/FloatingActionMenu';

const Stack = createStackNavigator<RootStackParamList>();
interface AppNavigatorProps {
  navigationRef?: React.RefObject<NavigationContainerRef<RootStackParamList>>;
}

// MainTabs wrapper component with proper types
interface MainTabsWrapperProps {
  showFloatingMenu: boolean;
  setShowFloatingMenu: (show: boolean) => void;
  onLogCatch: () => void;
  onLogTrip: () => void;
  onAddWaypoints: () => void;
  onAddGear: () => void;
}

const MainTabsWrapper: React.FC<MainTabsWrapperProps> = ({ 
  showFloatingMenu, 
  setShowFloatingMenu, 
  onLogCatch, 
  onLogTrip, 
  onAddWaypoints, 
  onAddGear 
}) => (
  <TabNavigator 
    showFloatingMenu={showFloatingMenu}
    setShowFloatingMenu={setShowFloatingMenu}
    onLogCatch={onLogCatch}
    onLogTrip={onLogTrip}
    onAddWaypoints={onAddWaypoints}
    onAddGear={onAddGear}
  />
);

export default function AppNavigator({ navigationRef }: AppNavigatorProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  
  useEffect(() => {
    const supabase = getNativeSupabaseClient();
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        // Session error - user will see login screen
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  // FloatingActionMenu handlers
  const handleLogCatch = () => {
    setShowFloatingMenu(false);
    setTimeout(() => {
      navigationRef?.current?.navigate('AddCatch');
    }, 400);
  };

  const handleLogTrip = () => {
    setShowFloatingMenu(false);
    setTimeout(() => {
      navigationRef?.current?.navigate('AddSpot');
    }, 400);
  };

  const handleAddWaypoints = () => {
    setShowFloatingMenu(false);
    setTimeout(() => {
      navigationRef?.current?.navigate('AddLocation');
    }, 400);
  };

  const handleAddGear = () => {
    setShowFloatingMenu(false);
    setTimeout(() => {
      navigationRef?.current?.navigate('AddGear');
    }, 400);
  };

  if (loading) {
    return null; // No spinner, let the screens handle their own loading states
  }
  
  return (
    <>
      <Stack.Navigator 
        id={undefined}
        initialRouteName={user ? 'MainTabs' : 'Auth'}
        screenOptions={{ 
          headerShown: false,
          animation: 'none',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen 
          name="MainTabs"
          children={() => (
            <MainTabsWrapper
              showFloatingMenu={showFloatingMenu}
              setShowFloatingMenu={setShowFloatingMenu}
              onLogCatch={handleLogCatch}
              onLogTrip={handleLogTrip}
              onAddWaypoints={handleAddWaypoints}
              onAddGear={handleAddGear}
            />
          )}
        />
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
        <Stack.Screen name="Comments" component={CommentsScreen} />
        <Stack.Screen name="Likers" component={LikersScreen} />
        <Stack.Screen name="Followers" component={FollowersScreen} />
        <Stack.Screen name="Following" component={FollowingScreen} />
        <Stack.Screen name="LocationManagement" component={LocationManagementScreen} />
        <Stack.Screen name="AddLocation" component={AddLocationScreen} />
        <Stack.Screen name="ExploreSearch" component={ExploreSearchScreen} />
        <Stack.Screen name="FishSpecies" component={FishSpeciesScreen} />
        <Stack.Screen name="FishDetail" component={FishDetailScreen} />
        <Stack.Screen name="GearDetail" component={GearDetailScreen} />
        <Stack.Screen name="FishingDisciplines" component={FishingDisciplinesScreen} />
        <Stack.Screen name="FishingDisciplineDetail" component={FishingDisciplineDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="YourMap" component={YourMapScreen} />
        <Stack.Screen name="FindFriends" component={FindFriendsScreen} />
        <Stack.Screen name="Premium" component={ProDemoScreen} />
      </Stack.Navigator>
      
      {/* FloatingActionMenu rendered after TabNavigator for proper layering */}
      {user && (
        <FloatingActionMenu
          visible={showFloatingMenu}
          onClose={() => setShowFloatingMenu(false)}
          onLogCatch={handleLogCatch}
          onLogTrip={handleLogTrip}
          onAddWaypoints={handleAddWaypoints}
          onAddGear={handleAddGear}
        />
      )}
    </>
  );
} 