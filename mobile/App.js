import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// OneSignal Expo Go'da çalışmaz, sadece native build'de başlat
const isExpoGo = Constants.executionEnvironment === 'storeClient';
if (!isExpoGo) {
  const { OneSignal } = require('react-native-onesignal');
  OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID);
}

export default function App() {
  useEffect(() => {
    if (isExpoGo) return;
    const { OneSignal } = require('react-native-onesignal');
    OneSignal.Notifications.requestPermission(true);
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
  );
}
