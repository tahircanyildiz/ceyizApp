import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';

const COLORS = {
  primary: '#8B5E3C',
  background: '#F8F4EF',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
};

export default function ProductListScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('unpurchased');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await getProducts(categoryId);
      setProducts(res.data);
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [categoryId])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEditProduct', { categoryId, categoryName })}
        >
          <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 15, marginRight: 4 }}>+ Ekle</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleDelete = (id) => {
    Alert.alert('Ürünü Sil', 'Bu ürünü silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p._id !== id));
          } catch (err) {
            Alert.alert('Hata', err.message);
          }
        },
      },
    ]);
  };

  const filtered = products.filter((p) => {
    if (filter === 'purchased' && !p.isPurchased) return false;
    if (filter === 'unpurchased' && p.isPurchased) return false;
    if (search.trim()) return p.name.toLowerCase().includes(search.trim().toLowerCase());
    return true;
  });

  const totalSpend = products
    .filter((p) => p.isPurchased)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterBar active={filter} onChange={setFilter} />
      <TextInput
        style={styles.searchInput}
        placeholder="Ürün ara..."
        placeholderTextColor={COLORS.muted}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            onDelete={() => handleDelete(item._id)}
            onEdit={() =>
              navigation.navigate('AddEditProduct', { product: item, categoryId, categoryName })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {filter === 'purchased'
              ? 'Bu kategoride henüz alınan ürün yok.'
              : filter === 'unpurchased'
              ? 'Bu kategoride bekleyen ürün yok.'
              : 'Bu kategoride henüz ürün eklenmemiş.'}
          </Text>
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} tintColor={COLORS.primary} />
        }
      />

      {products.length > 0 && (
        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <Text style={styles.footerLabel}>Harcanan</Text>
          <Text style={styles.footerText}>{totalSpend.toLocaleString('tr-TR')} ₺</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E0D9D0',
  },
  list: { padding: 16, paddingBottom: 12 },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40, fontSize: 15 },
  footer: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: '#E0D9D0',
    paddingTop: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: { fontSize: 14, color: COLORS.muted, fontWeight: '600' },
  footerText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
});
