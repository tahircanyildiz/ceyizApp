import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createProduct, updateProduct, uploadImage } from '../services/api';

const COLORS = {
  primary: '#8B5E3C',
  background: '#F8F4EF',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  border: '#E0D9D0',
};

export default function AddEditProductScreen({ route, navigation }) {
  const { product, categoryId, purchaseMode } = route.params || {};
  const isEdit = !!product;

  // purchaseMode: alındı işaretlenirken detay girme ekranı
  // isEdit && product.isPurchased: satın alınmış ürünü düzenleme
  const showPurchaseFields = purchaseMode || (isEdit && product?.isPurchased);
  const showNameField = !showPurchaseFields;

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price > 0 ? product.price.toString() : '');
  const [brand, setBrand] = useState(product?.brand || '');
  const [imageUri, setImageUri] = useState(product?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async (fromCamera) => {
    const permResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf için izin vermeniz gerekiyor.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });

    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleImagePicker = () => {
    Alert.alert('Fotoğraf Seç', 'Nereden seçmek istersiniz?', [
      { text: 'Kamera', onPress: () => pickImage(true) },
      { text: 'Galeri', onPress: () => pickImage(false) },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (showNameField && !name.trim()) {
      Alert.alert('Hata', 'Ürün adı zorunludur');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imageUri;

      const isLocalUri = imageUri && !imageUri.startsWith('http');
      if (isLocalUri) {
        setUploading(true);
        finalImageUrl = await uploadImage(imageUri);
        setUploading(false);
      }

      if (isEdit) {
        const payload = {};
        if (showNameField) {
          payload.name = name.trim();
        } else {
          // purchase fields
          payload.price = parseFloat(price) || 0;
          payload.brand = brand.trim();
          payload.imageUrl = finalImageUrl;
          if (purchaseMode) payload.isPurchased = true;
        }
        await updateProduct(product._id, payload);
      } else {
        await createProduct({ name: name.trim(), categoryId });
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Fotoğraf — sadece purchase fields ekranında */}
        {showPurchaseFields && (
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>Fotoğraf Ekle</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {uploading && (
          <View style={styles.uploadingRow}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.uploadingText}>Fotoğraf yükleniyor...</Text>
          </View>
        )}

        <View style={styles.form}>
          {showNameField && (
            <>
              <Text style={styles.label}>Ürün Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="ör: Bosch Çamaşır Makinesi"
                placeholderTextColor={COLORS.muted}
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          {showPurchaseFields && (
            <>
              <Text style={styles.label}>Marka</Text>
              <TextInput
                style={styles.input}
                placeholder="ör: Bosch"
                placeholderTextColor={COLORS.muted}
                value={brand}
                onChangeText={setBrand}
              />

              <Text style={styles.label}>Fiyat (₺)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.muted}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {purchaseMode ? 'Kaydet ve Alındı İşaretle' : isEdit ? 'Güncelle' : 'Kaydet'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  imagePicker: { width: '100%', height: 200 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderIcon: { fontSize: 36 },
  imagePlaceholderText: { color: COLORS.muted, fontSize: 14 },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#FFF9F5',
  },
  uploadingText: { color: COLORS.primary, fontSize: 13 },
  form: { padding: 20, gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 2,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
