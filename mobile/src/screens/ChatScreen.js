import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendChatMessage } from '../services/api';
import { exportToExcel } from '../services/exportService';

const COLORS = {
  primary: '#8B5E3C',
  background: '#F8F4EF',
  card: '#FFFFFF',
  text: '#2D2D2D',
  muted: '#9E9E9E',
  border: '#E0D9D0',
};

const STORAGE_KEY = 'chat_messages';

const GREETING = {
  id: 'greeting',
  role: 'assistant',
  content: 'Merhaba! Çeyiz listen hakkında sorularını yanıtlayabilirim. Ne öğrenmek istersin?',
};

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState(null); // null = henüz yüklenmedi
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Mesajları AsyncStorage'dan yükle
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([GREETING]);
      }
    });
  }, []);

  // Mesajlar değişince kaydet
  useEffect(() => {
    if (messages !== null) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Header'a Temizle butonu ekle
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleClear} style={{ marginRight: 4, paddingHorizontal: 10, paddingVertical: 8 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 14 }}>Temizle</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Klavye listener
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleClear = () => {
    Alert.alert('Sohbeti Temizle', 'Tüm sohbet geçmişi silinecek. Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Temizle',
        style: 'destructive',
        onPress: () => {
          setMessages([GREETING]);
          AsyncStorage.removeItem(STORAGE_KEY);
        },
      },
    ]);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== 'greeting')
        .map(({ role, content }) => ({ role, content }));

      const res = await sendChatMessage(apiMessages);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (res.data.triggerExport) {
        try {
          await exportToExcel();
        } catch (e) {
          Alert.alert('Export Hatası', e.message);
        }
      }
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.assistantText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  if (messages === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingBottom: keyboardHeight }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.list, { paddingBottom: 16 }]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled"
      />

      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.typingText}>Yanıt yazıyor...</Text>
        </View>
      )}

      <View style={[styles.inputRow, { paddingBottom: keyboardHeight > 0 ? 12 : (insets.bottom || 12) }]}>
        <TextInput
          style={styles.input}
          placeholder="Bir şey sor..."
          placeholderTextColor={COLORS.muted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  userText: { color: '#FFF' },
  assistantText: { color: COLORS.text },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  typingText: { fontSize: 13, color: COLORS.muted },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingTop: 8,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
