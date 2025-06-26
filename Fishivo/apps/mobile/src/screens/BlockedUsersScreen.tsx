import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  SuccessModal,
  AppHeader,
  ScreenContainer,
  ConfirmModal
} from '@fishivo/ui';
import { theme } from '@fishivo/shared';
import { apiService } from '@fishivo/shared';

interface BlockedUsersScreenProps {
  navigation: any;
}

interface BlockedUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  blockedDate: string;
}

const BlockedUsersScreen: React.FC<BlockedUsersScreenProps> = ({ navigation }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        setLoading(true);
        const response = await apiService.getBlockedUsers();
        
        // API response'u local format'a çevir
        const formattedUsers = response.items.map((item: any) => ({
          id: item.users.id,
          name: item.users.full_name || item.users.username,
          username: item.users.username,
          avatar: item.users.avatar_url,
          blockedDate: new Date(item.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        }));
        
        setBlockedUsers(formattedUsers);
      } catch (error) {
        console.error('Blocked users yüklenirken hata:', error);
        setBlockedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlockedUsers();
  }, []);

  const handleUnblockUser = (userId: string, userName: string) => {
    setSelectedUser({id: userId, name: userName});
    setShowUnblockConfirm(true);
  };

  const confirmUnblock = async () => {
    if (selectedUser) {
      try {
        await apiService.unblockUser(selectedUser.id);
        setBlockedUsers(prev => prev.filter(user => user.id !== selectedUser.id));
        setSuccessMessage(`${selectedUser.name} kullanıcısının engeli kaldırıldı`);
        setShowSuccessModal(true);
        setShowUnblockConfirm(false);
        setSelectedUser(null);
      } catch (error) {
        console.error('Engel kaldırma hatası:', error);
        Alert.alert('Hata', 'Engel kaldırılırken bir hata oluştu.');
      }
    }
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userItem}>
      <View style={styles.userLeft}>
        <View style={styles.avatar}>
          {item.avatar ? (
            <Text>📷</Text>
          ) : (
            <Text style={styles.avatarText}>👤</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
          <Text style={styles.blockedDate}>Engellendi: {item.blockedDate}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblockUser(item.id, item.name)}
      >
        <Text style={styles.unblockButtonText}>Engeli Kaldır</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Engellenen Kullanıcılar"
        canGoBack
        onBackPress={() => navigation.goBack()}
      />

      {blockedUsers.length === 0 ? (
        <ScreenContainer>
          <View style={styles.emptyState}>
            <Icon name="user-x" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Engellenen kullanıcı yok</Text>
            <Text style={styles.emptyStateDescription}>
              Henüz hiç kullanıcıyı engellemediniz. Engellediğiniz kullanıcılar burada görünecek.
            </Text>
          </View>
        </ScreenContainer>
      ) : (
        <ScreenContainer>
          <View style={styles.content}>
            <View style={styles.infoCard}>
              <Icon name="info" size={20} color={theme.colors.info} />
              <Text style={styles.infoText}>
                Engellediğiniz kullanıcılar size mesaj göndremez, sizi takip edemez ve gönderilerinizi göremez.
              </Text>
            </View>

            <FlatList
              data={blockedUsers}
              renderItem={renderBlockedUser}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        </ScreenContainer>
      )}

      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <ConfirmModal
        visible={showUnblockConfirm}
        title="Engeli Kaldır"
        message={`${selectedUser?.name} kullanıcısının engelini kaldırmak istediğinizden emin misiniz?`}
        onConfirm={confirmUnblock}
        onCancel={() => {
          setShowUnblockConfirm(false);
          setSelectedUser(null);
        }}
        confirmText="Engeli Kaldır"
        cancelText="İptal"
        type="warning"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
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
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  unblockButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.background,
    fontWeight: theme.typography.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BlockedUsersScreen;