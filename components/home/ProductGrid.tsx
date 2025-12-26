import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Product {
  id: number;
  name: string;
  price: number;
  sold: number;
  rating: number;
  image: string;
}

interface ProductGridProps {
  products: Product[];
  formatPrice: (price: number) => string;
}

export default function ProductGrid({ products, formatPrice }: ProductGridProps) {
  const handleProductPress = (productId: number) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId }
    });
  };

  return (
    <View style={styles.productsSection}>
      <Text style={styles.sectionTitle}>GỢI Ý HÔM NAY</Text>
      <View style={styles.productsGrid}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductPress(product.id)}
            activeOpacity={0.7}
          >
            <View style={styles.productImageContainer}>
              <Text style={styles.productImage}>{product.image}</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>₫{formatPrice(product.price)}</Text>
                <Text style={styles.productSold}>Đã bán {product.sold}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productsSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    fontSize: 60,
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
    height: 36,
  },
  productFooter: {
    flexDirection: 'column',
    gap: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  productSold: {
    fontSize: 11,
    color: '#999',
  },
});
