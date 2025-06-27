
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import Toast from 'react-native-toast-message';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = () => {
    if (login(email, password)) {
      navigation.navigate('MainApp');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Geçersiz e-posta veya şifre',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>casacai</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor={theme.colors.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor={theme.colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
      <Button
        title="Hesabın yok mu? Kayıt Ol"
        color={theme.colors.primary}
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.large,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 48,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  input: {
    height: 50,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.spacing.small,
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
