import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import { authAPI } from '../services/api';
import { useLocation } from '../hooks/useLocation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { location } = useLocation();

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      const storedUser = await SecureStore.getItemAsync('authUser');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Auth load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      const response = await Google.askForGooglePlayServicesPermissionsAsync();
      if (response?.granted) {
        const result = await Google.exchangeCodeAsync({
          clientId: process.env.GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email'],
        });

        if (result.type === 'success') {
          const { id_token } = result.params;
          const userData = await authAPI.loginGoogle(id_token, location);
          saveSession(userData);
          return { success: true, user: userData };
        }
      }
      return { success: false, error: 'Google sign-in failed' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleEmailLogin = async (email, password) => {
    try {
      const userData = await authAPI.login(email, password);
      saveSession(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleEmailRegister = async (name, email, password) => {
    try {
      const userData = await authAPI.register(name, email, password);
      saveSession(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const saveSession = async (userData) => {
    try {
      setToken(userData.token);
      setUser(userData);
      await SecureStore.setItemAsync('authToken', userData.token);
      await SecureStore.setItemAsync('authUser', JSON.stringify(userData));
    } catch (err) {
      console.error('Session save error:', err);
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('authUser');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (data) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
      await SecureStore.setItemAsync('authUser', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    loginEmail: handleEmailLogin,
    register: handleEmailRegister,
    loginGoogle: handleGoogleSignin,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
