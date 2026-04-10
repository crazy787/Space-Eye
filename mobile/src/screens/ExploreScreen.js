import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/common/GlassCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../styles/theme';
import { mediaAPI } from '../services/api';

const { width } = Dimensions.get('window');

const EXPLORE_SECTIONS = [
  {
    id: 'live',
    title: 'Live Streams',
    icon: 'videocam',
    color: '#FF3D71',
    desc: 'Watch Earth from space',
  },
  {
    id: 'apod',
    title: 'Picture of the Day',
    icon: 'image',
    color: '#FFAA00',
    desc: "NASA's daily image",
  },
  {
    id: 'facts',
    title: 'Space Facts',
    icon: 'bulb',
    color: '#00D68F',
    desc: 'Learn something new',
  },
];

const SPACE_FACTS = [
  { title: 'ISS Sunrises', fact: 'Astronauts on the ISS see 16 sunrises and sunsets every day!', icon: '🌅' },
  { title: 'Speed of Light', fact: 'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.', icon: '💡' },
  { title: 'Space Silence', fact: 'There is no sound in space because there is no medium for sound to travel through.', icon: '🔇' },
  { title: 'Neutron Stars', fact: 'A teaspoon of neutron star material would weigh about 6 billion tons!', icon: '⭐' },
  { title: 'Floating Water', fact: 'In zero gravity, water forms perfect spheres due to surface tension.', icon: '💧' },
  { title: 'Space Suits', fact: 'A NASA space suit costs approximately $12 million to make.', icon: '👨‍🚀' },
  { title: 'Venus Day', fact: "A day on Venus is longer than its year! It takes 243 Earth days to rotate once.", icon: '🪐' },
  { title: 'Footprints on Moon', fact: "Footprints on the Moon will last for 100 million years because there's no wind.", icon: '👣' },
];

const IMMERSIVE_FEATURES = [
  // Phase 2
  {
    id: 'SpaceView',
    title: '4D Space View',
    desc: 'Watch Earth, ISS & Moon orbit in real-time 3D',
    icon: 'planet',
    colors: ['#001a33', '#003366'],
    accentColor: '#00e5ff',
    badge: 'INTERACTIVE',
  },
  {
    id: 'ISSTour',
    title: 'ISS 360° Tour',
    desc: 'Explore inside the space station',
    icon: 'home',
    colors: ['#1a0033', '#330066'],
    accentColor: '#ce93d8',
    badge: 'PANORAMIC',
  },
  {
    id: 'RocketSim',
    title: 'Rocket Simulator',
    desc: 'Launch Falcon 9, Soyuz & Crew Dragon',
    icon: 'rocket',
    colors: ['#1a0a00', '#331500'],
    accentColor: '#ff9800',
    badge: 'ANIMATED',
  },
  // Phase 3
  {
    id: 'SatelliteTracker',
    title: 'Multi-Satellite',
    desc: 'Track Hubble, Tiangong, Starlink & more',
    icon: 'radio',
    colors: ['#001a1a', '#003333'],
    accentColor: '#26c6da',
    badge: 'REAL-TIME',
  },
  {
    id: 'Telescope',
    title: 'Telescope',
    desc: 'Star map, constellations & planet guide',
    icon: 'star',
    colors: ['#1a1a00', '#333300'],
    accentColor: '#ffd54f',
    badge: 'STAR MAP',
  },
  {
    id: 'SpaceMedia',
    title: 'Space Media',
    desc: 'NASA TV, APOD, Mars Rover & live feeds',
    icon: 'tv',
    colors: ['#0a001a', '#1a0033'],
    accentColor: '#ef5350',
    badge: 'LIVE',
  },
];

export default function ExploreScreen({ navigation }) {
  const [apod, setApod] = useState(null);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('facts');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apodRes, streamRes] = await Promise.allSettled([
        mediaAPI.getAPOD(),
        mediaAPI.getISSStream(),
      ]);

      if (apodRes.status === 'fulfilled' && apodRes.value.success) {
        setApod(apodRes.value.data);
      }
      if (streamRes.status === 'fulfilled' && streamRes.value.success) {
        setStreams(streamRes.value.data.streams || []);
      }
    } catch (err) {
      console.warn('Explore data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner message="Exploring the cosmos..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(11, 13, 23, 1)', 'rgba(11, 13, 23, 0.95)']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Explore Space</Text>
        <Text style={styles.headerSubtitle}>Discover the wonders of our universe</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Phase 2 Feature Hub */}
        <Text style={styles.phase2Label}>✨ IMMERSIVE EXPERIENCES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.phase2Scroll} contentContainerStyle={styles.phase2Content}>
          {IMMERSIVE_FEATURES.map((feat) => (
            <TouchableOpacity key={feat.id} onPress={() => navigation.navigate(feat.id)} activeOpacity={0.85}>
              <LinearGradient colors={feat.colors} style={[styles.phase2Card, { borderColor: feat.accentColor + '40' }]}>
                <View style={[styles.phase2IconBox, { backgroundColor: feat.accentColor + '20' }]}>
                  <Ionicons name={feat.icon} size={26} color={feat.accentColor} />
                </View>
                <View style={[styles.phase2Badge, { backgroundColor: feat.accentColor + '30', borderColor: feat.accentColor + '60' }]}>
                  <Text style={[styles.phase2BadgeText, { color: feat.accentColor }]}>{feat.badge}</Text>
                </View>
                <Text style={styles.phase2Title}>{feat.title}</Text>
                <Text style={styles.phase2Desc}>{feat.desc}</Text>
                <View style={styles.phase2Arrow}>
                  <Text style={[styles.phase2ArrowText, { color: feat.accentColor }]}>Open  →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Section Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {EXPLORE_SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[styles.tab, activeSection === section.id && styles.tabActive]}
              onPress={() => setActiveSection(section.id)}
            >
              <Ionicons
                name={section.icon}
                size={18}
                color={activeSection === section.id ? section.color : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === section.id && { color: section.color },
                ]}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live Streams */}
        {activeSection === 'live' && (
          <View>
            <Text style={styles.sectionTitle}>🔴 Live from Space</Text>
            {streams.map((stream, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(stream.url.replace('/embed/', '/watch?v='))}
              >
                <GlassCard style={styles.streamCard}>
                  <View style={styles.streamIcon}>
                    <Ionicons name="play-circle" size={40} color={COLORS.error} />
                  </View>
                  <View style={styles.streamInfo}>
                    <Text style={styles.streamTitle}>{stream.name}</Text>
                    <Text style={styles.streamDesc}>{stream.description}</Text>
                    <View style={styles.streamLive}>
                      <View style={styles.streamDot} />
                      <Text style={styles.streamLiveText}>LIVE</Text>
                    </View>
                  </View>
                  <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* APOD */}
        {activeSection === 'apod' && apod && (
          <View>
            <Text style={styles.sectionTitle}>🔭 Astronomy Picture of the Day</Text>
            <GlassCard style={styles.apodCard}>
              {apod.media_type === 'image' && apod.url && (
                <Image source={{ uri: apod.url }} style={styles.apodImage} resizeMode="cover" />
              )}
              <Text style={styles.apodTitle}>{apod.title}</Text>
              <Text style={styles.apodDate}>{apod.date}</Text>
              <Text style={styles.apodExplanation}>{apod.explanation}</Text>
              {apod.copyright && (
                <Text style={styles.apodCopyright}>📷 {apod.copyright}</Text>
              )}
            </GlassCard>
          </View>
        )}

        {/* Space Facts */}
        {activeSection === 'facts' && (
          <View>
            <Text style={styles.sectionTitle}>💫 Space Facts</Text>
            {SPACE_FACTS.map((fact, index) => (
              <GlassCard key={index} style={styles.factCard}>
                <View style={styles.factHeader}>
                  <Text style={styles.factIcon}>{fact.icon}</Text>
                  <Text style={styles.factTitle}>{fact.title}</Text>
                </View>
                <Text style={styles.factText}>{fact.fact}</Text>
              </GlassCard>
            ))}
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

  // Tabs
  tabsScroll: {
    marginHorizontal: -SPACING.md,
    marginBottom: SPACING.lg,
  },
  tabsContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.bgTertiary,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 6,
  },
  tabActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  tabText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Streams
  streamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  streamIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 61, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamInfo: {
    flex: 1,
  },
  streamTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  streamDesc: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  streamLive: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  streamDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },
  streamLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.error,
    letterSpacing: 1,
  },

  // APOD
  apodCard: {
    padding: 0,
    overflow: 'hidden',
  },
  apodImage: {
    width: '100%',
    height: 220,
  },
  apodTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    padding: SPACING.md,
    paddingBottom: 0,
  },
  apodDate: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
    marginTop: 4,
  },
  apodExplanation: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    padding: SPACING.md,
  },
  apodCopyright: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },

  // Facts
  factCard: {
    marginBottom: SPACING.sm,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  factIcon: {
    fontSize: 24,
  },
  factTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  factText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Phase 2 Hub
  phase2Label: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs || 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  phase2Scroll: { marginHorizontal: -SPACING.md, marginBottom: SPACING.lg },
  phase2Content: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  phase2Card: {
    width: 170,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    gap: 8,
  },
  phase2IconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  phase2Badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, borderWidth: 1,
  },
  phase2BadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  phase2Title: { color: COLORS.textPrimary, fontSize: FONT_SIZES.md || 15, fontWeight: '700' },
  phase2Desc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs || 11, lineHeight: 16 },
  phase2Arrow: { marginTop: 4 },
  phase2ArrowText: { fontSize: FONT_SIZES.sm || 13, fontWeight: '700' },
});

