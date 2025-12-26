import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Category {
  id: number;
  title: string;
  icon: string;
}

interface CategoriesProps {
  categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
  return (
    <View style={styles.categoriesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => Alert.alert(category.title, 'Danh mục đang phát triển')}
          >
            <View style={styles.categoryIcon}>
              <Text style={styles.categoryIconText}>{category.icon}</Text>
            </View>
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  categoryItem: {
    width: 70,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fee',
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
});
