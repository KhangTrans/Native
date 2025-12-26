import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(Number(id));
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    Alert.alert(
      'Thêm vào giỏ hàng',
      `Đã thêm ${quantity} ${product.name} vào giỏ hàng`,
      [{ text: 'OK' }]
    );
  };

  const handleBuyNow = () => {
    if (!product) return;
    Alert.alert(
      'Mua ngay',
      `Mua ngay ${quantity} ${product.name}\nTổng: ${productService.formatPrice(parseInt(product.price) * quantity)}đ`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => console.log('Mua hàng') }
      ]
    );
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleChatWithShop = () => {
    if (!product) return;
    router.push({
      pathname: '/chat/[shopId]' as any,
      params: {
        shopId: product.user.id,
        shopName: product.user.fullName,
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee4d2d" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const priceNum = parseInt(product.price);
  const originalPrice = Math.floor(priceNum * 1.3); // Giả lập giá gốc cao hơn 30%
  const discount = Math.round(((originalPrice - priceNum) / originalPrice) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#ee4d2d', '#ff6a3d']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image Placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>
              {productService.getCategoryIcon(product.category.name)}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {/* Rating & Sold */}
          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingText}>4.8</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.soldText}>Đã bán {product.stock}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>
                ₫{productService.formatPrice(originalPrice)}
              </Text>
              <Text style={styles.currentPrice}>
                ₫{productService.formatPrice(priceNum)}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Info */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Danh mục</Text>
            <Text style={styles.sectionValue}>{product.category.name}</Text>
          </View>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Tình trạng</Text>
            <Text style={[styles.sectionValue, styles.stockText]}>
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Meta Info */}
        {product.metaDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin thêm</Text>
            <Text style={styles.metaText}>{product.metaDescription}</Text>
          </View>
        )}

        {/* Shop Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người bán</Text>
          <View style={styles.shopInfo}>
            <View style={styles.shopAvatar}>
              <Text style={styles.shopAvatarText}>
                {product.user.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.shopDetails}>
              <Text style={styles.shopName}>{product.user.fullName}</Text>
              <Text style={styles.shopUsername}>@{product.user.username}</Text>
            </View>
            <TouchableOpacity style={styles.chatButton} onPress={handleChatWithShop}>
              <Text style={styles.chatButtonText}>💬 Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Số lượng:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
              onPress={increaseQuantity}
              disabled={quantity >= product.stock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>🛒 Thêm vào giỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ee4d2d',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: '#fff',
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  placeholderIcon: {
    fontSize: 120,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#ddd',
    marginHorizontal: 12,
  },
  soldText: {
    fontSize: 14,
    color: '#666',
  },
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#666',
  },
  sectionValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  stockText: {
    color: '#ee4d2d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  metaText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ee4d2d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopAvatarText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  shopDetails: {
    flex: 1,
    marginLeft: 12,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  shopUsername: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  chatButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ee4d2d',
    borderRadius: 4,
  },
  chatButtonText: {
    fontSize: 14,
    color: '#ee4d2d',
    fontWeight: '500',
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 15,
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#333',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ee4d2d',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 15,
    color: '#ee4d2d',
    fontWeight: 'bold',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#ee4d2d',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
});
