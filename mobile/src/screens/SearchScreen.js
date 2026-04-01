import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchProducts, getCategories } from '../services/api';

const COLORS = {
  primary: '#8B5E3C',
  background: '#F8F4EF',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  green: '#4CAF50',
  border: '#E0D9D0',
};

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const insets = useSafeAreaInsets();
  const categoriesRef = useRef([]);

  useEffect(() => {
    getCategories().then((res) => {
      setCategories(res.data);
      categoriesRef.current = res.data;
    }).catch(() => {});
  }, []);

  const handleSearch = async (text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchProducts(text.trim());
      setResults(res.data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categoriesRef.current.find((c) => c._id === categoryId);
    return cat?.name || '';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.category}>{getCategoryName(item.categoryId)}</Text>
      </View>
      <View style={[styles.badge, item.isPurchased && styles.badgePurchased]}>
        <Text style={[styles.badgeText, item.isPurchased && styles.badgeTextPurchased]}>
          {item.isPurchased ? 'Alındı' : 'Bekliyor'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Tüm ürünlerde ara..."
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={handleSearch}
          autoFocus
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : searched && results.length === 0 ? (
        <Text style={styles.empty}>"{query}" için sonuç bulunamadı.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: { padding: 12, paddingBottom: 8 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  row: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 8,
  },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  category: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  badge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: '#F3EDE8',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgePurchased: { backgroundColor: '#E8F5E9', borderColor: COLORS.green },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  badgeTextPurchased: { color: COLORS.green },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40, fontSize: 15 },
});
