import Banner from '@/components/home/Banner';
import Categories from '@/components/home/Categories';
import FlashSale from '@/components/home/FlashSale';
import ProductGrid from '@/components/home/ProductGrid';
import SearchBar from '@/components/home/SearchBar';
import { authService } from '@/services/authService';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; title: string; icon: string }[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserData(),
        loadProducts(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      await authService.getUserData();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('Fetching products from API...');
      const response = await productService.getProducts(1, 20);
      console.log('API Response:', response);
      console.log('Products count:', response.data.length);
      
      setProducts(response.data);
      
      // Extract unique categories from products
      const uniqueCategories = response.data.reduce((acc: { id: number; title: string; icon: string }[], product) => {
        if (!acc.find(cat => cat.id === product.category.id)) {
          acc.push({
            id: product.category.id,
            title: product.category.name,
            icon: productService.getCategoryIcon(product.category.name),
          });
        }
        return acc;
      }, []);
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Lỗi', `Không thể tải sản phẩm: ${error}`);
      // Set default categories if API fails
      setCategories([
        { id: 1, title: 'Điện thoại', icon: '📱' },
        { id: 2, title: 'Laptop', icon: '💻' },
        { id: 3, title: 'Thời trang', icon: '👔' },
        { id: 4, title: 'Thể thao', icon: '⚽' },
        { id: 5, title: 'Ô tô', icon: '🚗' },
        { id: 6, title: 'Mẹ & Bé', icon: '👶' },
        { id: 7, title: 'Nhà cửa', icon: '🏠' },
        { id: 8, title: 'Sắc đẹp', icon: '💄' },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      Alert.alert('Tìm kiếm', `Tìm kiếm: ${searchQuery}`);
    }
  };

  const handleCart = () => {
    Alert.alert('Giỏ hàng', `Bạn có ${cartCount} sản phẩm trong giỏ hàng`);
  };

  // Format products for ProductGrid component
  const formatProductsForGrid = (apiProducts: Product[]) => {
    return apiProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: parseInt(product.price),
      sold: product.stock, // Using stock as sold count
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      image: productService.getCategoryIcon(product.category.name),
    }));
  };

  // Format products for Flash Sale (first 3 products with discount)
  const formatFlashSaleProducts = (apiProducts: Product[]) => {
    return apiProducts.slice(0, 3).map(product => {
      const price = parseInt(product.price);
      const discount = 30 + Math.floor(Math.random() * 40); // Random discount 30-70%
      const originalPrice = Math.floor(price / (1 - discount / 100));
      return {
        id: product.id,
        name: product.name,
        price,
        originalPrice,
        discount,
        sold: Math.floor(Math.random() * 300) + 50, // Random sold count
        image: productService.getCategoryIcon(product.category.name),
      };
    });
  };

  const formatPrice = (price: number) => {
    return productService.formatPrice(price);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#ee4d2d', '#ff6a3d']} style={styles.header}>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            cartCount={cartCount}
            onCartPress={handleCart}
          />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ee4d2d" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with gradient - Shopee style */}
      <LinearGradient colors={['#ee4d2d', '#ff6a3d']} style={styles.header}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          cartCount={cartCount}
          onCartPress={handleCart}
        />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Banner />
        <Categories categories={categories} />
        {products.length > 0 ? (
          <>
            <FlashSale products={formatFlashSaleProducts(products)} formatPrice={formatPrice} />
            <ProductGrid products={formatProductsForGrid(products)} formatPrice={formatPrice} />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📦</Text>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm</Text>
            <Text style={styles.emptySubtitle}>Kéo xuống để làm mới</Text>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ee4d2d',
  },
  logoutText: {
    fontSize: 16,
    color: '#ee4d2d',
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
});