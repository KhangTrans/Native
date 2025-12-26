import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/config/api';
import { LoginResponse, RegisterResponse, User } from '@/types/auth';

const API_BASE_URL = `${API_CONFIG.REST_URL}/api`;

class AuthService {
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save token and user info
    if (data.success && data.data) {
      await this.saveAuthData(data.data.token, data.data.user);
    }

    return data;
  }

  // Register
  async register(
    username: string,
    email: string,
    password: string,
    fullName: string
  ): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, fullName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save token and user info if registration includes login
    if (data.success && data.data) {
      await this.saveAuthData(data.data.token, data.data.user);
    }

    return data;
  }

  // Save auth data to AsyncStorage
  private async saveAuthData(token: string, user: User): Promise<void> {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  // Get stored user data
  async getUserData(): Promise<User | null> {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is logged in
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }

  // Clear all auth data
  async clearAuthData(): Promise<void> {
    await this.logout();
  }
}

export const authService = new AuthService();
