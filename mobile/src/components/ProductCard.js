import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const COLORS = {
  primary: '#8B5E3C',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  green: '#4CAF50',
  border: '#E0D9D0',
};

export default function ProductCard({ product, onPress, onToggle, onDelete, onEdit }) {
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
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ fontSize: 24 }}>🛍</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
        <Text style={styles.price}>
          {product.price > 0 ? `${product.price.toLocaleString('tr-TR')} ₺` : '—'}
        </Text>
      </View>

      <View style={styles.right}>
        <View style={[styles.badge, product.isPurchased && styles.badgePurchased]}>
          <Text style={[styles.badgeText, product.isPurchased && styles.badgeTextPurchased]}>
            {product.isPurchased ? 'Alındı' : 'Bekliyor'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 80, height: 80 },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F0EBE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  brand: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  right: { paddingRight: 14 },
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
