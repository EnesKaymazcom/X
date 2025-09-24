import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheService } from './types';

export class NativeCacheService implements CacheService {
  async get(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(key);
      if (!data) return null;
      
      const item = JSON.parse(data);
      
      // Expiry kontrolü
      if (item.expiry && Date.now() > item.expiry) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      const item = {
        value,
        expiry: Date.now() + (ttlSeconds * 1000)
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}