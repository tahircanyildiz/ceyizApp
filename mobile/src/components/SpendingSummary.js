import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getProducts } from '../services/api';

const COLORS = {
  primary: '#8B5E3C',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  green: '#4CAF50',
};

export default function SpendingSummary({ categories }) {
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState(0);

  useEffect(() => {
    if (!categories || categories.length === 0) return;
    fetchAllProducts();
  }, [categories]);

  const fetchAllProducts = async () => {
    try {
      const results = await Promise.all(categories.map((c) => getProducts(c._id)));
      const allProducts = results.flatMap((r) => r.data);

      setTotalItems(allProducts.length);
      setPurchasedItems(allProducts.filter((p) => p.isPurchased).length);
      setTotalSpend(
        allProducts.filter((p) => p.isPurchased).reduce((sum, p) => sum + (p.price || 0), 0)
      );
    } catch (err) {
      // sessizce geç
    }
  };

  if (categories.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Genel Özet</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Toplam Ürün</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: COLORS.green }]}>{purchasedItems}</Text>
          <Text style={styles.statLabel}>Alınan</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>
            {totalSpend.toLocaleString('tr-TR')} ₺
          </Text>
          <Text style={styles.statLabel}>Harcama</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: '#E0D9D0' },
});
