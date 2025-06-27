
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '@repo/database';
import { useAuth } from '../contexts/AuthContext';

export const OrderHistoryScreen = () => {
  const { user } = useAuth();
  const userOrders = db.orders.filter((order) => order.userId === user.id);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderId}>Sipariş #{item.id}</Text>
      <Text>Tarih: {new Date(item.date).toLocaleDateString()}</Text>
      <Text>Tutar: {item.totalAmount} TL</Text>
      <Text>Durum: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sipariş Geçmişi</Text>
      <FlatList
        data={userOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Henüz siparişiniz bulunmuyor.</Text>}
      />
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
    marginBottom: 16,
  },
  orderContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
