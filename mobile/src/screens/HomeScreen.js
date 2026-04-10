import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import GlassCard from '../components/common/GlassCard';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../styles/theme';
import useISSPosition from '../hooks/useISSPosition';
import { issAPI, mediaAPI } from '../services/api';

const { width } = Dimensions.get('window');

const FEATURES = [
  { id: 'tracker', title: 'ISS Tracker', icon: 'navigate', color: '#00D68F', desc: 'Real-time tracking', screen: 'Tracker' },
  { id: 'ai', title: 'AI Assistant', icon: 'chatbubbles', color: '#6C63FF', desc: 'Ask anything', screen: 'AI' },
  { id: 'alerts', title: 'Pass Alerts', icon: 'notifications', color: '#FF6B35', desc: 'Visibility alerts', screen: 'Alerts' },
  { id: 'explore', title: 'Explore', icon: 'telescope', color: '#00B4D8', desc: 'Space media', screen: 'Explore' },
];

export default function HomeScreen({ navigation }) {
  const { position, loading: issLoading } = useISSPosition(10000);
  const [astronauts, setAstronauts] = useState(null);
  const [apod, setApod] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [astroRes, apodRes] = await Promise.allSettled([
        issAPI.getAstronauts(),
        mediaAPI.getAPOD(),
      ]);
      if (astroRes.status === 'fulfilled' && astroRes.value.success) {
        setAstronauts(astroRes.value.data);
      }
      if (apodRes.status === 'fulfilled' && apodRes.value.success) {
        setApod(apodRes.value.data);
      }
    } catch (err) {
      console.warn('Home data fetch error:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>Space-Eye</Text>
            <Text style={styles.subtitle}>Explore the cosmos 🚀</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.profileGradient}>
              <Ionicons name="person" size={20} color={COLORS.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ISS Status Card */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Tracker')}>
            <LinearGradient
              colors={['rgba(0, 214, 143, 0.15)', 'rgba(108, 99, 255, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.issCard}
            >
              <View style={styles.issHeader}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={COLORS.textMuted} />
              </View>

              <Text style={styles.issTitle}>🛰️ International Space Station</Text>

              {position ? (
                <View style={styles.issStats}>
                  <View style={styles.issStat}>
                    <Text style={styles.issStatLabel}>LATITUDE</Text>
                    <Text style={styles.issStatValue}>{position.latitude?.toFixed(4)}°</Text>
                  </View>
                  <View style={styles.issStatDivider} />
                  <View style={styles.issStat}>
                    <Text style={styles.issStatLabel}>LONGITUDE</Text>
                    <Text style={styles.issStatValue}>{position.longitude?.toFixed(4)}°</Text>
                  </View>
                  <View style={styles.issStatDivider} />
                  <View style={styles.issStat}>
                    <Text style={styles.issStatLabel}>REGION</Text>
                    <Text style={styles.issStatValue} numberOfLines={1}>{position.region || '—'}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.issStats}>
                  <Text style={styles.issLoadingText}>Acquiring signal...</Text>
                </View>
              )}

              <View style={styles.issFooter}>
                <View style={styles.issFooterItem}>
                  <Ionicons name="speedometer-outline" size={14} color={COLORS.issColor} />
                  <Text style={styles.issFooterText}>27,600 km/h</Text>
                </View>
                <View style={styles.issFooterItem}>
                  <Ionicons name="resize-outline" size={14} color={COLORS.issColor} />
                  <Text style={styles.issFooterText}>~408 km alt</Text>
                </View>
                <View style={styles.issFooterItem}>
                  <Ionicons name={position?.isNighttime ? 'moon-outline' : 'sunny-outline'} size={14} color={COLORS.issColor} />
                  <Text style={styles.issFooterText}>{position?.isNighttime ? 'Night' : 'Day'}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature, index) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(feature.screen)}
            >
              <GlassCard style={styles.featureCardInner}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Astronauts Card */}
        {astronauts && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>People in Space</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{astronauts.total}</Text>
              </View>
            </View>
            <GlassCard>
              {Object.entries(astronauts.byCraft || {}).map(([craft, people]) => (
                <View key={craft} style={styles.craftGroup}>
                  <View style={styles.craftHeader}>
                    <Text style={styles.craftIcon}>🚀</Text>
                    <Text style={styles.craftName}>{craft}</Text>
                    <View style={styles.craftBadge}>
                      <Text style={styles.craftCount}>{people.length}</Text>
                    </View>
                  </View>
                  <View style={styles.astronautList}>
                    {people.map((name, idx) => (
                      <View key={idx} style={styles.astronautItem}>
                        <Text style={styles.astronautIcon}>👨‍🚀</Text>
                        <Text style={styles.astronautName}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </GlassCard>
          </View>
        )}

        {/* APOD Card */}
        {apod && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Picture of the Day</Text>
              <Ionicons name="image-outline" size={18} color={COLORS.textMuted} />
            </View>
            <GlassCard>
              <Text style={styles.apodTitle}>{apod.title}</Text>
              <Text style={styles.apodDesc} numberOfLines={3}>{apod.explanation}</Text>
              <Text style={styles.apodDate}>{apod.date}</Text>
            </GlassCard>
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
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  profileBtn: {
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.sm,
  },
  profileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ISS Card
  issCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 214, 143, 0.2)',
    marginBottom: SPACING.lg,
  },
  issHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 214, 143, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.issColor,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.issColor,
    letterSpacing: 1,
  },
  issTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  issStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  issStat: {
    flex: 1,
    alignItems: 'center',
  },
  issStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  issStatValue: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  issStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.surfaceBorder,
  },
  issLoadingText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.body,
    fontStyle: 'italic',
  },
  issFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingTop: SPACING.sm,
  },
  issFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  issFooterText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },

  // Features
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  featureCard: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
    marginBottom: SPACING.sm,
  },
  featureCardInner: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },

  // Astronauts
  section: {
    marginBottom: SPACING.lg,
  },
  countBadge: {
    backgroundColor: COLORS.primary + '25',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  countText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
    fontWeight: '800',
  },
  craftGroup: {
    marginBottom: SPACING.md,
  },
  craftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  craftIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  craftName: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  craftBadge: {
    backgroundColor: COLORS.bgGlass,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  craftCount: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: '700',
  },
  astronautList: {
    paddingLeft: SPACING.lg,
  },
  astronautItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  astronautIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  astronautName: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },

  // APOD
  apodTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  apodDesc: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  apodDate: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },
});
