import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FlashSaleProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  sold: number;
  image: string;
}

interface FlashSaleProps {
  products: FlashSaleProduct[];
  formatPrice: (price: number) => string;
}

export default function FlashSale({ products, formatPrice }: FlashSaleProps) {
  const handleProductPress = (productId: number) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId }
    });
  };

  return (
    <View style={styles.flashSaleSection}>
      <View style={styles.flashSaleHeader}>
        <View style={styles.flashSaleTitleContainer}>
          <Text style={styles.flashSaleTitle}>⚡ FLASH SALE</Text>
          <View style={styles.timer}>
            <Text style={styles.timerText}>Kết thúc sau</Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>02</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>45</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>30</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả ›</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flashSaleProducts}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.flashSaleCard}
            onPress={() => handleProductPress(product.id)}
            activeOpacity={0.7}
          >
            <View style={styles.flashSaleImageContainer}>
              <Text style={styles.flashSaleImage}>{product.image}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            </View>
            <Text style={styles.flashSalePrice}>₫{formatPrice(product.price)}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.soldText}>Đã bán {product.sold}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flashSaleSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flashSaleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flashSaleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    color: '#666',
    marginRight: 4,
  },
  timeBox: {
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeSeparator: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 13,
    color: '#ee4d2d',
  },
  flashSaleProducts: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  flashSaleCard: {
    width: 120,
    marginRight: 12,
  },
  flashSaleImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  flashSaleImage: {
    fontSize: 80,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ffeb3b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  flashSalePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ee4d2d',
    marginBottom: 8,
  },
  progressBar: {
    height: 16,
    backgroundColor: '#ffe0db',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ee4d2d',
  },
  soldText: {
    fontSize: 11,
    color: '#666',
  },
});
