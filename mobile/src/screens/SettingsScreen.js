import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../styles/theme';
import { useSettings } from '../context/SettingsContext';
import { useOffline } from '../context/OfflineContext';

const AVAILABLE_SATELLITES = [
  { id: 'ISS', name: 'ISS (ZARYA)', noradId: 25544, icon: '🛰️' },
  { id: 'HUBBLE', name: 'Hubble Space Telescope', noradId: 20580, icon: '🔭' },
  { id: 'TIANGONG', name: 'Tiangong Space Station', noradId: 48274, icon: '🏠' },
  { id: 'STARLINK-1', name: 'Starlink-1007', noradId: 44713, icon: '📡' },
  { id: 'STARLINK-2', name: 'Starlink-1130', noradId: 44914, icon: '📡' },
  { id: 'STARLINK-3', name: 'Starlink-2483', noradId: 48601, icon: '📡' },
  { id: 'CSS', name: 'Chinese Space Station', noradId: 54216, icon: '🏢' },
  { id: 'TERRA', name: 'Terra (EOS AM-1)', noradId: 25994, icon: '🌍' },
  { id: 'AQUA', name: 'Aqua', noradId: 27424, icon: '💧' },
  { id: 'NOAA-20', name: 'NOAA-20 (JPSS-1)', noradId: 43013, icon: '🌤️' },
];

const SPEED_OPTIONS = [
  { key: 'kmh', label: 'km/h' },
  { key: 'mph', label: 'mph' },
];

const ALTITUDE_OPTIONS = [
  { key: 'km', label: 'Kilometers' },
  { key: 'mi', label: 'Miles' },
];

const THEME_OPTIONS = [
  { key: 'dark', label: 'Dark', icon: 'moon' },
  { key: 'light', label: 'Light', icon: 'sunny' },
  { key: 'auto', label: 'Auto', icon: 'contrast' },
];

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { isOnline } = useOffline();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleToggleNotifications = (value) => {
    updateSettings({ alerts: { ...settings.alerts, enabled: value } });
  };

  const handleToggleSatellite = (satId) => {
    const current = settings.satellites || [];
    let updated;
    if (current.includes(satId)) {
      updated = current.filter((id) => id !== satId);
    } else {
      if (current.length >= 10) {
        Alert.alert('Limit Reached', 'You can track a maximum of 10 satellites.');
        return;
      }
      updated = [...current, satId];
    }
    updateSettings({ satellites: updated });
  };

  const handleSpeedUnit = (unit) => {
    updateSettings({ units: { ...settings.units, speed: unit } });
  };

  const handleAltitudeUnit = (unit) => {
    updateSettings({ units: { ...settings.units, altitude: unit } });
  };

  const handleTheme = (theme) => {
    updateSettings({ theme });
  };

  const handleAlertMinutes = (direction) => {
    const current = settings.alerts?.alertBefore || 10;
    const next = direction === 'up' ? Math.min(current + 5, 60) : Math.max(current - 5, 5);
    updateSettings({ alerts: { ...settings.alerts, alertBefore: next } });
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their defaults. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetSettings(),
        },
      ]
    );
  };

  const selectedSats = settings.satellites || [];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0B0D17', '#0f1224', '#151829']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>Customize your experience</Text>
        </View>
        <View style={{ width: 40 }}>
          {!isOnline && (
            <Ionicons name="cloud-offline-outline" size={18} color="#FFB74D" />
          )}
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: 'rgba(255, 107, 53, 0.15)' }]}>
              <Ionicons name="notifications" size={18} color="#FF6B35" />
            </View>
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Pass Alerts</Text>
                <Text style={styles.settingDesc}>Get notified before ISS passes over you</Text>
              </View>
              <Switch
                value={settings.alerts?.enabled ?? true}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#2A2D4C', true: 'rgba(108, 99, 255, 0.4)' }}
                thumbColor={settings.alerts?.enabled ? COLORS.primary : '#6B6F8D'}
              />
            </View>

            {settings.alerts?.enabled && (
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Alert Before</Text>
                  <Text style={styles.settingDesc}>Minutes before a pass to notify</Text>
                </View>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => handleAlertMinutes('down')}
                  >
                    <Ionicons name="remove" size={16} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{settings.alerts?.alertBefore || 10}m</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => handleAlertMinutes('up')}
                  >
                    <Ionicons name="add" size={16} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Satellite Selection */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(0, 214, 143, 0.15)' }]}>
            <Ionicons name="radio" size={18} color="#00D68F" />
          </View>
          <Text style={styles.sectionTitle}>Tracked Satellites</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{selectedSats.length}/10</Text>
          </View>
        </View>

        <View style={styles.card}>
          {AVAILABLE_SATELLITES.map((sat, index) => {
            const isSelected = selectedSats.includes(sat.id);
            return (
              <TouchableOpacity
                key={sat.id}
                style={[
                  styles.satRow,
                  index < AVAILABLE_SATELLITES.length - 1 && styles.satRowBorder,
                ]}
                onPress={() => handleToggleSatellite(sat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.satIcon}>{sat.icon}</Text>
                <View style={styles.satInfo}>
                  <Text style={styles.satName}>{sat.name}</Text>
                  <Text style={styles.satNorad}>NORAD: {sat.noradId}</Text>
                </View>
                <View style={[styles.satCheck, isSelected && styles.satCheckActive]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Units Section */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(0, 180, 216, 0.15)' }]}>
            <Ionicons name="speedometer" size={18} color="#00B4D8" />
          </View>
          <Text style={styles.sectionTitle}>Units</Text>
        </View>

        <View style={styles.card}>
          {/* Speed */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Speed</Text>
            </View>
            <View style={styles.segmentedControl}>
              {SPEED_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.segmentBtn,
                    settings.units?.speed === opt.key && styles.segmentBtnActive,
                  ]}
                  onPress={() => handleSpeedUnit(opt.key)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      settings.units?.speed === opt.key && styles.segmentTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Altitude */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Altitude</Text>
            </View>
            <View style={styles.segmentedControl}>
              {ALTITUDE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.segmentBtn,
                    settings.units?.altitude === opt.key && styles.segmentBtnActive,
                  ]}
                  onPress={() => handleAltitudeUnit(opt.key)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      settings.units?.altitude === opt.key && styles.segmentTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(108, 99, 255, 0.15)' }]}>
            <Ionicons name="color-palette" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Appearance</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.themeBtn,
                  settings.theme === opt.key && styles.themeBtnActive,
                ]}
                onPress={() => handleTheme(opt.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={settings.theme === opt.key ? COLORS.primary : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.themeText,
                    settings.theme === opt.key && styles.themeTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(255, 170, 0, 0.15)' }]}>
            <Ionicons name="information-circle" size={18} color="#FFAA00" />
          </View>
          <Text style={styles.sectionTitle}>About</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>3.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>AI Engine</Text>
            <Text style={styles.aboutValue}>Ollama (llama3)</Text>
          </View>
          <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.aboutLabel}>Data Sources</Text>
            <Text style={styles.aboutValue}>N2YO · NASA · Open Notify</Text>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Ionicons name="refresh-circle-outline" size={20} color={COLORS.error} />
          <Text style={styles.resetText}>Reset to Defaults</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.small,
    marginTop: 2,
  },

  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  countPill: {
    backgroundColor: 'rgba(0, 214, 143, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 214, 143, 0.3)',
  },
  countPillText: {
    color: '#00D68F',
    fontSize: 11,
    fontWeight: '800',
  },

  // Card
  card: {
    backgroundColor: 'rgba(21, 24, 41, 0.6)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
  },

  // Setting Rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  settingInfo: { flex: 1, marginRight: SPACING.md },
  settingLabel: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  settingDesc: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.small,
    marginTop: 2,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.body,
    fontWeight: '800',
    minWidth: 36,
    textAlign: 'center',
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
  },
  segmentBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
  },
  segmentText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // Satellite Rows
  satRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  satRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  satIcon: { fontSize: 22 },
  satInfo: { flex: 1 },
  satName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  satNorad: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.caption || 11,
    marginTop: 1,
  },
  satCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  satCheckActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  // Theme
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
  },
  themeBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  themeBtnActive: {
    borderColor: 'rgba(108, 99, 255, 0.3)',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  themeText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
  },
  themeTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // About
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  aboutLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
  aboutValue: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },

  // Reset
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.xl,
    gap: 8,
  },
  resetText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
  },
});
