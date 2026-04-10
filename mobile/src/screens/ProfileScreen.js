import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../styles/theme';
import { issAPI } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuth();
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.location) {
      setLocation(user.location.city || 'Unknown');
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpdateLocation = async () => {
    setLoading(true);
    try {
      const result = await updateProfile({
        location: { city: location },
      });
      if (result.success) {
        Alert.alert('Success', 'Location updated', [{ text: 'OK' }]);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.avatar}
          >
            <Ionicons name="person" size={48} color="#fff" />
          </LinearGradient>
          <Text style={styles.name}>{user?.name || 'Space Explorer'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        {/* ISS Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Location</Text>
          <View style={styles.locationInputContainer}>
            <TouchableOpacity style={styles.locationButton}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.locationText}>{location}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.locationUpdateBtn} onPress={handleUpdateLocation}>
              <Ionicons name="save-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.settingContent}>
              <Ionicons name="moon-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.settingContent}>
              <Ionicons name="language-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.settingText}>Units & Locale</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('AstronautLife')}>
            <View style={styles.settingContent}>
              <Ionicons name="body-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.settingText}>Astronaut Life</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.settingContent}>
              <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.settingText}>All Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Space Stats</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="share-outline" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Saved Alerts</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubbles-outline" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Questions Asked</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xl }}>
          <Text style={styles.versionText}>Space-Eye v3.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  name: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: 'rgba(21, 24, 41, 0.6)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgTertiary,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  locationText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  locationUpdateBtn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  settingText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.xl,
  },
  logoutText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  versionText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
