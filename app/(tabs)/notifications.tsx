import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: 1,
      icon: '📦',
      title: 'Cập nhật đơn hàng',
      message: 'Đơn hàng của bạn đang được giao',
      time: '2 giờ trước',
    },
    {
      id: 2,
      icon: '🎁',
      title: 'Khuyến mãi đặc biệt',
      message: 'Giảm 50% cho đơn hàng đầu tiên',
      time: '5 giờ trước',
    },
    {
      id: 3,
      icon: '⚡',
      title: 'Flash Sale đang diễn ra',
      message: 'Còn 2 giờ để săn deal hot',
      time: '1 ngày trước',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>
      <ScrollView style={styles.content}>
        {notifications.map((notification) => (
          <TouchableOpacity key={notification.id} style={styles.notificationCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{notification.icon}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.time}>{notification.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});
