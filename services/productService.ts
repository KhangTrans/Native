import { API_CONFIG } from '@/config/api';
import { Product, ProductsResponse } from '@/types/product';

const API_BASE_URL = `${API_CONFIG.REST_URL}/api`;

class ProductService {
  // Get all products
  async getProducts(page: number = 1, limit: number = 20): Promise<ProductsResponse> {
    const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    return data;
  }

  // Get product by ID
  async getProductById(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch product');
    }

    return data.data;
  }

  // Get product by slug
  async getProductBySlug(slug: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch product');
    }

    return data.data;
  }

  // Format price to VND
  formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Get category icon
  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'Điện thoại': '📱',
      'Laptop': '💻',
      'Tablet': '📲',
      'Đồng hồ': '⌚',
      'Phụ kiện': '🎧',
      'TV': '📺',
      'Máy ảnh': '📷',
      'Gaming': '🎮',
    };
    return icons[categoryName] || '📦';
  }
}

export const productService = new ProductService();
