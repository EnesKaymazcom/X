import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';

export interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  description?: string;
  is_read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

class NotificationsServiceNative {
  async getNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    try {
      const supabase = getNativeSupabaseClient();
      
      // Use RPC function with block filter for better security and performance
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('get_notifications_with_block_filter', {
          p_user_id: userId,
          p_limit: limit,
          p_offset: offset
        });

      if (!rpcError && rpcResult) {
        return rpcResult.map((notification: any) => ({
          id: notification.id,
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          description: notification.description,
          is_read: notification.is_read,
          data: {
            ...notification.data,
            // Add actor info for UI display
            actor_username: notification.actor_username,
            actor_full_name: notification.actor_full_name,
            actor_avatar_url: notification.actor_avatar_url
          },
          created_at: notification.created_at,
          updated_at: notification.updated_at
        }));
      }

      // Fallback to regular query without block filtering
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const supabase = getNativeSupabaseClient();
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const supabase = getNativeSupabaseClient();
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const supabase = getNativeSupabaseClient();
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const supabase = getNativeSupabaseClient();
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  // Check if users are blocked (helper method for notification creation)
  async areUsersBlocked(userId1: string, userId2: string): Promise<boolean> {
    try {
      const supabase = getNativeSupabaseClient();
      
      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .or(`and(blocker_id.eq.${userId1},blocked_id.eq.${userId2}),and(blocker_id.eq.${userId2},blocked_id.eq.${userId1})`)
        .limit(1);

      if (error) {
        console.error('Error checking block status:', error);
        return false;
      }

      return (data && data.length > 0);
    } catch (error) {
      console.error('Error in areUsersBlocked:', error);
      return false;
    }
  }

  // Create notification with block check
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>, actorUserId?: string): Promise<boolean> {
    try {
      // Block check if actor is provided
      if (actorUserId && notification.user_id !== actorUserId) {
        const areBlocked = await this.areUsersBlocked(notification.user_id, actorUserId);
        if (areBlocked) {
          return false;
        }
      }

      const supabase = getNativeSupabaseClient();
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          data: {
            ...notification.data,
            actor_user_id: actorUserId
          }
        });

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return false;
    }
  }
}

export const notificationsServiceNative = new NotificationsServiceNative();