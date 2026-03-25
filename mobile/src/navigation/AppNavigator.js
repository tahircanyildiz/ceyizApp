import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import AddEditProductScreen from '../screens/AddEditProductScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const COLORS = { primary: '#8B5E3C', background: '#F8F4EF' };

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Yuvam' }} />
            <Stack.Screen name="ProductList" component={ProductListScreen} options={({ route }) => ({ title: route.params?.categoryName || 'Ürünler' })} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Ürün Detayı' }} />
            <Stack.Screen name="AddEditProduct" component={AddEditProductScreen} options={({ route }) => {
              const { product, purchaseMode } = route.params || {};
              if (purchaseMode) return { title: 'Detayları Gir' };
              if (product?.isPurchased) return { title: 'Detayları Düzenle' };
              if (product) return { title: 'İsmi Düzenle' };
              return { title: 'Ürün Ekle' };
            }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ayarlar' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
