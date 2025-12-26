# API & SOCKET CONFIGURATION

## 📡 Backend Endpoints

### 1. REST API (Vercel)
```
URL: https://backend-node-lilac-seven.vercel.app
Purpose: RESTful API cho CRUD operations
```

**Endpoints:**
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/products/slug/:slug` - Chi tiết theo slug

---

### 2. Socket.IO Server (Render)
```
URL: https://backend-node-5re9.onrender.com
Purpose: Real-time communication
```

**Features:**
- Real-time notifications
- Product updates
- Order status updates
- Live chat/messaging
- Room-based communication

---

## 🔧 Configuration Setup

**File: `config/api.ts`**
```typescript
export const API_CONFIG = {
  REST_URL: 'https://backend-node-lilac-seven.vercel.app',  // Vercel
  SOCKET_URL: 'https://backend-node-5re9.onrender.com'      // Render
};
```

---

## 📦 Services Updated

### 1. `authService.ts`
```typescript
import { API_CONFIG } from '@/config/api';
const API_BASE_URL = `${API_CONFIG.REST_URL}/api`;
```

### 2. `productService.ts`
```typescript
import { API_CONFIG } from '@/config/api';
const API_BASE_URL = `${API_CONFIG.REST_URL}/api`;
```

### 3. `socketService.ts` (NEW)
```typescript
import { API_CONFIG } from '@/config/api';
const socket = io(API_CONFIG.SOCKET_URL, options);
```

---

## 🚀 Socket Service Usage

### Initialize Connection
```typescript
import { socketService } from '@/services/socketService';

// Connect with token (authenticated)
const token = await AsyncStorage.getItem('token');
socketService.connect(token);

// Or connect without token (guest)
socketService.connect();
```

### Real-time Notifications
```typescript
// Subscribe
socketService.subscribeToNotifications((notification) => {
  console.log('New notification:', notification);
  // Update UI, show toast, etc.
});

// Unsubscribe
socketService.unsubscribeFromNotifications();
```

### Real-time Product Updates
```typescript
// Subscribe
socketService.subscribeToProductUpdates((product) => {
  console.log('Product updated:', product);
  // Update product list in UI
});

// Unsubscribe
socketService.unsubscribeFromProductUpdates();
```

### Real-time Order Updates
```typescript
// Subscribe
socketService.subscribeToOrderUpdates((order) => {
  console.log('Order updated:', order);
  // Update order status in UI
});

// Unsubscribe
socketService.unsubscribeFromOrderUpdates();
```

### Chat/Messaging
```typescript
// Join a room (conversation)
socketService.joinRoom('room-123');

// Send message
socketService.sendMessage('room-123', 'Hello!');

// Listen for messages
socketService.subscribeToMessages((message) => {
  console.log('New message:', message);
});

// Leave room
socketService.leaveRoom('room-123');
socketService.unsubscribeFromMessages();
```

### Custom Events
```typescript
// Emit custom event
socketService.emit('custom:event', { data: 'value' });

// Listen to custom event
socketService.on('custom:response', (data) => {
  console.log('Custom response:', data);
});

// Remove listener
socketService.off('custom:response');
```

### Disconnect
```typescript
socketService.disconnect();
```

---

## 💡 Example: Home Screen with Socket

```typescript
import { socketService } from '@/services/socketService';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Connect socket
    const initSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      socketService.connect(token);

      // Listen for product updates
      socketService.subscribeToProductUpdates((updatedProduct) => {
        setProducts(prev => 
          prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );
      });

      // Listen for notifications
      socketService.subscribeToNotifications((notification) => {
        Alert.alert('Thông báo', notification.message);
      });
    };

    initSocket();

    // Cleanup
    return () => {
      socketService.unsubscribeFromProductUpdates();
      socketService.unsubscribeFromNotifications();
      socketService.disconnect();
    };
  }, []);

  // ... rest of component
}
```

---

## 🔐 Authentication with Socket

```typescript
// After login
const response = await authService.login(email, password);
socketService.connect(response.token);

// After logout
await authService.logout();
socketService.disconnect();
```

---

## 📱 Socket Events Reference

### Client → Server (Emit)
```typescript
socket.emit('room:join', { roomId: 'xxx' });
socket.emit('room:leave', { roomId: 'xxx' });
socket.emit('message:send', { roomId: 'xxx', message: 'text' });
```

### Server → Client (Listen)
```typescript
socket.on('notification', (data) => { });
socket.on('product:update', (data) => { });
socket.on('order:update', (data) => { });
socket.on('message:receive', (data) => { });
```

### Built-in Events
```typescript
socket.on('connect', () => { });
socket.on('disconnect', (reason) => { });
socket.on('connect_error', (error) => { });
socket.on('error', (error) => { });
```

---

## 🛠️ Socket Service API

### Connection Methods
- `connect(token?: string)` - Connect to socket server
- `disconnect()` - Disconnect from server
- `isConnected()` - Check connection status

### Event Methods
- `emit(event, data)` - Send event to server
- `on(event, callback)` - Listen to event
- `off(event, callback)` - Remove listener
- `removeAllListeners(event?)` - Remove all listeners

### Notification Methods
- `subscribeToNotifications(callback)`
- `unsubscribeFromNotifications()`

### Product Methods
- `subscribeToProductUpdates(callback)`
- `unsubscribeFromProductUpdates()`

### Order Methods
- `subscribeToOrderUpdates(callback)`
- `unsubscribeFromOrderUpdates()`

### Chat Methods
- `joinRoom(roomId)`
- `leaveRoom(roomId)`
- `sendMessage(roomId, message)`
- `subscribeToMessages(callback)`
- `unsubscribeFromMessages()`

---

## 🔄 Architecture Overview

```
Mobile App
    │
    ├── REST API (Vercel)
    │   ├── GET/POST/PUT/DELETE
    │   ├── Authentication
    │   ├── CRUD Operations
    │   └── Data Fetching
    │
    └── Socket.IO (Render)
        ├── Real-time Updates
        ├── Notifications
        ├── Live Chat
        └── Event Broadcasting
```

---

## ⚠️ Important Notes

1. **Connection Lifecycle:**
   - Connect khi app start/user login
   - Disconnect khi app unmount/user logout
   - Auto-reconnect on connection lost

2. **Token Authentication:**
   - Socket cần token để authenticate user
   - Pass token khi connect: `socketService.connect(token)`

3. **Memory Management:**
   - Always unsubscribe in cleanup (useEffect return)
   - Remove listeners when component unmounts

4. **Error Handling:**
   - Socket có auto-reconnect
   - Handle connect_error và error events
   - Show appropriate UI feedback

5. **Performance:**
   - Socket connection là singleton (1 instance cho toàn app)
   - Reuse connection, không tạo nhiều connections
   - Debounce emit events nếu emit quá nhanh

---

## 🎯 Next Steps

1. **Implement in Home Screen:**
   - Add socket connection on mount
   - Subscribe to product updates
   - Update UI real-time

2. **Notifications Screen:**
   - Subscribe to notifications
   - Display real-time notifications
   - Update badge count

3. **Product Detail:**
   - Listen for price changes
   - Update stock in real-time
   - Show "someone is viewing" indicator

4. **Chat Feature:**
   - Implement chat with seller
   - Real-time messaging
   - Typing indicators

5. **Order Tracking:**
   - Real-time order status
   - Delivery tracking
   - Notifications on status change
