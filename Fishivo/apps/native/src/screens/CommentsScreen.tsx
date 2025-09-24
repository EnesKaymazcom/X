import React from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ScreenContainer } from '@/components/ui';
import { CommentSection } from '@/components/comments';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

type CommentsScreenProps = StackScreenProps<RootStackParamList, 'Comments'>;

const CommentsScreen: React.FC<CommentsScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { postId, initialCommentCount } = route.params;
  const { user } = useSupabaseUser();

  const navigateToProfile = (userId: string) => {
    if (userId === user?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    } else {
      navigation.navigate('UserProfile', { userId });
    }
  };

  const handleGoBack = () => {
    // First dismiss keyboard
    Keyboard.dismiss();
    
    // Then navigate back after a short delay for smooth UX
    setTimeout(() => {
      navigation.goBack();
    }, 100);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('common.comments')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: handleGoBack
          }
        ]}
      />
      
      <ScreenContainer paddingVertical="none">
        <CommentSection
          postId={postId}
          currentUserId={user?.id}
          onUserPress={navigateToProfile}
          autoFocusInput={true}
          initialCommentCount={initialCommentCount}
        />
      </ScreenContainer>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default CommentsScreen;