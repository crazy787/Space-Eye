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
  Image,
  Linking,
  RefreshControl,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';
import { mediaAPI } from '../services/api';

const { width } = Dimensions.get('window');

const LIVE_FEEDS = [
  {
    id: 'earth',
    name: 'ISS Live Earth View',
    desc: 'Watch Earth in real-time from the ISS exterior cameras',
    url: 'https://www.youtube.com/watch?v=P9C25Un7xaM',
    embedUrl: 'https://www.youtube.com/embed/P9C25Un7xaM',
    icon: '🌍',
    color: '#4fc3f7',
    badge: 'LIVE',
  },
  {
    id: 'nasa_tv',
    name: 'NASA TV Public',
    desc: 'Official NASA Television broadcast — launches, EVAs, press conferences',
    url: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
    embedUrl: 'https://www.youtube.com/embed/21X5lGlDOfg',
    icon: '📺',
    color: '#ef5350',
    badge: 'LIVE',
  },
  {
    id: 'nasa_media',
    name: 'NASA Media Channel',
    desc: 'Mission briefings and educational content',
    url: 'https://www.youtube.com/watch?v=nA9UZF-SZoQ',
    embedUrl: 'https://www.youtube.com/embed/nA9UZF-SZoQ',
    icon: '🎬',
    color: '#ff9800',
    badge: 'ON-DEMAND',
  },
  {
    id: 'spacex',
    name: 'SpaceX',
    desc: 'Live launch coverage and mission streams',
    url: 'https://www.youtube.com/@SpaceX/live',
    embedUrl: null,
    icon: '🚀',
    color: '#ce93d8',
    badge: 'LAUNCHES',
  },
];

const MEDIA_CATEGORIES = [
  { id: 'apod', name: '🔭 APOD', desc: 'Astronomy Picture of the Day' },
  { id: 'earth', name: '🌍 Earth', desc: 'EPIC camera images' },
  { id: 'mars', name: '🔴 Mars', desc: 'Rover photos' },
  { id: 'search', name: '🔍 Search', desc: 'NASA image library' },
];

export default function SpaceMediaScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('live');
  const [mediaCategory, setMediaCategory] = useState('apod');
  const [apod, setApod] = useState(null);
  const [earthImages, setEarthImages] = useState([]);
  const [marsPhotos, setMarsPhotos] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    fetchAPOD();
  }, []);

  const fetchAPOD = async () => {
    try {
      const res = await mediaAPI.getAPOD();
      if (res.data) setApod(res.data);
    } catch (e) { console.warn('APOD error:', e.message); }
  };

  const fetchEarth = async () => {
    setLoading(true);
    try {
      const res = await mediaAPI.getEPIC();
      if (res.data) setEarthImages(Array.isArray(res.data) ? res.data.slice(0, 12) : []);
    } catch (e) { console.warn('EPIC error:', e.message); }
    finally { setLoading(false); }
  };

  const fetchMars = async () => {
    setLoading(true);
    try {
      const res = await mediaAPI.getMars ? await mediaAPI.getMars() : { data: [] };
      setMarsPhotos(Array.isArray(res.data) ? res.data.slice(0, 20) : []);
    } catch (e) { console.warn('Mars error:', e.message); }
    finally { setLoading(false); }
  };

  const searchNASA = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await mediaAPI.search(searchQuery);
      const items = res.data?.collection?.items || res.data || [];
      setSearchResults(items.slice(0, 30));
    } catch (e) { console.warn('Search error:', e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (mediaCategory === 'earth') fetchEarth();
    if (mediaCategory === 'mars') fetchMars();
  }, [mediaCategory]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#000814', '#0a0018', '#120020']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Space Media</Text>
          <Text style={styles.headerSub}>Live Feeds & NASA Gallery</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Tabs */}
      <Animated.View style={[styles.tabRow, { opacity: fadeAnim }]}>
        {['live', 'gallery'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'live' ? '📡 Live Feeds' : '🖼️ Gallery'}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {activeTab === 'live' ? (
        <ScrollView contentContainerStyle={styles.feedsContainer} showsVerticalScrollIndicator={false}>
          {/* Live stream cards */}
          {LIVE_FEEDS.map(feed => (
            <TouchableOpacity
              key={feed.id}
              style={[styles.feedCard, { borderColor: feed.color + '30' }]}
              onPress={() => Linking.openURL(feed.url)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[feed.color + '18', feed.color + '05']} style={styles.feedCardInner}>
                <View style={styles.feedTop}>
                  <View style={styles.feedIconBox}>
                    <Text style={styles.feedIcon}>{feed.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.feedNameRow}>
                      <Text style={[styles.feedName, { color: feed.color }]}>{feed.name}</Text>
                      <View style={[styles.feedBadge, {
                        backgroundColor: feed.badge === 'LIVE' ? '#ef535030' : feed.color + '25',
                        borderColor: feed.badge === 'LIVE' ? '#ef5350' : feed.color,
                      }]}>
                        {feed.badge === 'LIVE' && <View style={styles.liveDot} />}
                        <Text style={[styles.feedBadgeText, {
                          color: feed.badge === 'LIVE' ? '#ef5350' : feed.color,
                        }]}>{feed.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.feedDesc}>{feed.desc}</Text>
                  </View>
                </View>
                <View style={styles.feedAction}>
                  <Ionicons name="play-circle" size={20} color={feed.color} />
                  <Text style={[styles.feedActionText, { color: feed.color }]}>Watch Now</Text>
                  <Ionicons name="open-outline" size={14} color={feed.color} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {/* Quick links */}
          <Text style={styles.quickLinksTitle}>🔗 Quick Links</Text>
          <View style={styles.quickLinksGrid}>
            {[
              { name: 'nasa.gov', url: 'https://www.nasa.gov', icon: '🚀' },
              { name: 'SpaceX', url: 'https://www.spacex.com', icon: '🐉' },
              { name: 'ESA', url: 'https://www.esa.int', icon: '🇪🇺' },
              { name: 'ISRO', url: 'https://www.isro.gov.in', icon: '🇮🇳' },
              { name: 'SpaceWeather', url: 'https://www.spaceweather.com', icon: '☀️' },
              { name: 'Heavens Above', url: 'https://www.heavens-above.com', icon: '🌌' },
            ].map((link, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickLink}
                onPress={() => Linking.openURL(link.url)}
              >
                <Text style={styles.quickLinkIcon}>{link.icon}</Text>
                <Text style={styles.quickLinkName}>{link.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Category pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catContent}>
            {MEDIA_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, mediaCategory === cat.id && styles.catPillActive]}
                onPress={() => setMediaCategory(cat.id)}
              >
                <Text style={[styles.catPillText, mediaCategory === cat.id && styles.catPillTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search bar (for search mode) */}
          {mediaCategory === 'search' && (
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search NASA images..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchNASA}
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.searchBtn} onPress={searchNASA}>
                <Ionicons name="search" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* APOD */}
          {mediaCategory === 'apod' && apod && (
            <ScrollView contentContainerStyle={styles.apodContainer} showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={() => apod.hdurl && setSelectedImage(apod.hdurl)} activeOpacity={0.9}>
                {apod.media_type === 'image' && apod.url && (
                  <Image source={{ uri: apod.url }} style={styles.apodImage} resizeMode="cover" />
                )}
              </TouchableOpacity>
              <View style={styles.apodInfo}>
                <Text style={styles.apodTitle}>{apod.title}</Text>
                <Text style={styles.apodDate}>{apod.date}</Text>
                {apod.copyright && <Text style={styles.apodCopy}>📷 {apod.copyright}</Text>}
                <Text style={styles.apodExpl}>{apod.explanation}</Text>
              </View>
            </ScrollView>
          )}

          {/* Earth (EPIC) images */}
          {mediaCategory === 'earth' && (
            <FlatList
              data={earthImages}
              numColumns={2}
              keyExtractor={(item, idx) => String(idx)}
              contentContainerStyle={styles.imageGrid}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEarth} tintColor={COLORS.primary} />}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="earth-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>{loading ? 'Loading Earth images...' : 'No images found'}</Text>
                </View>
              }
              renderItem={({ item }) => {
                const imgUrl = item.image
                  ? `https://epic.gsfc.nasa.gov/archive/natural/${item.date?.replace(/-/g, '/')}/png/${item.image}.png`
                  : null;
                return imgUrl ? (
                  <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedImage(imgUrl)}>
                    <Image source={{ uri: imgUrl }} style={styles.gridImage} resizeMode="cover" />
                    <Text style={styles.gridCaption}>{item.date}</Text>
                  </TouchableOpacity>
                ) : null;
              }}
            />
          )}

          {/* Mars photos */}
          {mediaCategory === 'mars' && (
            <FlatList
              data={marsPhotos}
              numColumns={2}
              keyExtractor={(item, idx) => String(idx)}
              contentContainerStyle={styles.imageGrid}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMars} tintColor={COLORS.primary} />}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 48 }}>🔴</Text>
                  <Text style={styles.emptyText}>{loading ? 'Loading Mars photos...' : 'No photos available'}</Text>
                </View>
              }
              renderItem={({ item }) => {
                const imgUrl = item.img_src || item.url;
                return imgUrl ? (
                  <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedImage(imgUrl)}>
                    <Image source={{ uri: imgUrl }} style={styles.gridImage} resizeMode="cover" />
                    <Text style={styles.gridCaption}>{item.camera?.name || 'Rover'} • Sol {item.sol}</Text>
                  </TouchableOpacity>
                ) : null;
              }}
            />
          )}

          {/* Search results */}
          {mediaCategory === 'search' && (
            <FlatList
              data={searchResults}
              numColumns={2}
              keyExtractor={(item, idx) => String(idx)}
              contentContainerStyle={styles.imageGrid}
              ListEmptyComponent={
                !loading && <View style={styles.emptyState}>
                  <Ionicons name="images-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>Search NASA's image & video library</Text>
                </View>
              }
              renderItem={({ item }) => {
                const preview = item.links?.[0]?.href || item.url;
                const title = item.data?.[0]?.title || item.title || '';
                return preview ? (
                  <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedImage(preview)}>
                    <Image source={{ uri: preview }} style={styles.gridImage} resizeMode="cover" />
                    <Text style={styles.gridCaption} numberOfLines={1}>{title}</Text>
                  </TouchableOpacity>
                ) : null;
              }}
            />
          )}
        </View>
      )}

      {/* Full image modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000814' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  headerSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, letterSpacing: 1 },
  tabRow: { flexDirection: 'row', marginHorizontal: SPACING.md, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 3, marginBottom: SPACING.sm },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  tabText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  feedsContainer: { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  feedCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: SPACING.sm },
  feedCardInner: { padding: SPACING.md },
  feedTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  feedIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  feedIcon: { fontSize: 24 },
  feedNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedName: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  feedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef5350' },
  feedBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  feedDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginTop: 4, lineHeight: 18 },
  feedAction: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  feedActionText: { fontSize: FONT_SIZES.sm, fontWeight: '700', flex: 1 },
  quickLinksTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.md, fontWeight: '700', marginTop: SPACING.md, marginBottom: SPACING.sm },
  quickLinksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickLink: { width: (width - SPACING.md * 2 - 20) / 3, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: SPACING.sm, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  quickLinkIcon: { fontSize: 20 },
  quickLinkName: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  catRow: { maxHeight: 50, marginBottom: SPACING.sm },
  catContent: { paddingHorizontal: SPACING.md, gap: 8, alignItems: 'center' },
  catPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  catPillActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderColor: 'rgba(0,229,255,0.4)' },
  catPillText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  catPillTextActive: { color: COLORS.primary },
  searchRow: { flexDirection: 'row', marginHorizontal: SPACING.md, marginBottom: SPACING.sm, gap: 8 },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: SPACING.md, paddingVertical: 10, color: COLORS.textPrimary, fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,229,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  apodContainer: { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  apodImage: { width: '100%', height: 260, borderRadius: 20, marginBottom: SPACING.sm },
  apodInfo: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  apodTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.lg, fontWeight: '800', marginBottom: 4 },
  apodDate: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600', marginBottom: 4 },
  apodCopy: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, marginBottom: 8 },
  apodExpl: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, lineHeight: 22 },
  imageGrid: { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  gridItem: { width: (width - SPACING.md * 2 - 8) / 2, marginBottom: 8, marginRight: 8 },
  gridImage: { width: '100%', height: 140, borderRadius: 14 },
  gridCaption: { color: COLORS.textMuted, fontSize: 10, marginTop: 4, paddingHorizontal: 2 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, textAlign: 'center', maxWidth: 240 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 52, right: SPACING.md, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  modalImage: { width: width - 20, height: height * 0.7 },
});
