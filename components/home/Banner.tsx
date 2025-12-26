import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Banner() {
  return (
    <View style={styles.banner}>
      <LinearGradient colors={['#ff6a3d', '#ff8f6b']} style={styles.bannerGradient}>
        <Text style={styles.bannerTitle}>SIÊU SALE 12.12</Text>
        <Text style={styles.bannerSubtitle}>Giảm đến 50% ⚡</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 150,
    marginBottom: 8,
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 18,
    color: '#fff',
  },
});
