
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Lütfen giriş yapın.</Text>
        <Button title="Giriş Yap" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.label}>Ad Soyad:</Text>
      <Text style={styles.value}>{user.name}</Text>
      <Text style={styles.label}>E-posta:</Text>
      <Text style={styles.value}>{user.email}</Text>
      <Text style={styles.label}>Sadakat Puanı:</Text>
      <Text style={styles.value}>{user.loyaltyPoints} ✨</Text>
      <Button title="Sipariş Geçmişi" onPress={() => navigation.navigate('OrderHistory')} />
      <Button title="Çıkış Yap" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
});
