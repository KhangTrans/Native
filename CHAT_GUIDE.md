# HƯỚNG DẪN TÍNH NĂNG CHAT VỚI SHOP

## 📱 Màn hình Chat

### Vị trí File
- `app/chat/[shopId].tsx` - Màn hình chat chính
- `types/chat.ts` - Type definitions cho chat
- `services/socketService.ts` - Quản lý Socket.IO connection

---

## 🎯 Chức năng

### 1. Vào Chat từ Product Detail
```
User xem chi tiết sản phẩm
    ↓
Nhấn nút "💬 Chat" trong "Thông tin người bán"
    ↓
Navigate đến màn hình chat với shop
    ↓
app/chat/[shopId].tsx (params: shopId, shopName)
```

### 2. Khởi tạo Chat
```typescript
useEffect(() => {
  // 1. Get current user từ AsyncStorage
  const user = await AsyncStorage.getItem('user');
  setCurrentUserId(user.id);

  // 2. Connect socket nếu chưa connected
  const token = await AsyncStorage.getItem('token');
  socketService.connect(token);

  // 3. Join room
  const roomId = `shop-${shopId}`;
  socketService.joinRoom(roomId);

  // 4. Subscribe to messages
  socketService.subscribeToMessages((messageData) => {
    // Add message to state
    setMessages(prev => [...prev, newMessage]);
  });

  // 5. Load chat history
  loadChatHistory(); // Mock data hiện tại
}, []);
```

### 3. Gửi tin nhắn
```typescript
const handleSendMessage = () => {
  // 1. Validate input
  if (!inputMessage.trim()) return;

  // 2. Send via socket
  socketService.sendMessage(roomId, inputMessage);

  // 3. Optimistic update (add to UI immediately)
  const newMessage = {
    id: Date.now().toString(),
    roomId,
    senderId: currentUserId,
    senderName: 'Bạn',
    message: inputMessage,
    timestamp: new Date().toISOString(),
  };
  setMessages(prev => [...prev, newMessage]);

  // 4. Clear input
  setInputMessage('');
};
```

### 4. Nhận tin nhắn real-time
```typescript
socketService.subscribeToMessages((messageData) => {
  const newMessage = {
    id: messageData.id,
    roomId: messageData.roomId,
    senderId: messageData.senderId,
    senderName: messageData.senderName,
    message: messageData.message,
    timestamp: messageData.timestamp,
  };
  
  setMessages(prev => [...prev, newMessage]);
  scrollToBottom(); // Auto scroll to latest message
});
```

---

## 🎨 UI Components

### Header
```
┌─────────────────────────────────────┐
│  ←  [Avatar] Shop Name         ⋯   │
│              ● Đang hoạt động       │
└─────────────────────────────────────┘
```

- Back button: Quay lại product detail
- Shop avatar: Chữ cái đầu của shop name
- Shop name: Tên người bán
- Status: Online/Offline (dựa vào socket connection)
- Menu button: Thêm tính năng (báo cáo, block, etc.)

### Messages List
```
┌─────────────────────────────────────┐
│  [A] Shop message                   │
│      Bubble màu trắng               │
│      Timestamp                      │
│                                     │
│                  My message [Avatar]│
│                  Bubble màu cam     │
│                  Timestamp          │
└─────────────────────────────────────┘
```

**Tin nhắn của shop (bên trái):**
- Avatar: Chữ cái đầu
- Bubble: Màu trắng (#fff)
- Text: Màu đen (#333)
- Time: Màu xám (#999)

**Tin nhắn của mình (bên phải):**
- Bubble: Màu cam Shopee (#ee4d2d)
- Text: Màu trắng (#fff)
- Time: Màu trắng nhạt (#ffe)

### Input Area
```
┌─────────────────────────────────────┐
│  📎  [Input box...]           ➤     │
└─────────────────────────────────────┘
```

- Attach button (📎): Đính kèm file/hình ảnh (chưa implement)
- Text input: Multi-line, max 500 characters
- Send button (➤): Active khi có text, disabled khi rỗng

---

## 🔄 Socket Events

### Emit (Client → Server)
```typescript
// Join room
socket.emit('room:join', { roomId: 'shop-123' });

// Leave room
socket.emit('room:leave', { roomId: 'shop-123' });

// Send message
socket.emit('message:send', { 
  roomId: 'shop-123', 
  message: 'Hello!' 
});
```

### Listen (Server → Client)
```typescript
// Receive message
socket.on('message:receive', (data) => {
  // {
  //   id: '12345',
  //   roomId: 'shop-123',
  //   senderId: 1,
  //   senderName: 'Admin',
  //   message: 'Hi!',
  //   timestamp: '2025-12-26T...'
  // }
});
```

---

## 💾 Data Structures

### Message Interface
```typescript
interface Message {
  id: string;              // Unique message ID
  roomId: string;          // Format: 'shop-{shopId}'
  senderId: number;        // User ID của người gửi
  senderName: string;      // Tên người gửi
  message: string;         // Nội dung tin nhắn
  timestamp: string;       // ISO date string
  read: boolean;           // Đã đọc chưa
}
```

### Chat Room Interface
```typescript
interface ChatRoom {
  id: string;              // Room ID
  shopId: number;          // Shop ID
  shopName: string;        // Tên shop
  userId: number;          // User ID của khách hàng
  lastMessage?: string;    // Tin nhắn cuối
  lastMessageTime?: string;// Thời gian tin nhắn cuối
  unreadCount: number;     // Số tin chưa đọc
}
```

---

## ⏰ Time Format

```typescript
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
```

**Output:**
- "Vừa xong" - Dưới 1 phút
- "5 phút trước" - 1-59 phút
- "2 giờ trước" - 1-23 giờ
- "26/12 14:30" - Hơn 24 giờ

---

## 🔐 Authentication

```typescript
// Khi connect socket, cần token
const token = await AsyncStorage.getItem('token');
socketService.connect(token);

// Token được gửi trong auth header
socket.io({
  auth: { token },
  transports: ['websocket', 'polling']
});
```

**Backend cần verify token để:**
- Xác định user gửi tin
- Join đúng room
- Prevent spam/abuse

---

## 📱 Responsive Features

### KeyboardAvoidingView
```typescript
<KeyboardAvoidingView 
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={0}
>
```

- iOS: Padding để tránh keyboard
- Android: Height adjustment
- Input luôn visible khi keyboard mở

### Auto Scroll
```typescript
// Scroll to bottom khi:
// 1. Load chat history
// 2. Receive new message
// 3. Send message

const scrollToBottom = () => {
  flatListRef.current?.scrollToEnd({ animated: true });
};
```

---

## ⚡ Performance Optimization

### 1. Message List
```typescript
<FlatList
  data={messages}
  renderItem={renderMessage}
  keyExtractor={(item) => item.id}
  // Performance props
  initialNumToRender={20}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

### 2. Optimistic Updates
- Add message to UI ngay lập tức
- Không chờ server response
- Better UX, faster feeling

### 3. Socket Connection
- Reuse connection (singleton pattern)
- Auto-reconnect on disconnect
- Cleanup on unmount

---

## 🚀 Future Enhancements

### 1. Chat History từ Backend
```typescript
const loadChatHistory = async () => {
  const response = await fetch(
    `${API_CONFIG.REST_URL}/api/messages/${roomId}?limit=50`
  );
  const data = await response.json();
  setMessages(data.messages);
};
```

### 2. File/Image Upload
```typescript
const handleAttach = async () => {
  const result = await ImagePicker.launchImageLibraryAsync();
  if (!result.canceled) {
    // Upload image
    // Send image message
  }
};
```

### 3. Typing Indicator
```typescript
// Emit khi đang gõ
socket.emit('typing:start', { roomId });

// Listen khi người khác gõ
socket.on('typing:start', ({ userId }) => {
  setTypingUsers(prev => [...prev, userId]);
});

// UI: "Shop đang gõ..."
```

### 4. Message Status
```typescript
enum MessageStatus {
  SENDING = 'sending',    // Đang gửi
  SENT = 'sent',         // Đã gửi
  DELIVERED = 'delivered', // Đã nhận
  READ = 'read'          // Đã đọc
}

// Icons: ✓ (sent), ✓✓ (delivered), ✓✓ blue (read)
```

### 5. Rich Messages
- Images/Photos
- Videos
- Product cards
- Location
- Voice messages

### 6. Chat List Screen
```typescript
// app/chats/index.tsx
// Danh sách tất cả conversations
[
  { shop: 'Shop A', lastMessage: '...', time: '2h', unread: 3 },
  { shop: 'Shop B', lastMessage: '...', time: '1d', unread: 0 },
]
```

### 7. Push Notifications
```typescript
// Khi nhận tin nhắn mà app ở background
socket.on('message:receive', async (data) => {
  if (AppState.currentState !== 'active') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: data.senderName,
        body: data.message,
      },
    });
  }
});
```

---

## 🐛 Debugging

### Check Socket Connection
```typescript
console.log('Socket connected:', socketService.isConnected());
console.log('Socket ID:', socketService.getSocket()?.id);
```

### Log Socket Events
```typescript
socket.on('connect', () => console.log('✅ Connected'));
socket.on('disconnect', (reason) => console.log('❌ Disconnected:', reason));
socket.on('error', (error) => console.error('Socket error:', error));
```

### Test Messages
```typescript
// Gửi test message
socketService.emit('message:send', {
  roomId: 'shop-1',
  message: 'Test message'
});

// Listen tất cả events
socket.onAny((event, ...args) => {
  console.log('Socket event:', event, args);
});
```

---

## 📝 Cleanup

```typescript
useEffect(() => {
  initChat();
  
  return () => {
    // IMPORTANT: Cleanup khi unmount
    socketService.leaveRoom(roomId);
    socketService.unsubscribeFromMessages();
    // Không disconnect socket (vì singleton, dùng chung)
  };
}, []);
```

---

## 🎯 User Flow

```
Product Detail Screen
    ↓
User nhấn "💬 Chat"
    ↓
Navigate to Chat Screen
    ↓
Connect Socket (nếu chưa)
    ↓
Join Room (shop-{id})
    ↓
Load Chat History
    ↓
Subscribe to Messages
    ↓
Ready to Chat!
    ↓
User gõ tin nhắn → Gửi
    ↓
Socket.emit('message:send')
    ↓
Server broadcast to room
    ↓
Socket.on('message:receive')
    ↓
Update UI with new message
```

---

## ✅ Checklist Implementation

**Đã hoàn thành:**
- ✅ Chat screen UI
- ✅ Socket.IO integration
- ✅ Real-time messaging
- ✅ Message formatting
- ✅ Time display
- ✅ Navigation từ product detail
- ✅ Keyboard handling
- ✅ Auto scroll
- ✅ Online/offline status

**Chưa hoàn thành (backend cần implement):**
- ⏳ Load chat history từ database
- ⏳ Message persistence
- ⏳ File/image upload
- ⏳ Typing indicator
- ⏳ Read receipts
- ⏳ Push notifications
- ⏳ Chat list screen
- ⏳ Search messages
- ⏳ Delete messages
