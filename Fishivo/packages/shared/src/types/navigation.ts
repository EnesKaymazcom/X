// Navigation types for React Navigation
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Home: undefined;
  Map: undefined;
  AddCatch: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  UserProfile: { userId: string };
  Settings: undefined;
  EditProfile: undefined;
  NotificationSettings: undefined;
  UnitsSettings: undefined;
  BlockedUsers: undefined;
  AddGear: { gearId?: string } | undefined;
  AddCatch: undefined;
  AddSpot: undefined;
  PostDetail: { postId: string };
  LocationManagement: undefined;
  AddLocation: undefined;
  ExploreSearch: undefined;
  FishSpecies: undefined;
  FishDetail: { catchId: string };
  Notifications: undefined;
  YourMap: undefined;
  Premium: undefined;
};

// Tab Navigator specific types (will be imported from apps/mobile when created)
export type MainTabParamList = RootTabParamList;