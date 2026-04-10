import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';
import useLocation from '../hooks/useLocation';

const { width, height } = Dimensions.get('window');

// Star catalog — bright visible stars with real coordinates
const STAR_CATALOG = [
  { name: 'Sirius', ra: 101.29, dec: -16.72, mag: -1.46, constellation: 'Canis Major', color: '#a0c4ff' },
  { name: 'Canopus', ra: 95.99, dec: -52.70, mag: -0.74, constellation: 'Carina', color: '#fff4cc' },
  { name: 'Arcturus', ra: 213.92, dec: 19.18, mag: -0.05, constellation: 'Boötes', color: '#ffcc80' },
  { name: 'Vega', ra: 279.23, dec: 38.78, mag: 0.03, constellation: 'Lyra', color: '#a0c4ff' },
  { name: 'Capella', ra: 79.17, dec: 46.00, mag: 0.08, constellation: 'Auriga', color: '#fff4cc' },
  { name: 'Rigel', ra: 78.63, dec: -8.20, mag: 0.13, constellation: 'Orion', color: '#b3d9ff' },
  { name: 'Betelgeuse', ra: 88.79, dec: 7.41, mag: 0.42, constellation: 'Orion', color: '#ff8a65' },
  { name: 'Altair', ra: 297.70, dec: 8.87, mag: 0.77, constellation: 'Aquila', color: '#ffffff' },
  { name: 'Aldebaran', ra: 68.98, dec: 16.51, mag: 0.86, constellation: 'Taurus', color: '#ffab91' },
  { name: 'Spica', ra: 201.30, dec: -11.16, mag: 1.04, constellation: 'Virgo', color: '#90caf9' },
  { name: 'Antares', ra: 247.35, dec: -26.43, mag: 1.09, constellation: 'Scorpius', color: '#ef5350' },
  { name: 'Pollux', ra: 116.33, dec: 28.03, mag: 1.15, constellation: 'Gemini', color: '#ffcc80' },
  { name: 'Fomalhaut', ra: 344.41, dec: -29.62, mag: 1.16, constellation: 'Piscis Australis', color: '#bbdefb' },
  { name: 'Deneb', ra: 310.36, dec: 45.28, mag: 1.25, constellation: 'Cygnus', color: '#e3f2fd' },
  { name: 'Regulus', ra: 152.09, dec: 11.97, mag: 1.40, constellation: 'Leo', color: '#90caf9' },
  { name: 'Castor', ra: 113.65, dec: 31.89, mag: 1.58, constellation: 'Gemini', color: '#e3f2fd' },
  { name: 'Bellatrix', ra: 81.28, dec: 6.35, mag: 1.64, constellation: 'Orion', color: '#bbdefb' },
  { name: 'Polaris', ra: 37.95, dec: 89.26, mag: 1.97, constellation: 'Ursa Minor', color: '#fff9c4' },
];

// Constellation patterns for Orion (belt + shoulders + feet)
const CONSTELLATIONS = [
  {
    name: 'Orion',
    lines: [
      ['Betelgeuse', 'Bellatrix'],
      ['Rigel', 'Bellatrix'],
      ['Betelgeuse', 'Rigel'],
    ],
  },
  {
    name: 'Summer Triangle',
    lines: [
      ['Vega', 'Deneb'],
      ['Deneb', 'Altair'],
      ['Altair', 'Vega'],
    ],
  },
];

const PLANETS = [
  { name: 'Mars', icon: '🔴', color: '#ff5722', desc: 'The Red Planet', distance: '225M km', facts: ['Has the tallest volcano: Olympus Mons', 'A day is ~24h 37min', '2 moons: Phobos & Deimos'] },
  { name: 'Jupiter', icon: '🟤', color: '#ff9800', desc: 'Gas Giant King', distance: '778M km', facts: ['Largest planet in solar system', 'Great Red Spot storm for 350+ years', '95 known moons'] },
  { name: 'Saturn', icon: '🪐', color: '#ffd54f', desc: 'The Ringed Beauty', distance: '1.4B km', facts: ['Rings span 282,000 km wide', 'Could float on water (if you found a big enough tub)', '146 known moons'] },
  { name: 'Venus', icon: '🌕', color: '#ffab91', desc: 'Morning Star', distance: '108M km', facts: ['Hottest planet: ~465°C', 'Rotates backwards', 'A day is longer than its year'] },
  { name: 'Mercury', icon: '⚫', color: '#90a4ae', desc: 'The Swift Planet', distance: '58M km', facts: ['Smallest planet', 'Extreme temps: -180°C to 430°C', 'No atmosphere, no moons'] },
  { name: 'Neptune', icon: '🔵', color: '#42a5f5', desc: 'Ice Giant', distance: '4.5B km', facts: ['Fastest winds: 2,100 km/h', 'Takes 165 years to orbit Sun', 'Has 16 moons'] },
];

export default function TelescopeScreen({ navigation }) {
  const { location } = useLocation();
  const [selectedStar, setSelectedStar] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [viewMode, setViewMode] = useState('sky'); // sky | planets
  const [showConstLines, setShowConstLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const lastPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => viewMode === 'sky',
    onPanResponderGrant: () => {
      panX.extractOffset();
      panY.extractOffset();
    },
    onPanResponderMove: Animated.event([null, { dx: panX, dy: panY }], { useNativeDriver: false }),
    onPanResponderRelease: () => {
      panX.flattenOffset();
      panY.flattenOffset();
    },
  });

  // Map RA/Dec to screen positions
  const starScreenPos = useMemo(() => {
    return STAR_CATALOG.map(star => {
      const x = ((star.ra / 360) * width * 3);
      const y = ((90 - star.dec) / 180) * height * 1.5;
      const size = Math.max(3, 8 - star.mag * 2);
      return { ...star, x, y, size };
    });
  }, []);

  const getStarByName = (name) => starScreenPos.find(s => s.name === name);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#000005', '#000510', '#000a1e']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Telescope</Text>
          <Text style={styles.headerSub}>Star Map & Planets</Text>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowLabels(!showLabels)}>
            <Ionicons name={showLabels ? 'text' : 'text-outline'} size={18} color={showLabels ? COLORS.primary : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* View Mode Tabs */}
      <Animated.View style={[styles.tabRow, { opacity: fadeAnim }]}>
        {['sky', 'planets'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, viewMode === tab && styles.tabActive]}
            onPress={() => { setViewMode(tab); setSelectedStar(null); setSelectedPlanet(null); }}
          >
            <Text style={[styles.tabText, viewMode === tab && styles.tabTextActive]}>
              {tab === 'sky' ? '⭐ Night Sky' : '🪐 Planets'}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {viewMode === 'sky' ? (
        <>
          {/* Sky canvas */}
          <Animated.View
            style={[styles.skyCanvas, { transform: [{ translateX: panX }, { translateY: panY }, { scale: zoom }] }]}
            {...panResponder.panHandlers}
          >
            {/* Background stars (faint random) */}
            {Array.from({ length: 150 }).map((_, i) => (
              <View
                key={`bg-${i}`}
                style={[styles.bgStar, {
                  left: Math.random() * width * 3,
                  top: Math.random() * height * 2,
                  width: Math.random() * 1.5 + 0.5,
                  height: Math.random() * 1.5 + 0.5,
                  opacity: Math.random() * 0.4 + 0.1,
                }]}
              />
            ))}

            {/* Constellation lines */}
            {showConstLines && CONSTELLATIONS.map(c => (
              c.lines.map(([from, to], li) => {
                const s1 = getStarByName(from);
                const s2 = getStarByName(to);
                if (!s1 || !s2) return null;
                const dx = s2.x - s1.x;
                const dy = s2.y - s1.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                  <View
                    key={`${c.name}-${li}`}
                    style={[styles.constLine, {
                      left: s1.x,
                      top: s1.y,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                    }]}
                  />
                );
              })
            ))}

            {/* Stars */}
            {starScreenPos.map(star => (
              <TouchableOpacity
                key={star.name}
                style={[styles.starDot, {
                  left: star.x - star.size / 2,
                  top: star.y - star.size / 2,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size / 2,
                  backgroundColor: star.color,
                  shadowColor: star.color,
                  shadowRadius: star.size,
                  shadowOpacity: 0.8,
                }]}
                onPress={() => setSelectedStar(star)}
              >
                {showLabels && star.mag < 1.0 && (
                  <Text style={styles.starLabel}>{star.name}</Text>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Zoom controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setZoom(z => Math.min(z + 0.3, 3))}>
              <Ionicons name="add" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setZoom(z => Math.max(z - 0.3, 0.5))}>
              <Ionicons name="remove" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Drag hint */}
          <View style={styles.dragHint}>
            <Ionicons name="hand-left-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.dragText}>Drag to pan • Tap stars for info</Text>
          </View>

          {/* Star detail */}
          {selectedStar && (
            <Animated.View style={[styles.detailCard, { opacity: fadeAnim }]}>
              <TouchableOpacity style={styles.detailClose} onPress={() => setSelectedStar(null)}>
                <Ionicons name="close" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
              <View style={[styles.detailGlow, { backgroundColor: selectedStar.color + '20' }]} />
              <View style={styles.detailHeader}>
                <View style={[styles.detailDot, { backgroundColor: selectedStar.color }]} />
                <Text style={[styles.detailName, { color: selectedStar.color }]}>{selectedStar.name}</Text>
              </View>
              <View style={styles.detailStats}>
                {[
                  { label: 'Constellation', value: selectedStar.constellation },
                  { label: 'Magnitude', value: selectedStar.mag.toFixed(2) },
                  { label: 'RA', value: selectedStar.ra.toFixed(2) + '°' },
                  { label: 'Dec', value: selectedStar.dec.toFixed(2) + '°' },
                ].map((s, i) => (
                  <View key={i} style={styles.detailStat}>
                    <Text style={styles.detailStatLabel}>{s.label}</Text>
                    <Text style={styles.detailStatValue}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.planetsContainer} showsVerticalScrollIndicator={false}>
          {PLANETS.map((planet) => (
            <TouchableOpacity
              key={planet.name}
              style={[styles.planetCard, { borderColor: planet.color + '40' }]}
              onPress={() => setSelectedPlanet(selectedPlanet?.name === planet.name ? null : planet)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[planet.color + '15', planet.color + '05']} style={styles.planetCardInner}>
                <View style={styles.planetHeader}>
                  <Text style={styles.planetIcon}>{planet.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planetName, { color: planet.color }]}>{planet.name}</Text>
                    <Text style={styles.planetDesc}>{planet.desc}</Text>
                  </View>
                  <View style={styles.planetDistance}>
                    <Text style={styles.planetDistValue}>{planet.distance}</Text>
                    <Text style={styles.planetDistLabel}>from Sun</Text>
                  </View>
                </View>

                {selectedPlanet?.name === planet.name && (
                  <Animated.View style={styles.planetFacts}>
                    {planet.facts.map((f, i) => (
                      <View key={i} style={styles.planetFactRow}>
                        <View style={[styles.planetFactDot, { backgroundColor: planet.color }]} />
                        <Text style={styles.planetFactText}>{f}</Text>
                      </View>
                    ))}
                  </Animated.View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000005' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.title, fontWeight: '700' },
  headerSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.caption, letterSpacing: 1 },
  headerControls: { flexDirection: 'row', gap: 8 },
  controlBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', marginHorizontal: SPACING.md, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 3, marginBottom: SPACING.sm, zIndex: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  tabText: { color: COLORS.textMuted, fontSize: FONT_SIZES.small, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  skyCanvas: { flex: 1, position: 'relative', overflow: 'visible' },
  bgStar: { position: 'absolute', borderRadius: 1, backgroundColor: '#ffffff' },
  constLine: { position: 'absolute', height: 1, backgroundColor: 'rgba(100,150,255,0.15)', transformOrigin: 'left center' },
  starDot: { position: 'absolute', elevation: 6 },
  starLabel: { position: 'absolute', top: -14, left: -10, color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', width: 80 },
  zoomControls: { position: 'absolute', right: SPACING.md, top: height * 0.35, alignItems: 'center', gap: 6 },
  zoomBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  zoomText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  dragHint: { position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dragText: { color: COLORS.textMuted, fontSize: 11 },
  detailCard: { position: 'absolute', bottom: 50, left: SPACING.md, right: SPACING.md, backgroundColor: 'rgba(5,10,25,0.95)', borderRadius: 20, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  detailClose: { position: 'absolute', top: 12, right: 12, zIndex: 5 },
  detailGlow: { position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: 50 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  detailDot: { width: 14, height: 14, borderRadius: 7 },
  detailName: { fontSize: FONT_SIZES.title, fontWeight: '800' },
  detailStats: { flexDirection: 'row', justifyContent: 'space-around' },
  detailStat: { alignItems: 'center' },
  detailStatLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  detailStatValue: { color: COLORS.textPrimary, fontSize: FONT_SIZES.small, fontWeight: '600', marginTop: 2 },
  planetsContainer: { paddingHorizontal: SPACING.md, paddingBottom: 40, gap: SPACING.sm },
  planetCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  planetCardInner: { padding: SPACING.md },
  planetHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  planetIcon: { fontSize: 36 },
  planetName: { fontSize: FONT_SIZES.bodyLarge, fontWeight: '800' },
  planetDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption },
  planetDistance: { alignItems: 'flex-end' },
  planetDistValue: { color: COLORS.textPrimary, fontSize: FONT_SIZES.small, fontWeight: '700' },
  planetDistLabel: { color: COLORS.textMuted, fontSize: 10 },
  planetFacts: { marginTop: SPACING.md, gap: 8 },
  planetFactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planetFactDot: { width: 6, height: 6, borderRadius: 3 },
  planetFactText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, flex: 1 },
});
