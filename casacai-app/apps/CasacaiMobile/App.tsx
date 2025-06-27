import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';
import Toast from 'react-native-toast-message';

function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
          <Toast />
        </CartProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}

export default App;
