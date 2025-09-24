import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, DefaultAvatar, ProBadge, AppHeader, ScreenContainer, EmptyState } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

const apiService = createNativeApiService();

// Zaman formatlama fonksiyonu dışarıya taşındı component içinde kullanılacak

interface NotificationsScreenProps {
  navigation: any;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post' | 'system' | 'catch' | 'location';
  user?: {
    id: string;
    name: string;
    avatar?: string;
    isPro?: boolean;
  };
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  image?: string;
  actionData?: any;
}

// Removed mock data - notifications now loaded from database

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useSupabaseUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const styles = createStyles(theme);

  // Zaman formatlama fonksiyonu
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('time.now');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('time.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('time.hoursAgo', { count: hours });
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return t('time.daysAgo', { count: days });
    } else {
      return date.toLocaleDateString(t('time.locale'));
    }
  };

  const filterOptions = [
    { id: 'all', label: t('notifications.filters.all'), count: notifications.length },
    { id: 'unread', label: t('notifications.filters.unread'), count: notifications.filter(n => !n.isRead).length },
    { id: 'social', label: t('notifications.filters.social'), count: notifications.filter(n => ['like', 'comment', 'follow'].includes(n.type)).length },
    { id: 'system', label: t('notifications.filters.system'), count: notifications.filter(n => ['system', 'location'].includes(n.type)).length },
  ];

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'social':
        return notifications.filter(n => ['like', 'comment', 'follow', 'post', 'catch'].includes(n.type));
      case 'system':
        return notifications.filter(n => ['system', 'location'].includes(n.type));
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return 'heart';
      case 'comment': return 'message-circle';
      case 'follow': return 'user-plus';
      case 'post': return 'camera';
      case 'system': return 'bell';
      case 'catch': return 'fish';
      case 'location': return 'map-pin';
      default: return 'bell';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'like': return '#EF4444';
      case 'comment': return '#3B82F6';
      case 'follow': return '#10B981';
      case 'post': return '#8B5CF6';
      case 'system': return '#F59E0B';
      case 'catch': return '#06B6D4';
      case 'location': return '#EF4444';
      default: return theme.colors.textSecondary;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      if (user) {
        const dbNotifications = await apiService.notifications.getNotifications(user.id);
        // Transform database notifications to component format
        const transformedNotifications = dbNotifications.map(notif => ({
          id: notif.id.toString(),
          type: notif.type,
          title: notif.title,
          description: notif.description || '',
          time: formatTimeAgo(notif.created_at),
          isRead: notif.is_read,
          user: notif.data?.user,
          image: notif.data?.image,
          actionData: notif.data
        }));
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Removed old mock refresh function - using real API refresh above

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'post':
        // Navigate to post detail

        break;
      case 'follow':
        // Navigate to user profile

        break;
      case 'catch':
        // Navigate to catch detail

        break;
      case 'location':
        // Navigate to map
        navigation.navigate('Map');
        break;
      default:
        break;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const translateX = new Animated.Value(0);
    const screenWidth = Dimensions.get('window').width;

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) { // Sola kaydırma
          translateX.setValue(Math.max(gestureState.dx, -100));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -100) {
          // Çok sola kaydırılmışsa sil
          Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            deleteNotification(item.id);
          });
        } else if (gestureState.dx < -50) {
          // Biraz sola kaydırılmışsa sil butonunu göster
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else {
          // Geri döndür
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    return (
      <View style={styles.swipeContainer}>
        {/* Delete Button (Behind) */}
        <View style={styles.deleteBackground}>
          <Icon name="trash-2" size={24} color="#FFFFFF" />
        </View>

        {/* Notification Item */}
        <Animated.View
          style={[
            { transform: [{ translateX }] },
            styles.animatedNotification
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.notificationLeft}>
              {item.user ? (
                <DefaultAvatar name={item.user.name} size={48} />
              ) : (
                <View style={[styles.systemIcon, { backgroundColor: getNotificationIconColor(item.type) + '20' }]}>
                  <Icon 
                    name={getNotificationIcon(item.type)} 
                    size={24} 
                    color={getNotificationIconColor(item.type)} 
                  />
                </View>
              )}
              
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <View style={styles.titleRow}>
                  {item.user && (
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{item.user.name}</Text>
                      {item.user.isPro && <ProBadge variant="icon" size="sm" />}
                    </View>
                  )}
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                </View>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
              
              {item.description && (
                <Text style={styles.notificationDescription}>{item.description}</Text>
              )}
            </View>

            {item.image && (
              <View style={styles.notificationImage}>
                <Text style={styles.imageEmoji}>{item.image}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <AppHeader
          title={t('notifications.title')}
          leftButtons={[
            {
              icon: 'arrow-left',
              onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
            }
          ]}
        />
        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllRead}>{t('notifications.markAllRead')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterTab, activeFilter === filter.id && styles.activeFilterTab]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[styles.filterText, activeFilter === filter.id && styles.activeFilterText]}>
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <View style={[styles.filterBadge, activeFilter === filter.id && styles.activeFilterBadge]}>
                  <Text style={[styles.filterBadgeText, activeFilter === filter.id && styles.activeFilterBadgeText]}>
                    {filter.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScreenContainer paddingVertical="none">
        <FlatList
          data={getFilteredNotifications()}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[styles.listContainer, theme.listContentStyle]}
          ListEmptyComponent={
            <EmptyState
              title={t('notifications.empty.title')}
              subtitle={t('notifications.empty.subtitle')}
            />
          }
        />
      </ScreenContainer>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    position: 'relative',
  },
  markAllButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: '50%',
    transform: [{ translateY: -10 }],
    justifyContent: 'center',
    alignItems: 'center',
  },

  markAllRead: {
    fontSize: theme.typography.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  activeFilterText: {
    color: 'white',
  },
  filterBadge: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.semibold,
  },
  activeFilterBadgeText: {
    color: 'white',
  },
  listContainer: {
    paddingVertical: theme.spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  swipeContainer: {
    position: 'relative',
    backgroundColor: theme.colors.background,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedNotification: {
    backgroundColor: theme.colors.background,
  },
  unreadItem: {
    backgroundColor: theme.colors.surface,
  },
  notificationLeft: {
    position: 'relative',
  },
  systemIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleRow: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: 2,
  },
  userName: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  notificationTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  notificationTime: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  notificationDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  notificationImage: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: {
    fontSize: 20,
  },
});

export default NotificationsScreen; 