export interface UserListItem {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  is_pro?: boolean;
}

export interface UserListScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: object) => void;
  };
  route: {
    params: {
      userId: string;
      userName?: string;
    };
  };
}