import { Platform } from 'react-native';

declare var __DEV__: boolean;

export function getWebUrl(): string {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return process.env.WEB_URL_ANDROID || 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      return process.env.WEB_URL_IOS || 'http://localhost:3000';
    }
  }
  
  return process.env.WEB_URL_DEFAULT || 'https://fishivo.com';
}