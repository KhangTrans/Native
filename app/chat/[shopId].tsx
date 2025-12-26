import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socketService';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@/types/chat';

export default function ChatScreen() {
  const { shopId, shopName } = useLocalSearchParams<{
    shopId: string;
    shopName: string;
  }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  const roomId = `shop-${shopId}`;

  useEffect(() => {
    initChat();
    
    return () => {
      // Cleanup
      socketService.leaveRoom(roomId);
      socketService.unsubscribeFromMessages();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initChat = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      }

      // Connect socket if not connected
      const token = await AsyncStorage.getItem('token');
      if (!socketService.isConnected()) {
        socketService.connect(token || undefined);
      }

      // Join room
      socketService.joinRoom(roomId);

      // Subscribe to messages
      socketService.subscribeToMessages((messageData) => {
        const newMessage: Message = {
          id: messageData.id || Date.now().toString(),
          roomId: messageData.roomId,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          message: messageData.message,
          timestamp: messageData.timestamp || new Date().toISOString(),
          read: false,
        };
        
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      });

      // Load chat history from API
      await loadChatHistory();
      
      // Mark messages as read (don't block if fails)
      try {
        await chatService.markAsRead(parseInt(shopId));
      } catch (markReadError) {
        console.log('Could not mark as read:', markReadError);
      }
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Don't show alert, just log - user can still send messages
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      console.log('Loading chat history for shopId:', shopId);
      
      // Try to load from AsyncStorage cache first
      const cacheKey = `chat_history_${shopId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        console.log('Found cached chat history');
        const cached = JSON.parse(cachedData);
        setMessages(cached.messages);
        setTimeout(scrollToBottom, 100);
        // Continue to fetch fresh data in background
      }
      
      // Fetch fresh data from API
      const history = await chatService.getConversationHistory(parseInt(shopId));
      console.log('Received history:', JSON.stringify(history, null, 2));
      
      // Check if messages exist
      if (!history || !history.messages || !Array.isArray(history.messages)) {
        console.log('No messages found or invalid format, using cached or empty array');
        if (!cachedData) {
          setMessages([]);
        }
        return;
      }
      
      console.log('Found', history.messages.length, 'messages');
      
      // Convert API messages to app format
      const formattedMessages: Message[] = history.messages.map(msg => ({
        id: msg.id.toString(),
        roomId,
        senderId: msg.senderId,
        senderName: msg.sender?.fullName || 'Unknown',
        message: msg.message,
        timestamp: msg.createdAt,
        read: msg.read,
      }));
      
      console.log('Formatted messages:', formattedMessages.length);
      setMessages(formattedMessages);
      
      // Cache the data
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        messages: formattedMessages,
        timestamp: Date.now()
      }));
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading chat history:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Try to use cache if API fails
      const cacheKey = `chat_history_${shopId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        console.log('Using cached data due to API error');
        const cached = JSON.parse(cachedData);
        setMessages(cached.messages);
      } else {
        setMessages([]);
      }
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    const messageText = inputMessage.trim();
    setInputMessage(''); // Clear input immediately for better UX
    
    try {
      // Add to local state immediately (optimistic update)
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        roomId,
        senderId: currentUserId || 0,
        senderName: 'Bạn',
        message: messageText,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();
      
      // Update cache
      const cacheKey = `chat_history_${shopId}`;
      const updatedMessages = [...messages, tempMessage];
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        messages: updatedMessages,
        timestamp: Date.now()
      }));
      
      // Send via socket for real-time
      socketService.sendMessage(roomId, messageText);
      
      // Also save to database via API (fallback)
      try {
        await chatService.sendMessage(parseInt(shopId), messageText);
      } catch (apiError) {
        console.error('Failed to save message to DB:', apiError);
        // Message still sent via socket, just not persisted
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
      setInputMessage(messageText); // Restore input
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        {!isMyMessage && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.theirMessageTime
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee4d2d" />
        <Text style={styles.loadingText}>Đang tải chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <LinearGradient colors={['#ee4d2d', '#ff6a3d']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {shopName?.charAt(0).toUpperCase() || 'S'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{shopName || 'Shop'}</Text>
            <Text style={styles.headerStatus}>
              {socketService.isConnected() ? '● Đang hoạt động' : '○ Offline'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋯</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Text style={styles.attachIcon}>📎</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!inputMessage.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 18,
    color: '#ee4d2d',
    fontWeight: 'bold',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 12,
    color: '#ffe',
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
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
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ee4d2d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#ee4d2d',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#ffe',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ee4d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendIcon: {
    fontSize: 18,
    color: '#fff',
  },
});
