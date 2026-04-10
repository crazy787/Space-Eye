import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const ISS_MODULES = [
  {
    id: 'columbus',
    name: 'Columbus Lab',
    flag: '🇪🇺',
    agency: 'ESA',
    description: 'European science laboratory. Houses experiments in material science, fluid physics, and biology in microgravity.',
    color: '#1565c0',
    icon: 'flask',
    facts: ['Launch: 2008', '75 cubic meters of pressurized space', 'Over 225 experiments conducted'],
  },
  {
    id: 'destiny',
    name: 'Destiny Lab',
    flag: '🇺🇸',
    agency: 'NASA',
    description: 'Primary US science lab. The heart of American research on the ISS with 24 equipment racks.',
    color: '#b71c1c',
    icon: 'telescope',
    facts: ['Launch: 2001', '8.4m long, 4.3m wide', 'Home to many life science experiments'],
  },
  {
    id: 'kibo',
    name: 'Kibo Module',
    flag: '🇯🇵',
    agency: 'JAXA',
    description: 'Hope in Japanese. Largest ISS module with its own robot arm and external experiment platform.',
    color: '#880e4f',
    icon: 'star',
    facts: ['Launch: 2008-2009', 'Has external porch for space exposure', 'Unique small satellite launch capability'],
  },
  {
    id: 'zvezda',
    name: 'Zvezda Service',
    flag: '🇷🇺',
    agency: 'Roscosmos',
    description: 'Russian service module. Provides living quarters, life support, and propulsion for the ISS.',
    color: '#4a148c',
    icon: 'home',
    facts: ['Launch: 2000', '13m long core module', 'Controls ISS altitude and orientation'],
  },
  {
    id: 'harmony',
    name: 'Harmony Node',
    flag: '🇺🇸',
    agency: 'NASA',
    description: 'Central connecting hub linking US, European, and Japanese labs with docking adapters.',
    color: '#1b5e20',
    icon: 'git-network',
    facts: ['Launch: 2007', 'Houses crew sleeping quarters', 'Multiple docking ports'],
  },
  {
    id: 'cupola',
    name: 'Cupola',
    flag: '🇪🇺',
    agency: 'ESA',
    description: 'Seven-window observation dome. Provides a 360° panoramic view of Earth and space.',
    color: '#e65100',
    icon: 'eye',
    facts: ['Launch: 2010', '7 windows including largest in space history', 'Used for robotics operations'],
  },
];

// Pannellum-based 360° viewer HTML — uses a real ISS panoramic URL
const TOUR_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>ISS 360 Tour</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    #panorama { width: 100%; height: 100%; }
    .hotspot-label {
      background: rgba(0,10,30,0.85);
      color: #00e5ff;
      padding: 6px 12px;
      border-radius: 20px;
      font-family: -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 700;
      border: 1px solid rgba(0,229,255,0.4);
      white-space: nowrap;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="panorama"></div>
  <script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
  <script>
    pannellum.viewer('panorama', {
      type: 'equirectangular',
      panorama: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/ISS-55_Interior_view_of_the_ISS_on_Expedition_55.jpg/2560px-ISS-55_Interior_view_of_the_ISS_on_Expedition_55.jpg',
      autoLoad: true,
      autoRotate: -2,
      compass: false,
      showControls: true,
      mouseZoom: true,
      hfov: 110,
      pitch: 0,
      yaw: 0,
      hotSpots: [
        {
          pitch: 5,
          yaw: 45,
          type: "info",
          text: "Columbus Lab",
          cssClass: "hotspot-label",
          createTooltipFunc: hotspot => {
            const el = document.createElement('div');
            el.className = 'hotspot-label';
            el.textContent = '🧪 Columbus Lab';
            hotspot.appendChild(el);
          }
        },
        {
          pitch: -10,
          yaw: -90,
          type: "info",
          text: "Cupola View",
          createTooltipFunc: hotspot => {
            const el = document.createElement('div');
            el.className = 'hotspot-label';
            el.textContent = '🔭 Cupola Window';
            hotspot.appendChild(el);
          }
        },
        {
          pitch: 15,
          yaw: 180,
          type: "info",
          text: "Sleep Stations",
          createTooltipFunc: hotspot => {
            const el = document.createElement('div');
            el.className = 'hotspot-label';
            el.textContent = '🛌 Sleep Quarters';
            hotspot.appendChild(el);
          }
        }
      ]
    });
  </script>
</body>
</html>
`;

export default function ISSTourScreen({ navigation }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [tourActive, setTourActive] = useState(false);
  const [activeSection, setActiveSection] = useState('map');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#000814', '#001528', '#001f3d']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ISS Interior Tour</Text>
          <Text style={styles.headerSub}>360° Exploration</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Tab Switcher */}
      <Animated.View style={[styles.tabRow, { opacity: fadeAnim }]}>
        {['map', 'tour', 'facts'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeSection === tab && styles.tabActive]}
            onPress={() => setActiveSection(tab)}
          >
            <Text style={[styles.tabText, activeSection === tab && styles.tabTextActive]}>
              {tab === 'map' ? '🗺️ Modules' : tab === 'tour' ? '🔭 360° View' : '📊 Facts'}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Content */}
      {activeSection === 'tour' ? (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ html: TOUR_HTML }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            onError={(e) => console.log('WebView error:', e)}
          />
          <View style={styles.tourHint}>
            <Ionicons name="hand-left-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.tourHintText}>Drag to look around • Pinch to zoom</Text>
          </View>
        </View>
      ) : activeSection === 'map' ? (
        <Animated.ScrollView
          contentContainerStyle={styles.modulesContainer}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>ISS Module Map</Text>
          <Text style={styles.sectionSub}>Tap a module to learn more</Text>

          {/* ISS Outline schematic */}
          <View style={styles.issSchematic}>
            <View style={styles.schematicRow}>
              <View style={[styles.schematicModule, { backgroundColor: '#1565c0aa' }]}>
                <Text style={styles.schematicText}>◀ Columbus</Text>
              </View>
              <View style={[styles.schematicModule, styles.schematicCenter, { backgroundColor: '#1b5e20aa' }]}>
                <Text style={styles.schematicText}>Harmony</Text>
              </View>
              <View style={[styles.schematicModule, { backgroundColor: '#880e4faa' }]}>
                <Text style={styles.schematicText}>Kibo ▶</Text>
              </View>
            </View>
            <View style={styles.schematicConnector} />
            <View style={styles.schematicRow}>
              <View style={[styles.schematicModule, { backgroundColor: '#b71c1caa', width: 80 }]}>
                <Text style={styles.schematicText}>Destiny</Text>
              </View>
              <View style={[styles.schematicModule, { backgroundColor: '#4a148caa', width: 80 }]}>
                <Text style={styles.schematicText}>Zvezda</Text>
              </View>
            </View>
            <View style={[styles.schematicModule, { backgroundColor: '#e65100aa', alignSelf: 'center', marginTop: 4 }]}>
              <Text style={styles.schematicText}>🔭 Cupola</Text>
            </View>
          </View>

          {/* Module cards */}
          <View style={styles.moduleGrid}>
            {ISS_MODULES.map((mod) => (
              <TouchableOpacity
                key={mod.id}
                style={[styles.moduleCard, { borderColor: mod.color + '60' }]}
                onPress={() => setSelectedModule(mod)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[mod.color + '30', mod.color + '10']}
                  style={styles.moduleCardGradient}
                >
                  <View style={styles.moduleCardHeader}>
                    <Text style={styles.moduleFlag}>{mod.flag}</Text>
                    <Text style={styles.moduleAgency}>{mod.agency}</Text>
                  </View>
                  <Text style={styles.moduleName}>{mod.name}</Text>
                  <Text style={styles.moduleDesc} numberOfLines={2}>{mod.description}</Text>
                  <View style={styles.moduleLearnMore}>
                    <Text style={[styles.learnMoreText, { color: mod.color }]}>Learn more</Text>
                    <Ionicons name="chevron-forward" size={14} color={mod.color} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.ScrollView>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.factsContainer}
          style={{ opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
        >
          {[
            { emoji: '📐', label: 'Size', value: '109m × 73m', sub: 'Larger than a football field' },
            { emoji: '⚖️', label: 'Mass', value: '420,000 kg', sub: 'Heavier than 300 cars' },
            { emoji: '🛸', label: 'Altitude', value: '~408 km', sub: 'Low Earth Orbit' },
            { emoji: '🌍', label: 'Orbits/Day', value: '15.5', sub: '92 minute orbital period' },
            { emoji: '⚡', label: 'Power', value: '84–120 kW', sub: '8 solar array wings' },
            { emoji: '🫁', label: 'Volume', value: '916 m³', sub: 'Pressurized living space' },
            { emoji: '🌡️', label: 'Temp (ext)', value: '-157°C to 121°C', sub: 'Extreme temperature swings' },
            { emoji: '🔬', label: 'Experiments', value: '3,000+', sub: 'Since 2000' },
            { emoji: '👨‍🚀', label: 'Crew Max', value: '13', sub: 'Current standard: 7' },
            { emoji: '🚀', label: 'Assembly', value: '42 missions', sub: 'Built over 13 years' },
          ].map((fact, i) => (
            <View key={i} style={styles.factCard}>
              <Text style={styles.factEmoji}>{fact.emoji}</Text>
              <View style={styles.factInfo}>
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
                <Text style={styles.factSub}>{fact.sub}</Text>
              </View>
            </View>
          ))}
        </Animated.ScrollView>
      )}

      {/* Module Detail Modal */}
      <Modal
        visible={!!selectedModule}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedModule(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, selectedModule && { borderColor: selectedModule.color + '60' }]}>
            {selectedModule && (
              <>
                <LinearGradient
                  colors={[selectedModule.color + '40', 'transparent']}
                  style={styles.modalGradient}
                />
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedModule(null)}>
                  <Ionicons name="close" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalFlag}>{selectedModule.flag}</Text>
                <Text style={styles.modalTitle}>{selectedModule.name}</Text>
                <Text style={styles.modalAgency}>{selectedModule.agency}</Text>
                <Text style={styles.modalDescription}>{selectedModule.description}</Text>
                <View style={styles.modalFacts}>
                  {selectedModule.facts.map((f, i) => (
                    <View key={i} style={styles.modalFactItem}>
                      <View style={[styles.modalFactDot, { backgroundColor: selectedModule.color }]} />
                      <Text style={styles.modalFactText}>{f}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.modalTourBtn, { borderColor: selectedModule.color }]}
                  onPress={() => { setSelectedModule(null); setActiveSection('tour'); }}
                >
                  <Ionicons name="eye" size={18} color={selectedModule.color} />
                  <Text style={[styles.modalTourBtnText, { color: selectedModule.color }]}>View in 360°</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000814' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.title, fontWeight: '700' },
  headerSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.caption, letterSpacing: 1 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 3,
    marginBottom: SPACING.sm,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  tabText: { color: COLORS.textMuted, fontSize: FONT_SIZES.small, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  webviewContainer: { flex: 1, margin: SPACING.md, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  webview: { flex: 1 },
  tourHint: {
    position: 'absolute', bottom: 12, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  tourHintText: { color: COLORS.textMuted, fontSize: FONT_SIZES.caption },
  modulesContainer: { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.heading, fontWeight: '700', marginBottom: 4 },
  sectionSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.small, marginBottom: SPACING.md },
  issSchematic: {
    backgroundColor: 'rgba(0,20,40,0.7)',
    borderRadius: 16, padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(0,229,255,0.15)',
    alignItems: 'center',
  },
  schematicRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  schematicCenter: { borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  schematicModule: {
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    minWidth: 80,
  },
  schematicText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  schematicConnector: { width: 2, height: 10, backgroundColor: 'rgba(0,229,255,0.4)' },
  moduleGrid: { gap: SPACING.sm },
  moduleCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  moduleCardGradient: { padding: SPACING.md },
  moduleCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  moduleFlag: { fontSize: 20 },
  moduleAgency: { color: COLORS.textMuted, fontSize: FONT_SIZES.caption, fontWeight: '700', letterSpacing: 1 },
  moduleName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '700', marginBottom: 4 },
  moduleDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, lineHeight: 18 },
  moduleLearnMore: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  learnMoreText: { fontSize: FONT_SIZES.small, fontWeight: '600' },
  factsContainer: { paddingHorizontal: SPACING.md, paddingBottom: 40, gap: SPACING.sm },
  factCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  factEmoji: { fontSize: 28 },
  factInfo: { flex: 1 },
  factLabel: { color: COLORS.textMuted, fontSize: FONT_SIZES.caption, fontWeight: '700', letterSpacing: 1 },
  factValue: { color: COLORS.primary, fontSize: FONT_SIZES.title, fontWeight: '800' },
  factSub: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end', padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: '#050f20',
    borderRadius: 24, padding: SPACING.lg,
    borderWidth: 1, overflow: 'hidden',
  },
  modalGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  modalClose: {
    position: 'absolute', top: SPACING.md, right: SPACING.md,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  modalFlag: { fontSize: 40, marginBottom: 8 },
  modalTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.heading, fontWeight: '800' },
  modalAgency: { color: COLORS.textMuted, fontSize: FONT_SIZES.small, marginBottom: 12, letterSpacing: 1 },
  modalDescription: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, lineHeight: 22, marginBottom: 16 },
  modalFacts: { gap: 8, marginBottom: 16 },
  modalFactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalFactDot: { width: 6, height: 6, borderRadius: 3 },
  modalFactText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small },
  modalTourBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
  },
  modalTourBtnText: { fontWeight: '700', fontSize: FONT_SIZES.small },
});
