/**
 * Fishivo Mobile App
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStorageAdapter } from '@fishivo/shared';
import { AuthProvider } from './src/contexts';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  useEffect(() => {
    // ✅ Inject AsyncStorage adapter into shared package
    setStorageAdapter(AsyncStorage);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
