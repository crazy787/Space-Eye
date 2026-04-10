import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/common/GlassCard';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../styles/theme';
import useISSPosition from '../hooks/useISSPosition';

const { width, height } = Dimensions.get('window');

// Dark space map style
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0B0D17' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#151829' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B6F8D' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0E1525' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#151829' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1E2140' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1A1D35' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#252847' }] },
];

export default function ISSTrackerScreen() {
  const { position, loading, error, history, refresh } = useISSPosition(5000);
  const [mapFollowing, setMapFollowing] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for ISS marker
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Auto-center map on ISS
  useEffect(() => {
    if (position && mapFollowing && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 40,
          longitudeDelta: 40,
        },
        500
      );
    }
  }, [position, mapFollowing]);

  const orbitCoords = history.map((h) => ({
    latitude: h.lat,
    longitude: h.lng,
  }));

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude: position?.latitude || 0,
          longitude: position?.longitude || 0,
          latitudeDelta: 50,
          longitudeDelta: 50,
        }}
        onPanDrag={() => setMapFollowing(false)}
      >
        {/* Orbit Trail */}
        {orbitCoords.length > 1 && (
          <Polyline
            coordinates={orbitCoords}
            strokeColor={COLORS.orbitColor}
            strokeWidth={2}
            lineDashPattern={[8, 4]}
          />
        )}

        {/* ISS Marker */}
        {position && (
          <Marker
            coordinate={{
              latitude: position.latitude,
              longitude: position.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.issMarker}>
              <View style={styles.issMarkerOuter} />
              <View style={styles.issMarkerInner}>
                <Text style={styles.issMarkerEmoji}>🛰️</Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <LinearGradient
          colors={['rgba(11, 13, 23, 0.95)', 'rgba(11, 13, 23, 0)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>ISS Tracker</Text>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Real-time</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.actionBtn, mapFollowing && styles.actionBtnActive]}
                onPress={() => setMapFollowing(!mapFollowing)}
              >
                <Ionicons
                  name={mapFollowing ? 'locate' : 'locate-outline'}
                  size={20}
                  color={mapFollowing ? COLORS.primary : COLORS.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={refresh}>
                <Ionicons name="refresh" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Bottom Stats Panel */}
      {showStats && position && (
        <View style={styles.statsPanel}>
          <GlassCard style={styles.statsCard}>
            <TouchableOpacity
              style={styles.statsToggle}
              onPress={() => setShowStats(false)}
            >
              <View style={styles.statsHandle} />
            </TouchableOpacity>

            <View style={styles.statsGrid}>
              <StatItem label="LATITUDE" value={`${position.latitude?.toFixed(4)}°`} icon="location" />
              <StatItem label="LONGITUDE" value={`${position.longitude?.toFixed(4)}°`} icon="navigate" />
              <StatItem label="ALTITUDE" value="408 km" icon="resize" />
              <StatItem label="SPEED" value="27,600 km/h" icon="speedometer" />
              <StatItem label="REGION" value={position.region || '—'} icon="earth" />
              <StatItem
                label="VISIBILITY"
                value={position.isNighttime ? 'Possible' : 'Daytime'}
                icon={position.isNighttime ? 'moon' : 'sunny'}
                valueColor={position.isNighttime ? COLORS.issColor : COLORS.warning}
              />
            </View>
          </GlassCard>
        </View>
      )}

      {/* Show stats button when hidden */}
      {!showStats && (
        <TouchableOpacity
          style={styles.showStatsBtn}
          onPress={() => setShowStats(true)}
        >
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.showStatsBtnGradient}>
            <Ionicons name="stats-chart" size={18} color={COLORS.textPrimary} />
            <Text style={styles.showStatsText}>Stats</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
    </View>
  );
}

function StatItem({ label, value, icon, valueColor }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIcon}>
        <Ionicons name={`${icon}-outline`} size={16} color={COLORS.primary} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor && { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Header
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.issColor,
    marginRight: 6,
  },
  liveText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.issColor,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(21, 24, 41, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
  },

  // ISS Marker
  issMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  issMarkerOuter: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.issColor,
    opacity: 0.3,
  },
  issMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 214, 143, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.issColor,
  },
  issMarkerEmoji: {
    fontSize: 18,
  },

  // Stats Panel
  statsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  statsCard: {
    paddingTop: SPACING.sm,
  },
  statsToggle: {
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  statsHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Show Stats Button
  showStatsBtn: {
    position: 'absolute',
    bottom: SPACING.xl,
    alignSelf: 'center',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  showStatsBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  showStatsText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: FONT_SIZES.body,
  },

  // Error
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 61, 113, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    textAlign: 'center',
  },
});
