import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { StatusBar, LogBox, Linking, Platform, ViewStyle } from 'react-native';
import { request, PERMISSIONS } from 'react-native-permissions';

// AsyncStorage polyfill for Supabase
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global AsyncStorage için polyfill
if (typeof global !== 'undefined') {
  (global as any).AsyncStorage = AsyncStorage;
}
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalProvider } from '@gorhom/portal';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { initI18n } from '@/lib/i18n/i18n';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
// import { UnitsProvider } from './contexts/UnitsProvider';
// import { AuthProvider } from './contexts/AuthProvider';
// import { LocationProvider } from './contexts/LocationProvider';
// import { setStorage, supabase } from '@fishivo/api';

// Development logging removed for production
import { AppNavigator } from '@/navigation';
import { useFollowStore } from '@/stores/followStore';
import { initializeCache } from '@/utils/cache-initialization';
// import { MobileStorage } from './storage/MobileStorage';

// Ignore development warnings
LogBox.ignoreLogs([
  '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method',
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Sending `onAnimatedValueUpdate`',
  'Require cycle:',
  'Possible Unhandled Promise Rejection',
  'Error.stack getter called with an invalid receiver',
  'TypeError: Error.stack getter called with an invalid receiver'
]);

// Error Boundary kaldırıldı

/**
 * Navigation linking configuration
 * Handles both deep links and OAuth callbacks
 */
const linking = {
  prefixes: ['fishivo://', 'https://fishivo.com', 'http://fishivo.com'],
  config: {
    screens: {
      Auth: 'auth',
      ResetPassword: 'auth/reset-password',
      MainTabs: 'main',
      PostDetail: 'post/:id',
      UserProfile: 'user/:id',
      EditProfile: 'edit-profile',
      Settings: 'settings',
    },
  },
  
  // Handle initial URL when app is opened via deep link
  async getInitialURL() {
    try {
      const url = await Linking.getInitialURL();
      if (url) {
        // Initial URL received
        await handleDeepLink(url);
      }
      return url;
    } catch (error) {
      // Error getting initial URL
      return null;
    }
  },
  
  // Subscribe to URL changes while app is running
  subscribe(listener: (url: string) => void) {
    const linkingSubscription = Linking.addEventListener('url', async ({ url }) => {
      // Runtime deep link received
      await handleDeepLink(url);
      listener(url);
    });

    return () => {
      linkingSubscription.remove();
    };
  },
};

/**
 * Enhanced deep link handler for OAuth callbacks
 * Following Supabase documentation best practices
 */
const handleDeepLink = async (url: string) => {
  // Deep link received
  
  // Handle password reset URLs
  if (url.includes('auth/reset-password')) {
    // Processing password reset link
    
    try {
      const urlObj = new URL(url.replace('fishivo://', 'https://fishivo.com/'));
      
      // Extract tokens from URL
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      
      // Check fragments first
      if (urlObj.hash) {
        const hashParams = new URLSearchParams(urlObj.hash.substring(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
      }
      
      // Fallback to query parameters
      if (!accessToken) {
        accessToken = urlObj.searchParams.get('access_token');
        refreshToken = urlObj.searchParams.get('refresh_token');
      }
      
      if (accessToken && refreshToken) {
        // Reset password tokens found
        // Navigation will be handled by the linking configuration
        // The tokens will be passed as route params
      }
    } catch (error) {
      // Password reset processing failed
    }
    return;
  }
  
  // Handle OAuth callback URLs
  if (url.includes('auth/callback')) {
    // Processing OAuth callback
    
    try {
      const supabase = getNativeSupabaseClient();
      
      // Parse URL to extract tokens - more reliable approach
      const urlObj = new URL(url.replace('fishivo://', 'https://fishivo.com/'));

      // Önce PKCE code parametresi var mı kontrol et
      const code = urlObj.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          // Session kuruldu
        } else {
          // Hata durumu sessiz geçilir; UI tarafı zaten yönetecek
        }
        return;
      }
      
      // Check for tokens in URL fragments or query params
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      
      // Try fragments first (OAuth 2.0 implicit flow)
      if (urlObj.hash) {
        const hashParams = new URLSearchParams(urlObj.hash.substring(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
      }
      
      // Fallback to query parameters
      if (!accessToken) {
        accessToken = urlObj.searchParams.get('access_token');
        refreshToken = urlObj.searchParams.get('refresh_token');
      }
      
      if (accessToken) {
        // Tokens found in URL
        
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
      } else {
        // No tokens found in OAuth callback URL
      }
      
    } catch (error) {
      // OAuth callback processing failed
    }
  }
};

const AppContent: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigationRef = React.useRef<any>(null);

  return (
      <NavigationContainer 
        ref={navigationRef}
        linking={linking}
        theme={{
          dark: isDark,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.error,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: 'normal',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System', 
              fontWeight: 'bold',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <AppNavigator navigationRef={navigationRef} />
      </NavigationContainer>
  );
};

const rootViewStyle: ViewStyle = { flex: 1, width: '100%', height: '100%' };

const App: React.FC = () => {
  // Initialize i18n immediately
  initI18n();

  useEffect(() => {
    // Initialize cache system and global stores
    const initializeApp = async () => {
      try {
        // Initialize cache system first
        await initializeCache({
          enableRealtime: true,
          enableMetrics: __DEV__,
          enableBackgroundSync: true,
          logLevel: __DEV__ ? 'verbose' : 'basic'
        });
        
        // Initialize follow store
        useFollowStore.getState().initialize();
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };
    
    // Request location permission on app start
    const requestLocationPermission = async () => {
      try {
        const permission = Platform.OS === 'ios' 
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        
        await request(permission);
        // Don't care about the result, just request it
      } catch (error) {
        // Ignore errors
      }
    };
    
    initializeApp();
    requestLocationPermission();
  }, []);

  return (
    <GestureHandlerRootView style={rootViewStyle}>
      <PortalProvider>
        <SafeAreaProvider style={rootViewStyle}>
          <ThemeProvider>
            <LanguageProvider>
              <AppContent />
            </LanguageProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
};

export default App;
