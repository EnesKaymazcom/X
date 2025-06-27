
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { db } from '@repo/database';

export const HomeScreen = ({ navigation }) => {
  // Rastgele 3 ürünü öne çıkan olarak seçelim
  const featuredProducts = db.products.sort(() => 0.5 - Math.random()).slice(0, 3);

  const renderFeaturedProduct = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product: item })}>
      <View style={styles.featuredProductContainer}>
        <Image source={{ uri: item.image }} style={styles.featuredProductImage} />
        <Text style={styles.featuredProductName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Öne Çıkanlar</Text>
      <FlatList
        data={featuredProducts}
        renderItem={renderFeaturedProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
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
  featuredProductContainer: {
    marginRight: 16,
  },
  featuredProductImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  featuredProductName: {
    marginTop: 8,
    textAlign: 'center',
  },
});
