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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';

const { width } = Dimensions.get('window');

const HEALTH_TOPICS = [
  {
    id: 'gravity',
    title: 'Zero Gravity Effects',
    icon: '🫧',
    color: '#7c4dff',
    shortDesc: 'How microgravity transforms the human body',
    detail: 'In microgravity, astronauts experience weightlessness. Without gravity pulling blood downward, fluid shifts toward the head causing "puffy face" syndrome. The heart doesn\'t need to pump as hard, so it actually shrinks slightly.',
    effects: [
      { label: 'Fluid Shift', value: '1-2 liters', desc: 'shifts to upper body in first 24 hours' },
      { label: 'Height Gain', value: '+5 cm', desc: 'spine elongates without gravity compression' },
      { label: 'Heart Shrink', value: '~10%', desc: 'cardiac muscle mass reduction' },
    ],
  },
  {
    id: 'muscle',
    title: 'Muscle Atrophy',
    icon: '💪',
    color: '#ff5252',
    shortDesc: 'Muscles weaken without resistance from gravity',
    detail: 'Without gravity, muscles used for posture and locomotion rapidly deteriorate. Astronauts can lose up to 20% of muscle mass in just 5-11 days. To combat this, ISS crew exercise ~2 hours daily.',
    effects: [
      { label: 'Loss Rate', value: '20%', desc: 'muscle mass loss in 5-11 days' },
      { label: 'Exercise', value: '2 hrs/day', desc: 'required to maintain muscle' },
      { label: 'Recovery', value: '~3 years', desc: 'to fully recover on Earth' },
    ],
  },
  {
    id: 'bone',
    title: 'Bone Density Loss',
    icon: '🦴',
    color: '#ff9100',
    shortDesc: 'Bones weaken 10x faster than osteoporosis',
    detail: 'In space, bones lose calcium and minerals at ~1-1.5% per month — 10 times faster than osteoporosis on Earth. Weight-bearing bones (hips, spine) are most affected. Astronauts take bisphosphonates and exercise to slow the loss.',
    effects: [
      { label: 'Loss Rate', value: '~1.5%/month', desc: 'in weight-bearing bones' },
      { label: 'vs. Osteoporosis', value: '10x faster', desc: 'than natural aging' },
      { label: 'Risk', value: 'Kidney stones', desc: 'from excreted calcium' },
    ],
  },
  {
    id: 'vision',
    title: 'Vision Changes',
    icon: '👁️',
    color: '#00bfa5',
    shortDesc: 'Space pressure affects astronaut eyesight',
    detail: 'Over 60% of astronauts on long missions experience vision changes from Spaceflight-Associated Neuro-Ocular Syndrome (SANS). Increased intracranial pressure flattens the eyeball and swells the optic nerve.',
    effects: [
      { label: 'Affected', value: '60%+', desc: 'of long-duration astronauts' },
      { label: 'Cause', value: 'Fluid shift', desc: 'increases intracranial pressure' },
      { label: 'Duration', value: 'Months-years', desc: 'some changes are permanent' },
    ],
  },
  {
    id: 'radiation',
    title: 'Space Radiation',
    icon: '☢️',
    color: '#ffea00',
    shortDesc: 'Cosmic rays and solar particles pose risks',
    detail: 'Outside Earth\'s magnetic field, astronauts are exposed to galactic cosmic rays and solar particle events. ISS astronauts receive ~0.5 mSv/day — about the same as a chest X-ray daily. This increases cancer risk over time.',
    effects: [
      { label: 'Daily Dose', value: '0.5 mSv', desc: 'equivalent to 1 chest X-ray/day' },
      { label: 'ISS Shield', value: 'Partial', desc: 'Earth\'s magnetosphere helps' },
      { label: 'Mars Risk', value: '~1 Sv', desc: 'round trip radiation exposure' },
    ],
  },
  {
    id: 'sleep',
    title: 'Sleep in Space',
    icon: '😴',
    color: '#448aff',
    shortDesc: 'Circadian rhythm disruption from 16 sunrises/day',
    detail: 'The ISS orbits Earth every 92 minutes, meaning astronauts see 16 sunrises and sunsets daily. This disrupts circadian rhythms, so crew follow a strict schedule with blue light-filtered panels mimicking day/night cycles.',
    effects: [
      { label: 'Sunrises/Day', value: '16', desc: 'on ISS orbit' },
      { label: 'Sleep Duration', value: '~6 hrs', desc: 'average for astronauts' },
      { label: 'Solution', value: 'LED panels', desc: 'tunable to simulate day/night' },
    ],
  },
];

const DAILY_ROUTINE = [
  { time: '06:00', label: 'Wake up & hygiene', icon: '⏰', color: '#ffab91' },
  { time: '06:30', label: 'Breakfast (rehydrate packets)', icon: '🍳', color: '#fff176' },
  { time: '07:30', label: 'Morning briefing with Mission Control', icon: '📡', color: '#81d4fa' },
  { time: '08:00', label: 'Science experiments & maintenance', icon: '🔬', color: '#a5d6a7' },
  { time: '10:00', label: 'Exercise session #1 (ARED/T2)', icon: '🏋️', color: '#ef5350' },
  { time: '12:30', label: 'Lunch', icon: '🥗', color: '#fff176' },
  { time: '13:30', label: 'Afternoon science & EVA prep', icon: '🧪', color: '#ce93d8' },
  { time: '16:00', label: 'Exercise session #2', icon: '🏃', color: '#ef5350' },
  { time: '17:30', label: 'Equipment checks & housekeeping', icon: '🔧', color: '#90a4ae' },
  { time: '18:30', label: 'Evening conference with Mission Control', icon: '📞', color: '#81d4fa' },
  { time: '19:00', label: 'Dinner & free time', icon: '🍕', color: '#ffab91' },
  { time: '21:30', label: 'Sleep preparation', icon: '🌙', color: '#7986cb' },
  { time: '22:00', label: 'Sleep (in sleeping bag, strapped)', icon: '😴', color: '#5c6bc0' },
];

export default function AstronautLifeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('health');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#000814', '#001020', '#001a30']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Astronaut Life</Text>
          <Text style={styles.headerSub}>Health & Daily Routine</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Tabs */}
      <Animated.View style={[styles.tabRow, { opacity: fadeAnim }]}>
        {['health', 'routine'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'health' ? '🏥 Health Effects' : '📋 Daily Routine'}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {activeTab === 'health' ? (
        <ScrollView contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>
          {HEALTH_TOPICS.map(topic => (
            <TouchableOpacity
              key={topic.id}
              style={[styles.topicCard, { borderColor: topic.color + '30' }]}
              onPress={() => setSelectedTopic(topic)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[topic.color + '15', topic.color + '05']} style={styles.topicGrad}>
                <View style={styles.topicHeader}>
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.topicTitle, { color: topic.color }]}>{topic.title}</Text>
                    <Text style={styles.topicShort}>{topic.shortDesc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={topic.color} />
                </View>

                {/* Mini stats */}
                <View style={styles.miniStats}>
                  {topic.effects.slice(0, 2).map((e, i) => (
                    <View key={i} style={[styles.miniStat, { borderColor: topic.color + '20' }]}>
                      <Text style={[styles.miniStatValue, { color: topic.color }]}>{e.value}</Text>
                      <Text style={styles.miniStatLabel}>{e.label}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>
          <View style={styles.routineHeader}>
            <Text style={styles.routineTitle}>A Day on the ISS</Text>
            <Text style={styles.routineSub}>Coordinated Universal Time (UTC)</Text>
          </View>

          {DAILY_ROUTINE.map((item, i) => (
            <View key={i} style={styles.routineItem}>
              {/* Timeline line */}
              <View style={styles.timeline}>
                <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
                {i < DAILY_ROUTINE.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.routineContent}>
                <Text style={styles.routineTime}>{item.time}</Text>
                <View style={styles.routineActivity}>
                  <Text style={styles.routineIcon}>{item.icon}</Text>
                  <Text style={styles.routineLabel}>{item.label}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Topic Detail Modal */}
      <Modal visible={!!selectedTopic} transparent animationType="slide" onRequestClose={() => setSelectedTopic(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, selectedTopic && { borderColor: selectedTopic.color + '40' }]}>
            {selectedTopic && (
              <>
                <LinearGradient colors={[selectedTopic.color + '25', 'transparent']} style={styles.modalGrad} />
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedTopic(null)}>
                  <Ionicons name="close" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalIcon}>{selectedTopic.icon}</Text>
                <Text style={[styles.modalTitle, { color: selectedTopic.color }]}>{selectedTopic.title}</Text>
                <Text style={styles.modalDetail}>{selectedTopic.detail}</Text>

                <View style={styles.modalEffects}>
                  {selectedTopic.effects.map((e, i) => (
                    <View key={i} style={[styles.effectCard, { borderColor: selectedTopic.color + '25' }]}>
                      <Text style={[styles.effectValue, { color: selectedTopic.color }]}>{e.value}</Text>
                      <Text style={styles.effectLabel}>{e.label}</Text>
                      <Text style={styles.effectDesc}>{e.desc}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={[styles.askAiBtn, { borderColor: selectedTopic.color }]} onPress={() => { setSelectedTopic(null); navigation.navigate('AI'); }}>
                  <Ionicons name="chatbubbles" size={16} color={selectedTopic.color} />
                  <Text style={[styles.askAiText, { color: selectedTopic.color }]}>Ask AI for more details</Text>
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
  container: { flex: 1 },
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
  contentPad: { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  topicCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: SPACING.sm },
  topicGrad: { padding: SPACING.md },
  topicHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  topicIcon: { fontSize: 36 },
  topicTitle: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  topicShort: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, marginTop: 2 },
  miniStats: { flexDirection: 'row', gap: 8, marginTop: SPACING.sm },
  miniStat: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  miniStatValue: { fontSize: FONT_SIZES.sm, fontWeight: '800' },
  miniStatLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
  routineHeader: { marginBottom: SPACING.md },
  routineTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.xl, fontWeight: '700' },
  routineSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  routineItem: { flexDirection: 'row', minHeight: 56 },
  timeline: { width: 30, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 4 },
  routineContent: { flex: 1, paddingLeft: SPACING.sm, paddingBottom: SPACING.md },
  routineTime: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  routineActivity: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routineIcon: { fontSize: 16 },
  routineLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZES.sm, fontWeight: '600', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end', padding: SPACING.md },
  modalCard: { backgroundColor: '#050f20', borderRadius: 24, padding: SPACING.lg, borderWidth: 1, overflow: 'hidden', maxHeight: '80%' },
  modalGrad: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  modalClose: { position: 'absolute', top: SPACING.md, right: SPACING.md, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  modalIcon: { fontSize: 48, marginBottom: 8 },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', marginBottom: 10 },
  modalDetail: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, lineHeight: 22, marginBottom: SPACING.md },
  modalEffects: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  effectCard: { flex: 1, alignItems: 'center', padding: SPACING.sm, borderRadius: 14, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  effectValue: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  effectLabel: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '600', marginTop: 4 },
  effectDesc: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: 2 },
  askAiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  askAiText: { fontWeight: '700', fontSize: FONT_SIZES.sm },
});
