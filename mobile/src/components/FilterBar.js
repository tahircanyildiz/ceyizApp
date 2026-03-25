import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#8B5E3C',
  background: '#F8F4EF',
  card: '#FFFFFF',
  muted: '#9E9E9E',
};

const FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'unpurchased', label: 'Bekleyenler' },
  { key: 'purchased', label: 'Alınanlar' },
];

export default function FilterBar({ active, onChange }) {
  return (
    <View style={styles.container}>
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={[styles.btn, active === f.key && styles.btnActive]}
          onPress={() => onChange(f.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, active === f.key && styles.labelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{f.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0D9D0',
  },
  btnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  labelActive: { color: '#FFF' },
});
