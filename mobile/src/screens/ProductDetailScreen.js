import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProductById } from '../services/api';

const COLORS = {
  primary: '#8B5E3C',
  background: '#F8F4EF',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  green: '#4CAF50',
  border: '#E0D9D0',
};

export default function ProductDetailScreen({ route, navigation }) {
  const [product, setProduct] = useState(route.params.product);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchLatest = async () => {
        setLoading(true);
        try {
          const res = await getProductById(route.params.product._id);
          setProduct(res.data);
        } catch {
          // mevcut veriyi koru
        } finally {
          setLoading(false);
        }
      };
      fetchLatest();
    }, [route.params.product._id])
  );

  const handleMarkPurchased = () => {
    Alert.alert(
      'Alındı Olarak İşaretle',
      `"${product.name}" ürününü satın aldınız mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Alındı',
          onPress: () =>
            navigation.navigate('AddEditProduct', { product, purchaseMode: true }),
        },
      ]
    );
  };

  if (loading && !product) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Fotoğraf Yok</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={[styles.badge, product.isPurchased && styles.badgePurchased]}>
            <Text style={[styles.badgeText, product.isPurchased && styles.badgeTextPurchased]}>
              {product.isPurchased ? 'Alındı' : 'Bekliyor'}
            </Text>
          </View>
        </View>

        {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}

        {product.price > 0 ? (
          <Text style={styles.price}>{product.price.toLocaleString('tr-TR')} ₺</Text>
        ) : null}

        <Text style={styles.date}>
          Eklenme: {new Date(product.createdAt).toLocaleDateString('tr-TR')}
        </Text>

        <View style={styles.actions}>
          {/* Düzenle: satın alınmadıysa sadece isim, alındıysa detaylar */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('AddEditProduct', { product })}
          >
            <Text style={styles.editBtnText}>Düzenle</Text>
          </TouchableOpacity>

          {/* Alındı butonu — sadece henüz alınmadıysa göster */}
          {!product.isPurchased && (
            <TouchableOpacity style={styles.purchaseBtn} onPress={handleMarkPurchased}>
              <Text style={styles.purchaseBtnText}>Alındı Olarak İşaretle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  image: { width: '100%', height: 280 },
  imagePlaceholder: {
    width: '100%', height: 160,
    backgroundColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  imagePlaceholderText: { color: COLORS.muted, fontSize: 14 },
  card: { margin: 16, backgroundColor: COLORS.card, borderRadius: 16, padding: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productName: { fontSize: 20, fontWeight: '800', color: COLORS.text, flex: 1, marginRight: 10 },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F3EDE8',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgePurchased: { backgroundColor: '#E8F5E9', borderColor: COLORS.green },
  badgeText: { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  badgeTextPurchased: { color: COLORS.green },
  brand: { fontSize: 15, color: COLORS.muted, marginBottom: 8 },
  price: { fontSize: 26, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  date: { fontSize: 13, color: COLORS.muted, marginBottom: 20 },
  actions: { gap: 10 },
  editBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 13,
    alignItems: 'center',
  },
  editBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  purchaseBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  purchaseBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
