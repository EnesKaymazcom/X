import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearLikeCache() {
  try {
    await AsyncStorage.removeItem('like-store');

  } catch (error) {
    console.error('Failed to clear like cache:', error);
  }
}
