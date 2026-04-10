import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { OfflineProvider } from './src/context/OfflineContext';
import { SettingsProvider } from './src/context/SettingsContext';
import OfflineBanner from './src/components/common/OfflineBanner';
import AppErrorBoundary from './src/components/common/AppErrorBoundary';

import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <AppErrorBoundary>
      <OfflineProvider>
        <SettingsProvider>
          <View style={styles.container}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <OfflineBanner />
            <AppNavigator />
          </View>
          <Toast />
        </SettingsProvider>
      </OfflineProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D17',
  },
});
