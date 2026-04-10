import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/common/GlassCard';
import GradientButton from '../components/common/GradientButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../styles/theme';
import useLocation from '../hooks/useLocation';
import { alertAPI } from '../services/api';

export default function AlertsScreen() {
  const { location, loading: locationLoading } = useLocation();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      fetchPasses();
    }
  }, [location]);

  const fetchPasses = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const response = await alertAPI.getPasses(location.latitude, location.longitude);
      if (response.success) {
        setPasses(response.data.passes || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pass predictions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPasses();
    setRefreshing(false);
  };

  const getPassQuality = (maxEl) => {
    if (maxEl >= 60) return { label: 'Excellent', color: COLORS.issColor, icon: 'star' };
    if (maxEl >= 30) return { label: 'Good', color: COLORS.warning, icon: 'star-half' };
    return { label: 'Fair', color: COLORS.textMuted, icon: 'star-outline' };
  };

  const formatPassDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (locationLoading) {
    return <LoadingSpinner message="Getting your location..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(11, 13, 23, 1)', 'rgba(11, 13, 23, 0.95)']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>ISS Pass Alerts</Text>
        <Text style={styles.headerSubtitle}>
          {location
            ? `📍 ${location.city || `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`}`
            : 'Location unavailable'}
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Info Card */}
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>When can you see the ISS?</Text>
              <Text style={styles.infoText}>
                The ISS is visible at dawn and dusk when it reflects sunlight. Look for a bright, fast-moving "star"!
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <GradientButton
              title="Retry"
              onPress={fetchPasses}
              size="sm"
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        )}

        {/* Loading */}
        {loading && !refreshing && (
          <LoadingSpinner message="Finding ISS passes..." fullScreen={false} />
        )}

        {/* Passes List */}
        {!loading && passes.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Passes</Text>
              <View style={styles.passBadge}>
                <Text style={styles.passCount}>{passes.length} found</Text>
              </View>
            </View>

            {passes.map((pass, index) => {
              const quality = getPassQuality(pass.maxElevation);
              return (
                <GlassCard key={index} style={styles.passCard}>
                  {/* Pass Header */}
                  <View style={styles.passHeader}>
                    <View>
                      <Text style={styles.passDate}>{formatPassDate(pass.startTime)}</Text>
                      <Text style={styles.passTime}>{formatTime(pass.startTime)}</Text>
                    </View>
                    <View style={[styles.qualityBadge, { backgroundColor: quality.color + '20' }]}>
                      <Ionicons name={quality.icon} size={12} color={quality.color} />
                      <Text style={[styles.qualityText, { color: quality.color }]}>{quality.label}</Text>
                    </View>
                  </View>

                  {/* Pass Details */}
                  <View style={styles.passDetails}>
                    <View style={styles.passDetailItem}>
                      <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                      <Text style={styles.passDetailLabel}>Duration</Text>
                      <Text style={styles.passDetailValue}>{pass.durationFormatted}</Text>
                    </View>
                    <View style={styles.passDetailItem}>
                      <Ionicons name="trending-up-outline" size={16} color={COLORS.textMuted} />
                      <Text style={styles.passDetailLabel}>Max Elevation</Text>
                      <Text style={styles.passDetailValue}>{pass.maxElevation}°</Text>
                    </View>
                    <View style={styles.passDetailItem}>
                      <Ionicons name="sunny-outline" size={16} color={COLORS.textMuted} />
                      <Text style={styles.passDetailLabel}>Brightness</Text>
                      <Text style={styles.passDetailValue}>{pass.magnitude || '—'} mag</Text>
                    </View>
                  </View>

                  {/* Direction */}
                  <View style={styles.directionRow}>
                    <View style={styles.directionItem}>
                      <Text style={styles.directionLabel}>Appears</Text>
                      <View style={styles.directionBadge}>
                        <Ionicons name="compass-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.directionValue}>{pass.startDirection}</Text>
                      </View>
                    </View>
                    <View style={styles.directionArrow}>
                      <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
                    </View>
                    <View style={styles.directionItem}>
                      <Text style={styles.directionLabel}>Disappears</Text>
                      <View style={styles.directionBadge}>
                        <Ionicons name="compass-outline" size={14} color={COLORS.accent} />
                        <Text style={styles.directionValue}>{pass.endDirection}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Countdown */}
                  {pass.timeUntil?.totalMinutes > 0 && (
                    <View style={styles.countdownRow}>
                      <Ionicons name="hourglass-outline" size={14} color={COLORS.issColor} />
                      <Text style={styles.countdownText}>
                        in {pass.timeUntil.hours > 0 ? `${pass.timeUntil.hours}h ` : ''}{pass.timeUntil.minutes}m
                      </Text>
                    </View>
                  )}
                </GlassCard>
              );
            })}
          </View>
        )}

        {/* No passes */}
        {!loading && passes.length === 0 && !error && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={styles.emptyTitle}>No visible passes found</Text>
            <Text style={styles.emptyDesc}>
              Check back later — ISS passes depend on your location, time, and weather conditions.
            </Text>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    paddingTop: 56,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Info card
  infoCard: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Error
  errorCard: {
    backgroundColor: 'rgba(255, 61, 113, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 61, 113, 0.2)',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.body,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  passBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  passCount: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Pass Card
  passCard: {
    marginBottom: SPACING.sm,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  passDate: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passTime: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    gap: 4,
  },
  qualityText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '700',
  },

  // Pass Details
  passDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  passDetailItem: {
    alignItems: 'center',
    gap: 4,
  },
  passDetailLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passDetailValue: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // Direction
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  directionItem: {
    flex: 1,
    alignItems: 'center',
  },
  directionLabel: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  directionValue: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  directionArrow: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  // Countdown
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    gap: 6,
  },
  countdownText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.issColor,
    fontWeight: '600',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyDesc: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
  },
});
