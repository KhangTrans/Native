import { API_CONFIG } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Conversation {
  userId: number;
  username: string;
  fullName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    fullName: string;
  };
}

export interface ConversationHistory {
  userId: number;
  username: string;
  fullName: string;
  messages: ChatMessage[];
}

class ChatService {
  private async getAuthHeader() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get list of conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_CONFIG.REST_URL}/api/messages/conversations`, {
      method: 'GET',
      headers: await this.getAuthHeader(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch conversations');
    }

    return data.data || [];
  }

  // Get chat history with specific user
  async getConversationHistory(userId: number): Promise<ConversationHistory> {
    const response = await fetch(
      `${API_CONFIG.REST_URL}/api/messages/conversation/${userId}`,
      {
        method: 'GET',
        headers: await this.getAuthHeader(),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch conversation history');
    }

    return data.data;
  }

  // Send message (HTTP fallback)
  async sendMessage(receiverId: number, message: string): Promise<ChatMessage> {
    const response = await fetch(`${API_CONFIG.REST_URL}/api/messages`, {
      method: 'POST',
      headers: await this.getAuthHeader(),
      body: JSON.stringify({ receiverId, message }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send message');
    }

    return data.data;
  }

  // Mark messages as read
  async markAsRead(senderId: number): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.REST_URL}/api/messages/read/${senderId}`,
      {
        method: 'PUT',
        headers: await this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to mark as read');
    }
  }

  // Get unread message count
  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${API_CONFIG.REST_URL}/api/messages/unread-count`, {
      method: 'GET',
      headers: await this.getAuthHeader(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch unread count');
    }

    return data.data?.unreadCount || 0;
  }

  // Get list of users that can be chatted with
  async getChatUsers(): Promise<any[]> {
    const response = await fetch(`${API_CONFIG.REST_URL}/api/messages/users`, {
      method: 'GET',
      headers: await this.getAuthHeader(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch chat users');
    }

    return data.data || [];
  }
}

export const chatService = new ChatService();
