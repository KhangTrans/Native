export interface Message {
  id: string;
  roomId: string;
  senderId: number;
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  shopId: number;
  shopName: string;
  shopAvatar?: string;
  userId: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface SendMessageData {
  roomId: string;
  message: string;
}

export interface MessageReceivedData {
  id: string;
  roomId: string;
  senderId: number;
  senderName: string;
  message: string;
  timestamp: string;
}
