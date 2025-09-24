import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * MobileStorage - AsyncStorage wrapper for React Native
 * Implements the storage interface required by @fishivo/api services
 */
export class MobileStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key)
    } catch (error) {
      // Error getting item
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (error) {
      // Error setting item
      throw error
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      // Error removing item
      throw error
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      const results = await AsyncStorage.multiGet(keys)
      return results as [string, string | null][]
    } catch (error) {
      // Error in multiGet
      return keys.map(key => [key, null])
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs)
    } catch (error) {
      // Error in multiSet
      throw error
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys)
    } catch (error) {
      // Error in multiRemove
      throw error
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly to mutable array
    } catch (error) {
      // Error getting all keys
      return []
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      // Error clearing storage
      throw error
    }
  }
}