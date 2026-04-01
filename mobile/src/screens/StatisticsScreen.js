import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategories, getProducts } from '../services/api';

const COLORS = {
  primary: '#8B5E3C',
  background: '#F8F4EF',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  green: '#4CAF50',
  border: '#E0D9D0',
};

export default function StatisticsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await getCategories();
      const categories = catRes.data;

      const productArrays = await Promise.all(
        categories.map((cat) => getProducts(cat._id).then((r) => ({ cat, products: r.data })))
      );

      const categoryStats = productArrays.map(({ cat, products }) => {
        const total = products.length;
        const purchased = products.filter((p) => p.isPurchased).length;
        const spend = products
          .filter((p) => p.isPurchased && p.price > 0)
          .reduce((sum, p) => sum + p.price, 0);
        return {
          name: cat.name,
          total,
          purchased,
          spend,
          rate: total > 0 ? Math.round((purchased / total) * 100) : 0,
        };
      });

      const totalProducts = categoryStats.reduce((s, c) => s + c.total, 0);
      const totalPurchased = categoryStats.reduce((s, c) => s + c.purchased, 0);
      const totalSpend = categoryStats.reduce((s, c) => s + c.spend, 0);

      setStats({ categoryStats, totalProducts, totalPurchased, totalSpend });
    } catch {
      // sessiz hata
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!stats) return null;

  const { categoryStats, totalProducts, totalPurchased, totalSpend } = stats;
  const maxSpend = Math.max(...categoryStats.map((c) => c.spend), 1);
  const spendingCats = categoryStats.filter((c) => c.spend > 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
    >
      {/* Özet Kartları */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Toplam Ürün" value={totalProducts} />
        <SummaryCard label="Alınan" value={totalPurchased} color={COLORS.green} />
        <SummaryCard label="Bekleyen" value={totalProducts - totalPurchased} color={COLORS.primary} />
      </View>
      <View style={styles.spendCard}>
        <Text style={styles.spendLabel}>Toplam Harcama</Text>
        <Text style={styles.spendValue}>{totalSpend.toLocaleString('tr-TR')} ₺</Text>
      </View>

      {/* Kategori Tamamlanma */}
      <Text style={styles.sectionTitle}>Kategori Tamamlanma</Text>
      <View style={styles.card}>
        {categoryStats.length === 0 && (
          <Text style={styles.empty}>Henüz kategori yok.</Text>
        )}
        {categoryStats.map((cat, i) => (
          <View key={cat.name} style={[styles.catRow, i > 0 && styles.catRowBorder]}>
            <View style={styles.catHeader}>
              <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
              <Text style={styles.catMeta}>
                {cat.purchased}/{cat.total} ürün
                {'  '}
                <Text style={{ color: cat.rate === 100 ? COLORS.green : COLORS.primary, fontWeight: '700' }}>
                  %{cat.rate}
                </Text>
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${cat.rate}%`,
                    backgroundColor: cat.rate === 100 ? COLORS.green : COLORS.primary,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Harcama Dağılımı */}
      {spendingCats.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Harcama Dağılımı</Text>
          <View style={styles.card}>
            {spendingCats
              .sort((a, b) => b.spend - a.spend)
              .map((cat, i) => (
                <View key={cat.name} style={[styles.catRow, i > 0 && styles.catRowBorder]}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
                    <Text style={[styles.catMeta, { color: COLORS.primary, fontWeight: '700' }]}>
                      {cat.spend.toLocaleString('tr-TR')} ₺
                    </Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.round((cat.spend / maxSpend) * 100)}%`,
                          backgroundColor: COLORS.primary,
                          opacity: 0.7 + 0.3 * (cat.spend / maxSpend),
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, color && { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  summaryLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2, textAlign: 'center' },
  spendCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  spendLabel: { fontSize: 14, color: COLORS.muted, fontWeight: '600' },
  spendValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 20 },
  catRow: { paddingVertical: 12 },
  catRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catName: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: 8 },
  catMeta: { fontSize: 13, color: COLORS.muted },
  progressBg: { height: 8, backgroundColor: '#F0EBE5', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  empty: { color: COLORS.muted, textAlign: 'center', paddingVertical: 12 },
});
