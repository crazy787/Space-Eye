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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const MISSIONS = [
  {
    id: 'falcon9',
    name: 'Falcon 9',
    agency: 'SpaceX',
    flag: '🚀',
    color: '#00b0ff',
    stages: [
      { name: 'T-0: Ignition', duration: 3000, desc: 'Merlin engines ignite at full thrust', phase: 'launch' },
      { name: 'T+1:20 Max-Q', duration: 2500, desc: 'Maximum aerodynamic pressure — throttle reduces', phase: 'ascent' },
      { name: 'T+2:30 MECO', duration: 2500, desc: 'Main engine cutoff — stage 1 burnout', phase: 'ascent' },
      { name: 'T+2:33 Sep', duration: 2500, desc: 'Stage separation — fairings deployed', phase: 'separation' },
      { name: 'T+8:30 SECO', duration: 2500, desc: 'Second engine cutoff — orbit achieved', phase: 'orbit' },
      { name: 'Booster Return', duration: 3000, desc: 'Grid fins deploy — engine relight for landing', phase: 'landing' },
    ],
  },
  {
    id: 'soyuz',
    name: 'Soyuz MS',
    agency: 'Roscosmos',
    flag: '🛸',
    color: '#ff7043',
    stages: [
      { name: 'T-0: Ignition', duration: 3000, desc: 'RD-108 and RD-107 engines ignite', phase: 'launch' },
      { name: 'T+1:58 Strap-off', duration: 2500, desc: 'Four liquid boosters jettisoned', phase: 'ascent' },
      { name: 'T+4:45 Core Sep', duration: 2500, desc: 'Core stage separation, third stage ignites', phase: 'separation' },
      { name: 'T+526 Orbit', duration: 2500, desc: 'Third stage cutoff, Soyuz in parking orbit', phase: 'orbit' },
      { name: 'ISS Approach', duration: 3000, desc: 'Rendezvous and docking burns over 2 days', phase: 'docking' },
      { name: 'Docking', duration: 3000, desc: 'Soft capture — pressurization and hatch open', phase: 'docking' },
    ],
  },
  {
    id: 'crew_dragon',
    name: 'Crew Dragon',
    agency: 'SpaceX',
    flag: '🐉',
    color: '#ce93d8',
    stages: [
      { name: 'Pad Abort Check', duration: 2500, desc: 'SuperDraco abort system armed — launch commit', phase: 'launch' },
      { name: 'Liftoff', duration: 3000, desc: 'Dragon rides Falcon 9 into low Earth orbit', phase: 'launch' },
      { name: 'Orbit Insert', duration: 2500, desc: 'Dragon separates, performs phasing burns', phase: 'orbit' },
      { name: 'Approach', duration: 2500, desc: 'Automated rendezvous using LIDAR sensors', phase: 'docking' },
      { name: 'Soft Dock', duration: 2500, desc: 'IDSS interface capture — hooks engaged', phase: 'docking' },
      { name: 'Hard Dock', duration: 2500, desc: 'Pressurization check — crew transfer begins', phase: 'docking' },
    ],
  },
];

const PHASE_COLORS = {
  launch: '#ff6b35',
  ascent: '#ffd166',
  separation: '#06d6a0',
  orbit: '#00b4d8',
  landing: '#7209b7',
  docking: '#f72585',
};

export default function RocketSimScreen({ navigation }) {
  const [selectedMission, setSelectedMission] = useState(MISSIONS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Animations
  const rocketY = useRef(new Animated.Value(0)).current;
  const rocketRotate = useRef(new Animated.Value(0)).current;
  const exhaustScale = useRef(new Animated.Value(0)).current;
  const exhaustOpacity = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const stageAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const landingFlash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const resetSim = () => {
    setIsRunning(false);
    setCurrentStage(-1);
    setProgress(0);
    setCompleted(false);
    rocketY.setValue(0);
    rocketRotate.setValue(0);
    exhaustScale.setValue(0);
    exhaustOpacity.setValue(0);
    progressAnim.setValue(0);
  };

  const runStage = async (stageIdx) => {
    if (stageIdx >= selectedMission.stages.length) {
      setCompleted(true);
      setIsRunning(false);
      setCurrentStage(-1);
      return;
    }

    const stage = selectedMission.stages[stageIdx];
    setCurrentStage(stageIdx);

    // Stage progress
    Animated.timing(progressAnim, {
      toValue: (stageIdx + 1) / selectedMission.stages.length,
      duration: stage.duration,
      useNativeDriver: false,
    }).start();

    // Phase-specific animations
    if (stage.phase === 'launch') {
      // Shake + exhaust
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeX, { toValue: 3, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: -3, duration: 60, useNativeDriver: true }),
        ]),
        { iterations: Math.floor(stage.duration / 120) }
      ).start();
      Animated.timing(exhaustScale, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Animated.timing(exhaustOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Animated.timing(rocketY, { toValue: -30, duration: stage.duration, useNativeDriver: true }).start();
    }

    if (stage.phase === 'ascent') {
      Animated.timing(rocketY, { toValue: -80, duration: stage.duration, useNativeDriver: true }).start();
      Animated.timing(rocketRotate, { toValue: 0.1, duration: stage.duration, useNativeDriver: true }).start();
    }

    if (stage.phase === 'separation') {
      Animated.timing(exhaustScale, { toValue: 0.4, duration: 500, useNativeDriver: true }).start();
      Animated.timing(rocketY, { toValue: -120, duration: stage.duration, useNativeDriver: true }).start();
    }

    if (stage.phase === 'orbit') {
      Animated.timing(exhaustScale, { toValue: 0, duration: 400, useNativeDriver: true }).start();
      Animated.timing(exhaustOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
      Animated.timing(rocketY, { toValue: -150, duration: stage.duration, useNativeDriver: true }).start();
    }

    if (stage.phase === 'landing') {
      Animated.timing(rocketRotate, { toValue: 0, duration: 800, useNativeDriver: true }).start();
      Animated.timing(rocketY, { toValue: -80, duration: stage.duration, useNativeDriver: true }).start();
      Animated.timing(exhaustScale, { toValue: 0.5, duration: 600, useNativeDriver: true }).start();
      Animated.timing(exhaustOpacity, { toValue: 0.8, duration: 600, useNativeDriver: true }).start();
    }

    if (stage.phase === 'docking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(landingFlash, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(landingFlash, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }

    // Animate stage card in
    stageAnim.setValue(0);
    Animated.spring(stageAnim, { toValue: 1, useNativeDriver: true }).start();

    // Wait for stage to complete
    await new Promise(r => setTimeout(r, stage.duration));
    setProgress((stageIdx + 1) / selectedMission.stages.length);
    await runStage(stageIdx + 1);
  };

  const startSim = () => {
    resetSim();
    setIsRunning(true);
    setTimeout(() => runStage(0), 300);
  };

  const rotateInterp = rocketRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '15deg'] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#000008', '#0a0010', '#140020']} style={StyleSheet.absoluteFill} />

      {/* Stars bg */}
      {Array.from({ length: 40 }).map((_, i) => (
        <View key={i} style={[styles.star, {
          top: Math.random() * height,
          left: Math.random() * width,
          width: Math.random() * 2 + 1,
          height: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
        }]} />
      ))}

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Launch Simulator</Text>
          <Text style={styles.headerSub}>Rocket & Docking Missions</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={resetSim}>
          <Ionicons name="refresh" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </Animated.View>

      {/* Mission Selector */}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.missionPicker, { opacity: fadeAnim }]}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: SPACING.sm }}
      >
        {MISSIONS.map(m => (
          <TouchableOpacity
            key={m.id}
            onPress={() => { if (!isRunning) { setSelectedMission(m); resetSim(); } }}
            style={[styles.missionChip, {
              borderColor: m.color + '80',
              backgroundColor: selectedMission.id === m.id ? m.color + '25' : 'rgba(255,255,255,0.05)',
            }]}
          >
            <Text style={styles.missionEmoji}>{m.flag}</Text>
            <View>
              <Text style={[styles.missionName, { color: m.color }]}>{m.name}</Text>
              <Text style={styles.missionAgency}>{m.agency}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {/* Sim Arena */}
      <View style={styles.simArena}>
        {/* Launch pad */}
        <View style={styles.launchPad}>
          <View style={styles.padArm} />
          <View style={styles.padBase} />
        </View>

        {/* Exhaust / flame */}
        <Animated.View style={[styles.exhaustContainer, {
          opacity: exhaustOpacity,
          transform: [{ scaleY: exhaustScale }, { scaleX: exhaustScale }],
        }]}>
          <LinearGradient
            colors={['#ff9800', '#ff5722', '#f44336aa', 'transparent']}
            style={styles.exhaustFlame}
          />
          <LinearGradient
            colors={['#fff176', '#ffcc02', 'transparent']}
            style={styles.exhaustCore}
          />
        </Animated.View>

        {/* Rocket */}
        <Animated.View style={[styles.rocketContainer, {
          transform: [
            { translateY: rocketY },
            { translateX: shakeX },
            { rotate: rotateInterp },
          ],
        }]}>
          {/* Nose cone */}
          <View style={[styles.noseCone, { borderBottomColor: selectedMission.color }]} />
          {/* Body */}
          <View style={[styles.body, { backgroundColor: selectedMission.color + '20', borderColor: selectedMission.color + '60' }]}>
            <Text style={styles.rocketLabel}>{selectedMission.flag}</Text>
            <View style={[styles.bodyStripe, { backgroundColor: selectedMission.color }]} />
          </View>
          {/* Fins */}
          <View style={styles.finRow}>
            <View style={[styles.fin, styles.finLeft, { borderTopColor: selectedMission.color }]} />
            <View style={styles.finSpace} />
            <View style={[styles.fin, styles.finRight, { borderTopColor: selectedMission.color }]} />
          </View>
          {/* Engines */}
          <View style={styles.engineRow}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.engine, { backgroundColor: selectedMission.color + '80' }]} />
            ))}
          </View>
        </Animated.View>

        {/* Docking indicator */}
        {currentStage >= 0 && selectedMission.stages[currentStage]?.phase === 'docking' && (
          <Animated.View style={[styles.dockingTarget, { opacity: landingFlash }]}>
            <View style={styles.dockRing} />
            <Text style={styles.dockText}>ISS</Text>
          </Animated.View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth, backgroundColor: selectedMission.color }]} />
      </View>

      {/* Stage Info */}
      {currentStage >= 0 && !completed && (
        <Animated.View style={[styles.stageCard, {
          opacity: stageAnim,
          transform: [{ translateY: stageAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <View style={[styles.phaseBadge, { backgroundColor: PHASE_COLORS[selectedMission.stages[currentStage]?.phase] + '30', borderColor: PHASE_COLORS[selectedMission.stages[currentStage]?.phase] + '60' }]}>
            <Text style={[styles.phaseText, { color: PHASE_COLORS[selectedMission.stages[currentStage]?.phase] }]}>
              {selectedMission.stages[currentStage]?.phase?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.stageName}>{selectedMission.stages[currentStage]?.name}</Text>
          <Text style={styles.stageDesc}>{selectedMission.stages[currentStage]?.desc}</Text>
          <Text style={styles.stageProgress}>{currentStage + 1} / {selectedMission.stages.length}</Text>
        </Animated.View>
      )}

      {/* Completed */}
      {completed && (
        <Animated.View style={[styles.stageCard, styles.completedCard, { opacity: fadeAnim }]}>
          <Text style={styles.completedIcon}>🎉</Text>
          <Text style={styles.completedTitle}>Mission Complete!</Text>
          <Text style={styles.completedSub}>{selectedMission.name} — All stages nominal</Text>
          <TouchableOpacity style={[styles.replayBtn, { borderColor: selectedMission.color }]} onPress={resetSim}>
            <Ionicons name="refresh" size={16} color={selectedMission.color} />
            <Text style={[styles.replayText, { color: selectedMission.color }]}>Replay Mission</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Launch button */}
      {!isRunning && !completed && (
        <Animated.View style={[styles.launchBtnContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={[styles.launchBtn, { borderColor: selectedMission.color }]} onPress={startSim}>
            <LinearGradient
              colors={[selectedMission.color + '40', selectedMission.color + '20']}
              style={styles.launchBtnGrad}
            >
              <Ionicons name="rocket" size={22} color={selectedMission.color} />
              <Text style={[styles.launchBtnText, { color: selectedMission.color }]}>LAUNCH SIMULATION</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000008' },
  star: { position: 'absolute', borderRadius: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  resetBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.title, fontWeight: '700' },
  headerSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.caption, letterSpacing: 1 },
  missionPicker: { maxHeight: 80, marginBottom: SPACING.sm },
  missionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: 16, borderWidth: 1,
  },
  missionEmoji: { fontSize: 22 },
  missionName: { fontSize: FONT_SIZES.small, fontWeight: '700' },
  missionAgency: { color: COLORS.textMuted, fontSize: FONT_SIZES.caption },
  simArena: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  launchPad: { alignItems: 'center', zIndex: 2 },
  padArm: { width: 60, height: 6, backgroundColor: '#555', borderRadius: 3 },
  padBase: { width: 80, height: 12, backgroundColor: '#444', borderRadius: 4 },
  exhaustContainer: {
    position: 'absolute', bottom: 95,
    alignItems: 'center', justifyContent: 'flex-start',
    width: 30, overflow: 'visible',
  },
  exhaustFlame: { width: 24, height: 60, borderRadius: 12, marginTop: 0 },
  exhaustCore: { position: 'absolute', top: 0, width: 12, height: 40, borderRadius: 6 },
  rocketContainer: { alignItems: 'center', marginBottom: 18, zIndex: 5 },
  noseCone: {
    width: 0, height: 0,
    borderLeftWidth: 15, borderRightWidth: 15, borderBottomWidth: 30,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  body: {
    width: 30, height: 70,
    borderRadius: 4, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  rocketLabel: { fontSize: 18, marginBottom: 4 },
  bodyStripe: { width: '100%', height: 3, position: 'absolute', bottom: 20 },
  finRow: { flexDirection: 'row', alignItems: 'flex-start' },
  finSpace: { width: 24 },
  fin: { width: 0, height: 0, borderBottomWidth: 0 },
  finLeft: {
    borderTopWidth: 18, borderRightWidth: 12,
    borderTopColor: 'transparent', borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },
  finRight: {
    borderTopWidth: 18, borderLeftWidth: 12,
    borderTopColor: 'transparent', borderLeftColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },
  engineRow: { flexDirection: 'row', gap: 3, marginTop: 2 },
  engine: { width: 8, height: 8, borderRadius: 4 },
  dockingTarget: {
    position: 'absolute', top: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  dockRing: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: '#00e5ff',
    borderStyle: 'dashed',
  },
  dockText: { color: '#00e5ff', fontSize: FONT_SIZES.caption, fontWeight: '700', marginTop: 4 },
  progressContainer: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: SPACING.md, borderRadius: 2,
  },
  progressBar: { height: '100%', borderRadius: 2 },
  stageCard: {
    marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    backgroundColor: 'rgba(10,5,20,0.9)',
    borderRadius: 16, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  phaseBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1, marginBottom: 6,
  },
  phaseText: { fontSize: FONT_SIZES.caption, fontWeight: '700', letterSpacing: 1.5 },
  stageName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '700' },
  stageDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginTop: 4 },
  stageProgress: { color: COLORS.textMuted, fontSize: FONT_SIZES.caption, marginTop: 6, textAlign: 'right' },
  completedCard: { alignItems: 'center' },
  completedIcon: { fontSize: 40, marginBottom: 8 },
  completedTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.heading, fontWeight: '800' },
  completedSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.small, marginBottom: 12 },
  replayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1,
  },
  replayText: { fontWeight: '700', fontSize: FONT_SIZES.small },
  launchBtnContainer: { padding: SPACING.md, paddingBottom: 34 },
  launchBtn: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  launchBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  launchBtnText: { fontSize: FONT_SIZES.bodyLarge, fontWeight: '800', letterSpacing: 2 },
});
