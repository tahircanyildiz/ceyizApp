import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Geliştirme ortamında kendi IP adresinizi kullanın
// Expo Go ile test ederken localhost yerine bilgisayarınızın local IP'si gerekir
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
    return Promise.reject(new Error(message));
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const updatePlayerID = (playerId) => api.put('/auth/player-id', { playerId });

// Partner
export const getPartner = () => api.get('/partner');
export const addPartner = (data) => api.post('/partner/add', data);
export const updatePartner = (id, data) => api.put(`/partner/${id}`, data);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Products
export const getProducts = (categoryId) =>
  api.get('/products', { params: { categoryId } });
export const searchProducts = (query) =>
  api.get('/products', { params: { search: query } });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Chat
export const sendChatMessage = (messages) => api.post('/chat', { messages });

// Transcribe
export const transcribeAudio = async (audioUri) => {
  const base64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const res = await api.post('/transcribe', { audio: base64 });
  return res.data.text;
};

// Upload
export const uploadImage = async (imageUri) => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop();
  const ext = filename.split('.').pop();
  const type = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';

  formData.append('image', { uri: imageUri, name: filename, type });

  const token = await AsyncStorage.getItem('token');
  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.imageUrl;
};

export default api;
