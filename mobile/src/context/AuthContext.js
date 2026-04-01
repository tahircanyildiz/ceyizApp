import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { login as apiLogin, register as apiRegister, updatePlayerID } from '../services/api';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Auth yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const res = await apiLogin({ identifier, password });
    await persistAuth(res.data.token, res.data.user);
  };

  const register = async (email, username, password, fullName) => {
    const res = await apiRegister({ email, username, password, fullName });
    await persistAuth(res.data.token, res.data.user);
  };

  const persistAuth = async (newToken, newUser) => {
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    // OneSignal player ID'yi backend'e kaydet (Expo Go'da çalışmaz)
    if (!isExpoGo) {
      try {
        const { OneSignal } = require('react-native-onesignal');
        const playerId = await OneSignal.User.pushSubscription.getIdAsync();
        if (playerId) await updatePlayerID(playerId);
      } catch {}
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
