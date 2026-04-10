import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';
import { satelliteAPI, issAPI } from '../services/api';
import useLocation from '../hooks/useLocation';

const { width, height } = Dimensions.get('window');

const POPULAR_SATS = [
  { name: 'ISS', noradId: 25544, icon: '🛰️', color: '#00e5ff', desc: 'International Space Station' },
  { name: 'Hubble', noradId: 20580, icon: '🔭', color: '#ce93d8', desc: 'Space Telescope' },
  { name: 'Tiangong', noradId: 48274, icon: '🇨🇳', color: '#ff7043', desc: 'Chinese Space Station' },
  { name: 'NOAA 19', noradId: 33591, icon: '🌤️', color: '#4fc3f7', desc: 'Weather Satellite' },
  { name: 'Terra', noradId: 25994, icon: '🌍', color: '#66bb6a', desc: 'Earth Observing System' },
  { name: 'Landsat 9', noradId: 49260, icon: '📸', color: '#ffd54f', desc: 'Earth Imaging' },
];

const SAT_CATEGORIES = [
  { name: 'All', id: 0, icon: '🌐' },
  { name: 'Brightest', id: 1, icon: '✨' },
  { name: 'Weather', id: 3, icon: '🌤️' },
  { name: 'GPS', id: 20, icon: '📡' },
  { name: 'Starlink', id: 52, icon: '⭐' },
  { name: 'Science', id: 8, icon: '🔬' },
];

export default function SatelliteTrackerScreen({ navigation }) {
  const { location } = useLocation();
  const [trackedSats, setTrackedSats] = useState([POPULAR_SATS[0]]);
  const [satPositions, setSatPositions] = useState({});
  const [nearbySats, setNearbySats] = useState([]);
  const [selectedSat, setSelectedSat] = useState(POPULAR_SATS[0]);
  const [activeTab, setActiveTab] = useState('track');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // Poll positions for tracked satellites
  useEffect(() => {
    const fetchPositions = async () => {
      const lat = location?.latitude || 0;
      const lng = location?.longitude || 0;
      const results = {};
      const promises = trackedSats.map(async (sat) => {
        try {
          const res = await satelliteAPI.getPosition(sat.noradId, lat, lng);
          if (res.data?.positions?.length > 0) {
            const pos = res.data.positions[0];
            results[sat.noradId] = {
              latitude: pos.satlatitude,
              longitude: pos.satlongitude,
              altitude: pos.sataltitude,
              azimuth: pos.azimuth,
              elevation: pos.elevation,
              timestamp: pos.timestamp,
            };
          }
        } catch (e) {
          console.warn(`Position fetch failed for ${sat.name}:`, e.message);
        }
      });
      await Promise.allSettled(promises);
      setSatPositions(prev => ({ ...prev, ...results }));
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 8000);
    return () => clearInterval(interval);
  }, [trackedSats, location]);

  // Fetch nearby satellites
  const fetchNearby = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const res = await satelliteAPI.getAbove(
        location.latitude, location.longitude, 70, selectedCategory
      );
      setNearbySats(res.data?.satellites || []);
    } catch (e) {
      console.warn('Nearby satellites error:', e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'nearby' && location) fetchNearby();
  }, [activeTab, selectedCategory, location]);

  const toggleTrack = (sat) => {
    setTrackedSats(prev => {
      const exists = prev.find(s => s.noradId === sat.noradId);
      if (exists) return prev.filter(s => s.noradId !== sat.noradId);
      return [...prev, sat];
    });
  };

  const isTracked = (noradId) => trackedSats.some(s => s.noradId === noradId);

  const focusSat = (noradId) => {
    const pos = satPositions[noradId];
    if (pos && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: pos.latitude,
        longitude: pos.longitude,
        latitudeDelta: 15,
        longitudeDelta: 15,
      }, 800);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#000814', '#001020', '#001830']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Multi-Satellite Tracker</Text>
          <Text style={styles.headerSub}>{trackedSats.length} satellite{trackedSats.length !== 1 ? 's' : ''} tracked</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchNearby}>
          <Ionicons name="refresh" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </Animated.View>

      {/* Tab selector */}
      <Animated.View style={[styles.tabRow, { opacity: fadeAnim }]}>
        {['track', 'nearby', 'catalog'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'track' ? '🛰️ Tracking' : tab === 'nearby' ? '📡 Nearby' : '📋 Catalog'}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {activeTab === 'track' ? (
        <View style={styles.trackView}>
          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={{ latitude: 20, longitude: 0, latitudeDelta: 80, longitudeDelta: 80 }}
              mapType="standard"
              customMapStyle={darkMapStyle}
            >
              {/* User location */}
              {location && (
                <Circle
                  center={{ latitude: location.latitude, longitude: location.longitude }}
                  radius={200000}
                  strokeColor="rgba(108,99,255,0.5)"
                  fillColor="rgba(108,99,255,0.1)"
                />
              )}

              {/* Satellite markers */}
              {trackedSats.map(sat => {
                const pos = satPositions[sat.noradId];
                if (!pos) return null;
                return (
                  <Marker
                    key={sat.noradId}
                    coordinate={{ latitude: pos.latitude, longitude: pos.longitude }}
                    title={sat.name}
                    description={`Alt: ${pos.altitude?.toFixed(1)} km`}
                    onPress={() => setSelectedSat(sat)}
                  >
                    <View style={[styles.satMarker, { borderColor: sat.color }]}>
                      <Text style={styles.satMarkerIcon}>{sat.icon}</Text>
                    </View>
                  </Marker>
                );
              })}
            </MapView>

            {/* Satellite chips overlay */}
            <ScrollView
              horizontal
              style={styles.satChipsOverlay}
              contentContainerStyle={styles.satChipsContent}
              showsHorizontalScrollIndicator={false}
            >
              {trackedSats.map(sat => {
                const pos = satPositions[sat.noradId];
                return (
                  <TouchableOpacity
                    key={sat.noradId}
                    style={[styles.satChip, selectedSat?.noradId === sat.noradId && { borderColor: sat.color, backgroundColor: sat.color + '20' }]}
                    onPress={() => { setSelectedSat(sat); focusSat(sat.noradId); }}
                  >
                    <Text style={styles.satChipIcon}>{sat.icon}</Text>
                    <View>
                      <Text style={[styles.satChipName, { color: sat.color }]}>{sat.name}</Text>
                      {pos ? (
                        <Text style={styles.satChipPos}>
                          {pos.latitude?.toFixed(1)}°, {pos.longitude?.toFixed(1)}°
                        </Text>
                      ) : (
                        <Text style={styles.satChipPos}>Acquiring...</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Satellite info panel */}
          {selectedSat && satPositions[selectedSat.noradId] && (
            <Animated.View style={[styles.infoPanel, { opacity: fadeAnim }]}>
              <View style={styles.infoPanelHeader}>
                <Text style={styles.infoPanelIcon}>{selectedSat.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoPanelName, { color: selectedSat.color }]}>{selectedSat.name}</Text>
                  <Text style={styles.infoPanelDesc}>{selectedSat.desc}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleTrack(selectedSat)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.statsRow}>
                {[
                  { label: 'LAT', value: satPositions[selectedSat.noradId]?.latitude?.toFixed(2) + '°', icon: 'location' },
                  { label: 'LNG', value: satPositions[selectedSat.noradId]?.longitude?.toFixed(2) + '°', icon: 'compass' },
                  { label: 'ALT', value: satPositions[selectedSat.noradId]?.altitude?.toFixed(0) + ' km', icon: 'arrow-up' },
                  { label: 'AZ', value: satPositions[selectedSat.noradId]?.azimuth?.toFixed(1) + '°', icon: 'navigate' },
                ].map((stat, i) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={[styles.statValue, { color: selectedSat.color }]}>{stat.value}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Add satellite button */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addSatRow} contentContainerStyle={styles.addSatContent}>
            {POPULAR_SATS.filter(s => !isTracked(s.noradId)).map(sat => (
              <TouchableOpacity key={sat.noradId} style={[styles.addSatChip, { borderColor: sat.color + '40' }]} onPress={() => toggleTrack(sat)}>
                <Ionicons name="add" size={14} color={sat.color} />
                <Text style={[styles.addSatText, { color: sat.color }]}>{sat.icon} {sat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : activeTab === 'nearby' ? (
        <View style={{ flex: 1 }}>
          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catContent}>
            {SAT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catText, selectedCategory === cat.id && styles.catTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={nearbySats.slice(0, 50)}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNearby} tintColor={COLORS.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="satellite-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>
                  {location ? 'No satellites found. Try a different category.' : 'Enable location to find nearby satellites.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.nearbyCard}
                onPress={() => {
                  const sat = { name: item.name, noradId: item.id, icon: '🛰️', color: '#00e5ff', desc: `NORAD ${item.id}` };
                  toggleTrack(sat);
                  setActiveTab('track');
                }}
              >
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyName}>{item.name}</Text>
                  <Text style={styles.nearbyId}>NORAD: {item.id}</Text>
                  <Text style={styles.nearbyCoords}>
                    {item.latitude?.toFixed(2)}°, {item.longitude?.toFixed(2)}° — {item.altitude?.toFixed(0)} km
                  </Text>
                </View>
                <View style={styles.trackBtnMini}>
                  <Ionicons
                    name={isTracked(item.id) ? 'checkmark-circle' : 'add-circle-outline'}
                    size={22}
                    color={isTracked(item.id) ? '#00e5ff' : COLORS.textMuted}
                  />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.catalogContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.catalogTitle}>Popular Satellites</Text>
          <Text style={styles.catalogSub}>Tap to start tracking</Text>
          {POPULAR_SATS.map(sat => (
            <TouchableOpacity
              key={sat.noradId}
              style={[styles.catalogCard, { borderColor: sat.color + '30' }]}
              onPress={() => { toggleTrack(sat); setActiveTab('track'); }}
            >
              <LinearGradient colors={[sat.color + '15', 'transparent']} style={styles.catalogCardGrad}>
                <Text style={styles.catalogIcon}>{sat.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catalogName, { color: sat.color }]}>{sat.name}</Text>
                  <Text style={styles.catalogDesc}>{sat.desc}</Text>
                  <Text style={styles.catalogNorad}>NORAD: {sat.noradId}</Text>
                </View>
                <View style={[styles.trackBadge, isTracked(sat.noradId) && { backgroundColor: sat.color + '30', borderColor: sat.color }]}>
                  <Ionicons
                    name={isTracked(sat.noradId) ? 'checkmark' : 'add'}
                    size={16}
                    color={isTracked(sat.noradId) ? sat.color : COLORS.textMuted}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4e6d8c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1929' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0d1a2d' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000814' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  headerSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, letterSpacing: 1 },
  tabRow: { flexDirection: 'row', marginHorizontal: SPACING.md, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 3, marginBottom: SPACING.sm },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  tabText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  trackView: { flex: 1 },
  mapContainer: { flex: 1, margin: SPACING.sm, borderRadius: 20, overflow: 'hidden' },
  satMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,10,20,0.85)', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  satMarkerIcon: { fontSize: 16 },
  satChipsOverlay: { position: 'absolute', top: 10, left: 0, right: 0, maxHeight: 56 },
  satChipsContent: { paddingHorizontal: 10, gap: 8 },
  satChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(0,10,20,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  satChipIcon: { fontSize: 16 },
  satChipName: { fontSize: 12, fontWeight: '700' },
  satChipPos: { color: COLORS.textMuted, fontSize: 10, fontVariant: ['tabular-nums'] },
  infoPanel: { marginHorizontal: SPACING.sm, backgroundColor: 'rgba(0,10,30,0.9)', borderRadius: 16, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(0,229,255,0.15)' },
  infoPanelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoPanelIcon: { fontSize: 28 },
  infoPanelName: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  infoPanelDesc: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 2 },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  addSatRow: { maxHeight: 44, marginVertical: SPACING.sm },
  addSatContent: { paddingHorizontal: SPACING.md, gap: 8 },
  addSatChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  addSatText: { fontSize: 12, fontWeight: '600' },
  catRow: { maxHeight: 50, marginBottom: SPACING.sm },
  catContent: { paddingHorizontal: SPACING.md, gap: 8, alignItems: 'center' },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  catChipActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderColor: 'rgba(0,229,255,0.4)' },
  catIcon: { fontSize: 14 },
  catText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  catTextActive: { color: COLORS.primary },
  nearbyCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: SPACING.md, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  nearbyInfo: { flex: 1 },
  nearbyName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  nearbyId: { color: COLORS.textMuted, fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
  nearbyCoords: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2, fontVariant: ['tabular-nums'] },
  trackBtnMini: { marginLeft: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, textAlign: 'center', maxWidth: 240 },
  catalogContainer: { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  catalogTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: 4 },
  catalogSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, marginBottom: SPACING.md },
  catalogCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginBottom: SPACING.sm },
  catalogCardGrad: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  catalogIcon: { fontSize: 30 },
  catalogName: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  catalogDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  catalogNorad: { color: COLORS.textMuted, fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
  trackBadge: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
});
