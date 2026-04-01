import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const COLORS = {
  primary: '#8B5E3C',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  green: '#4CAF50',
  border: '#E0D9D0',
};

export default function ProductCard({ product, onPress, onDelete, onEdit }) {
  const handleLongPress = () => {
    Alert.alert(product.name, 'Ne yapmak istersiniz?', [
      { text: 'Düzenle', onPress: onEdit },
      { text: 'Sil', style: 'destructive', onPress: onDelete },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
        {product.name}
      </Text>

      <View style={[styles.badge, product.isPurchased && styles.badgePurchased]}>
        <Text style={[styles.badgeText, product.isPurchased && styles.badgeTextPurchased]}>
          {product.isPurchased ? 'Alındı' : 'Bekliyor'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: 12 },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F3EDE8',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgePurchased: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.green,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  badgeTextPurchased: { color: COLORS.green },
});
