
import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useCart } from '../contexts/CartContext';

export const CartScreen = () => {
  const { items, removeFromCart, clearCart } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderCartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text>{item.name} (x{item.quantity})</Text>
      <Text>{item.price * item.quantity} TL</Text>
      <Button title="Kaldır" onPress={() => removeFromCart(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sepet</Text>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Sepetiniz boş.</Text>}
      />
      <Text style={styles.total}>Toplam: {total} TL</Text>
      <Button title="Siparişi Tamamla" onPress={() => {
        alert('Siparişiniz alındı!');
        clearCart();
      }} />
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginVertical: 16,
  },
});
