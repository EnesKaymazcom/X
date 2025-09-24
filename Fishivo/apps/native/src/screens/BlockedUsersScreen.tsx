import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, AppHeader, Avatar, Button, FishivoModal, EmptyState, Skeleton, SkeletonItem } from '@/components/ui';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api';

interface BlockedUsersScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: object) => void;
    canGoBack: () => boolean;
  };
}

interface BlockedUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  blockedDate: string;
}

const BlockedUsersScreen: React.FC<BlockedUsersScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const apiService = createNativeApiService();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { getNativeSupabaseClient } = await import('@fishivo/api/client/supabase.native');
        const { data: { user } } = await getNativeSupabaseClient().auth.getUser();
        
        if (!user) {
          setBlockedUsers([]);
          return;
        }
        
        const response = await apiService.contacts.getBlockedUsers(user.id);
        
        // API response'u local format'a çevir
        const formattedUsers = response.map((item) => ({
          id: item.users.id,
          name: item.users.full_name || item.users.username,
          username: item.users.username,
          avatar: item.users.avatar_url || undefined,
          blockedDate: new Date(item.created_at).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
          })
        }));
        
        setBlockedUsers(formattedUsers);
      } catch (error) {
        setBlockedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlockedUsers();
  }, [apiService.contacts]);

  const handleUnblockUser = (userId: string, userName: string) => {
    setSelectedUser({id: userId, name: userName});
    setShowUnblockModal(true);
  };

  const confirmUnblock = async () => {
    if (!selectedUser) return;
    
    setShowUnblockModal(false);
    
    try {
      // Get current user
      const { getNativeSupabaseClient } = await import('@fishivo/api/client/supabase.native');
      const { data: { user } } = await getNativeSupabaseClient().auth.getUser();
      
      if (!user) {
        setModalMessage(t('common.loginRequired'));
        setShowErrorModal(true);
        return;
      }
      
      await apiService.contacts.unblockUser(user.id, selectedUser.id);
      setBlockedUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setSuccessMessage(t('profile.blockedUsers.unblockSuccessMessage', { name: selectedUser.name }));
      setShowSuccessModal(true);
      setSelectedUser(null);
    } catch (error) {
      setModalMessage(t('profile.blockedUsers.unblockError'));
      setShowErrorModal(true);
    }
  };


  // Render skeleton item for loading state - matches FollowersScreen pattern
  const renderBlockedUserSkeleton = () => {
    return (
      <View style={styles.userItem}>
        <View style={styles.userProfile}>
          <Skeleton>
            <SkeletonItem width={50} height={50} borderRadius={25} />
          </Skeleton>
          <View style={styles.userInfo}>
            <Skeleton>
              <SkeletonItem width={120} height={16} borderRadius={4} />
            </Skeleton>
            <Skeleton>
              <SkeletonItem width={100} height={14} borderRadius={4} marginTop={4} />
            </Skeleton>
            <Skeleton>
              <SkeletonItem width={150} height={12} borderRadius={4} marginTop={4} />
            </Skeleton>
          </View>
        </View>
        <Skeleton>
          <SkeletonItem width={80} height={32} borderRadius={theme.borderRadius.md} />
        </Skeleton>
      </View>
    );
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser | 'skeleton' }) => {
    if (item === 'skeleton') {
      return renderBlockedUserSkeleton();
    }

    return (
      <View style={styles.userItem}>
        <TouchableOpacity 
          style={styles.userProfile}
          activeOpacity={0.7}
        >
          <Avatar
            uri={item.avatar}
            size={50}
            name={item.name}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.username} numberOfLines={1}>
              @{item.username}
            </Text>
            <Text style={styles.blockedDate}>
              {t('profile.blockedUsers.blockedDate', { date: item.blockedDate })}
            </Text>
          </View>
        </TouchableOpacity>

        <Button
          variant="secondary"
          size="sm"
          onPress={() => handleUnblockUser(item.id, item.name)}
          style={styles.unblockButton}
        >
          {t('profile.blockedUsers.unblockButton')}
        </Button>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('profile.blockedUsers.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
      />

      <ScreenContainer paddingVertical="none" paddingHorizontal="none">
        <View style={styles.content}>
          {loading ? (
            <FlatList
              data={Array(10).fill('skeleton')}
              renderItem={renderBlockedUser}
              keyExtractor={(_, index) => `skeleton-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.listContainer, theme.listContentStyle]}
              style={styles.list}
            />
          ) : blockedUsers.length === 0 ? (
            <EmptyState
              title={t('profile.blockedUsers.emptyStateTitle')}
              subtitle={t('profile.blockedUsers.emptyStateDescription')}
            />
          ) : (
            <FlatList
              data={blockedUsers}
              renderItem={renderBlockedUser}
              keyExtractor={item => typeof item === 'string' ? item : item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.listContainer, theme.listContentStyle]}
              style={styles.list}
            />
          )}
        </View>
      </ScreenContainer>

      <FishivoModal
        visible={showSuccessModal}
        title={t('common.success')}
        onClose={() => setShowSuccessModal(false)}
        preset="success"
        description={successMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowSuccessModal(false)
        }}
      />

      {/* Unblock Confirm Modal */}
      <FishivoModal
        visible={showUnblockModal}
        title={t('profile.blockedUsers.unblockConfirmTitle')}
        onClose={() => {
          setShowUnblockModal(false);
          setSelectedUser(null);
        }}
        preset="confirm"
        description={t('profile.blockedUsers.unblockConfirmMessage', { name: selectedUser?.name })}
        primaryButton={{
          text: t('profile.blockedUsers.unblockButton'),
          onPress: confirmUnblock
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => {
            setShowUnblockModal(false);
            setSelectedUser(null);
          }
        }}
      />

      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        preset="error"
        title={t('common.error')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowErrorModal(false)
        }}
      />

    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  list: {
    paddingHorizontal: theme.spacing.md,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontSize: theme.typography.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  username: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  blockedDate: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  unblockButton: {
    paddingVertical: theme.spacing.sm,
  },
});

export default BlockedUsersScreen; 