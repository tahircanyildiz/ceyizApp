import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPartner, addPartner, updatePartner } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#8B5E3C',
  background: '#F8F4EF',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  border: '#E0D9D0',
  danger: '#E53935',
  green: '#4CAF50',
};

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const isMainUser = user?.id === user?.householdId || user?.householdId === user?.id?.toString();

  const [partner, setPartner] = useState(null);
  const [loadingPartner, setLoadingPartner] = useState(true);

  // Yeni partner ekleme formu
  const [addForm, setAddForm] = useState({ fullName: '', username: '', password: '' });
  const [addLoading, setAddLoading] = useState(false);

  // Partner düzenleme modal
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', username: '', password: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchPartner();
  }, []);

  const fetchPartner = async () => {
    try {
      const res = await getPartner();
      setPartner(res.data.partner);
    } catch (err) {
      // partner yok
    } finally {
      setLoadingPartner(false);
    }
  };

  const handleAddPartner = async () => {
    if (!addForm.username.trim() || !addForm.password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre zorunludur');
      return;
    }
    setAddLoading(true);
    try {
      const res = await addPartner({
        fullName: addForm.fullName.trim(),
        username: addForm.username.trim(),
        password: addForm.password,
      });
      setPartner(res.data.partner);
      setAddForm({ fullName: '', username: '', password: '' });
      Alert.alert('Başarılı', res.data.message);
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const openEditModal = () => {
    setEditForm({ fullName: partner.fullName || '', username: partner.username, password: '' });
    setEditModal(true);
  };

  const handleUpdatePartner = async () => {
    if (!editForm.username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı zorunludur');
      return;
    }
    setEditLoading(true);
    try {
      const payload = { fullName: editForm.fullName, username: editForm.username };
      if (editForm.password) payload.password = editForm.password;

      const res = await updatePartner(partner.id, payload);
      setPartner(res.data.partner);
      setEditModal(false);
      Alert.alert('Başarılı', 'Partner bilgileri güncellendi');
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}>

        {/* Hesap Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
          <View style={styles.card}>
            <Text style={styles.infoValue}>{user?.fullName || '—'}</Text>
            <Text style={styles.infoSub}>@{user?.username}</Text>
          </View>
        </View>

        {/* Partner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner</Text>

          {loadingPartner ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 10 }} />
          ) : partner || !isMainUser ? (
            /* Partner var — bilgilerini göster */
            <View style={styles.card}>
              {partner ? (
                <View style={styles.partnerRow}>
                  <View style={styles.partnerAvatar}>
                    <Text style={styles.partnerAvatarText}>
                      {(partner.fullName || partner.username).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoValue}>{partner.fullName || '—'}</Text>
                    <Text style={styles.infoSub}>@{partner.username}</Text>
                  </View>
                  {isMainUser && (
                    <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
                      <Text style={styles.editBtnText}>Düzenle</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <Text style={styles.infoSub}>Partner henüz eklenmemiş</Text>
              )}
            </View>
          ) : (
            /* Partner yok — form göster */
            <View style={styles.card}>
              <Text style={styles.sectionDesc}>
                Partnerinizin hesabını oluşturun. Partneriniz bu bilgilerle giriş yapabilir.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor={COLORS.muted}
                value={addForm.fullName}
                onChangeText={(v) => setAddForm((f) => ({ ...f, fullName: v }))}
              />
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Kullanıcı adı *"
                placeholderTextColor={COLORS.muted}
                value={addForm.username}
                onChangeText={(v) => setAddForm((f) => ({ ...f, username: v }))}
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Şifre * (min. 6 karakter)"
                placeholderTextColor={COLORS.muted}
                value={addForm.password}
                onChangeText={(v) => setAddForm((f) => ({ ...f, password: v }))}
                secureTextEntry
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddPartner} disabled={addLoading}>
                {addLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.addBtnText}>Partner Ekle</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Çıkış */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [{ text: 'İptal', style: 'cancel' }, { text: 'Çıkış Yap', style: 'destructive', onPress: logout }])}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Partner Düzenleme Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom || 24 }]}>
            <Text style={styles.modalTitle}>Partner Bilgilerini Düzenle</Text>
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor={COLORS.muted}
              value={editForm.fullName}
              onChangeText={(v) => setEditForm((f) => ({ ...f, fullName: v }))}
            />
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Kullanıcı adı"
              placeholderTextColor={COLORS.muted}
              value={editForm.username}
              onChangeText={(v) => setEditForm((f) => ({ ...f, username: v }))}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Yeni şifre (değiştirmek istemiyorsan boş bırak)"
              placeholderTextColor={COLORS.muted}
              value={editForm.password}
              onChangeText={(v) => setEditForm((f) => ({ ...f, password: v }))}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePartner} disabled={editLoading}>
                {editLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionDesc: { fontSize: 13, color: COLORS.muted, marginBottom: 14, lineHeight: 18 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  infoValue: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  infoSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  partnerAvatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  editBtn: {
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  editBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center', marginTop: 14,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  logoutBtn: {
    borderWidth: 1, borderColor: COLORS.danger, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 13, alignItems: 'center' },
  cancelText: { color: COLORS.muted, fontWeight: '600' },
  saveBtn: { flex: 1, borderRadius: 12, backgroundColor: COLORS.primary, paddingVertical: 13, alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: '700' },
});
