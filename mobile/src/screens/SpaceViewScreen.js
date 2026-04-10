import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';
import { issAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function SpaceViewScreen({ navigation }) {
  const [issPosition, setIssPosition] = useState(null);
  const [simSpeed, setSimSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [orbitCount, setOrbitCount] = useState(0);

  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const issRef = useRef(null);
  const earthRef = useRef(null);
  const moonRef = useRef(null);
  const issOrbitLineRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);
  const glRef = useRef(null);

  // Rotation state for pan gestures
  const rotX = useRef(0);
  const rotY = useRef(0);
  const lastTouch = useRef({ x: 0, y: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch real ISS position
  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await issAPI.getPosition();
        setIssPosition(res.data.data);
      } catch (e) {}
    };
    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    },
    onPanResponderMove: (e) => {
      const dx = e.nativeEvent.pageX - lastTouch.current.x;
      const dy = e.nativeEvent.pageY - lastTouch.current.y;
      rotY.current += dx * 0.005;
      rotX.current += dy * 0.005;
      rotX.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotX.current));
      lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    },
  });

  const onContextCreate = useCallback(async (gl) => {
    glRef.current = gl;
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;

    const renderer = new Renderer({ gl });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // === STARS ===
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(starGeo, starMat));

    // === SUN (distant light source) ===
    const sunLight = new THREE.DirectionalLight(0xfff2cc, 2.5);
    sunLight.position.set(20, 5, 10);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x111133, 0.8));

    // === EARTH ===
    const earthGeo = new THREE.SphereGeometry(2, 64, 64);
    // Procedural Earth using vertex colors approximation
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1a6b9e,
      emissive: 0x001122,
      shininess: 80,
      transparent: false,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);
    earthRef.current = earth;

    // Earth continents (green patches via separate mesh)
    const continentGeo = new THREE.SphereGeometry(2.01, 32, 32);
    const continentMat = new THREE.MeshPhongMaterial({
      color: 0x2d7a3a,
      emissive: 0x0a1a0a,
      wireframe: false,
      transparent: true,
      opacity: 0.7,
    });
    // Use a simple pattern to fake continents
    const continentCount = continentGeo.attributes.position.count;
    const colors = new Float32Array(continentCount * 3);
    for (let i = 0; i < continentCount; i++) {
      const x = continentGeo.attributes.position.getX(i);
      const y = continentGeo.attributes.position.getY(i);
      const z = continentGeo.attributes.position.getZ(i);
      const lat = Math.asin(y / Math.sqrt(x * x + y * y + z * z));
      const lon = Math.atan2(z, x);
      // Simple noise pattern for continents
      const n = Math.sin(lat * 4) * Math.cos(lon * 3) + Math.sin(lat * 7 + lon * 5) * 0.5;
      const isLand = n > 0.2;
      colors[i * 3] = isLand ? 0.18 : 0.1;
      colors[i * 3 + 1] = isLand ? 0.5 : 0.42;
      colors[i * 3 + 2] = isLand ? 0.23 : 0.62;
    }
    continentGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const landMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 20 });
    scene.add(new THREE.Mesh(continentGeo, landMat));

    // Earth atmosphere glow
    const atmGeo = new THREE.SphereGeometry(2.15, 32, 32);
    const atmMat = new THREE.MeshPhongMaterial({
      color: 0x4fc3f7,
      emissive: 0x1a237e,
      transparent: true,
      opacity: 0.18,
      side: THREE.FrontSide,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // === ISS ORBIT PATH ===
    const orbitRadius = 2.55;
    const orbitPoints = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      // ISS orbit inclination ~51.6°
      const inclination = 51.6 * (Math.PI / 180);
      orbitPoints.push(new THREE.Vector3(
        orbitRadius * Math.cos(angle),
        orbitRadius * Math.sin(angle) * Math.sin(inclination),
        orbitRadius * Math.sin(angle) * Math.cos(inclination)
      ));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35 });
    scene.add(new THREE.Line(orbitGeo, orbitMat));

    // === ISS MODEL (simplified) ===
    const issGroup = new THREE.Group();
    // Main body
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.05, 0.05);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xc0c0c0, shininess: 120 });
    issGroup.add(new THREE.Mesh(bodyGeo, bodyMat));
    // Solar panels left
    const panelGeo = new THREE.BoxGeometry(0.18, 0.001, 0.07);
    const panelMat = new THREE.MeshPhongMaterial({ color: 0x1565c0, emissive: 0x0d47a1, shininess: 60 });
    const panelL = new THREE.Mesh(panelGeo, panelMat);
    panelL.position.set(-0.15, 0, 0);
    issGroup.add(panelL);
    const panelR = new THREE.Mesh(panelGeo, panelMat);
    panelR.position.set(0.15, 0, 0);
    issGroup.add(panelR);
    // Glow point
    const issLight = new THREE.PointLight(0x00e5ff, 1.5, 0.5);
    issGroup.add(issLight);

    scene.add(issGroup);
    issRef.current = issGroup;

    // === MOON ===
    const moonGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const moonMat = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x111111, shininess: 5 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moon);
    moonRef.current = moon;

    // === RENDER LOOP ===
    let orbitAngle = 0;
    let lastOrbit = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (!isPlaying) return;

      timeRef.current += 0.016 * simSpeed;
      const t = timeRef.current;

      // Earth rotation
      if (earthRef.current) {
        earthRef.current.rotation.y = t * 0.05;
      }

      // ISS orbit
      orbitAngle += 0.008 * simSpeed;
      if (orbitAngle - lastOrbit > Math.PI * 2) {
        lastOrbit = orbitAngle;
        setOrbitCount(c => c + 1);
      }
      const inclination = 51.6 * (Math.PI / 180);
      if (issRef.current) {
        issRef.current.position.set(
          orbitRadius * Math.cos(orbitAngle),
          orbitRadius * Math.sin(orbitAngle) * Math.sin(inclination),
          orbitRadius * Math.sin(orbitAngle) * Math.cos(inclination)
        );
        issRef.current.rotation.z = orbitAngle;
      }

      // Moon orbit
      if (moonRef.current) {
        moonRef.current.position.set(
          Math.cos(t * 0.01) * 6,
          Math.sin(t * 0.005) * 0.5,
          Math.sin(t * 0.01) * 6
        );
        moonRef.current.rotation.y = t * 0.01;
      }

      // Camera rotation from pan gesture
      const pivot = new THREE.Group();
      scene.add(pivot);
      camera.position.x = Math.sin(rotY.current) * 8 * Math.cos(rotX.current);
      camera.position.y = Math.sin(rotX.current) * 6 + 2;
      camera.position.z = Math.cos(rotY.current) * 8 * Math.cos(rotX.current);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  }, [simSpeed, isPlaying]);

  const speedOptions = [0.5, 1, 2, 5];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background */}
      <LinearGradient colors={['#000005', '#020816', '#060d24']} style={StyleSheet.absoluteFill} />

      {/* 3D Canvas */}
      <View style={styles.glContainer} {...panResponder.panHandlers}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      </View>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>4D Space View</Text>
          <Text style={styles.headerSub}>Interactive Solar System</Text>
        </View>
        <TouchableOpacity style={styles.labelBtn} onPress={() => setShowLabels(!showLabels)}>
          <Ionicons name={showLabels ? 'eye' : 'eye-off'} size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Labels overlay */}
      {showLabels && (
        <Animated.View style={[styles.labelsOverlay, { opacity: fadeAnim }]}>
          <View style={styles.labelTag}>
            <View style={[styles.labelDot, { backgroundColor: '#4fc3f7' }]} />
            <Text style={styles.labelText}>Earth</Text>
          </View>
          <View style={styles.labelTag}>
            <View style={[styles.labelDot, { backgroundColor: '#00e5ff' }]} />
            <Text style={styles.labelText}>ISS</Text>
          </View>
          <View style={styles.labelTag}>
            <View style={[styles.labelDot, { backgroundColor: '#888' }]} />
            <Text style={styles.labelText}>Moon</Text>
          </View>
        </Animated.View>
      )}

      {/* ISS Real Data */}
      {issPosition && (
        <Animated.View style={[styles.issData, { opacity: fadeAnim }]}>
          <View style={styles.issDataRow}>
            <Ionicons name="navigate" size={12} color={COLORS.primary} />
            <Text style={styles.issDataText}>
              {issPosition.latitude?.toFixed(2)}°, {issPosition.longitude?.toFixed(2)}°
            </Text>
          </View>
          <View style={styles.issDataRow}>
            <Ionicons name="speedometer" size={12} color={COLORS.accent} />
            <Text style={styles.issDataText}>{(issPosition.speed || 27600).toLocaleString()} km/h</Text>
          </View>
          <View style={styles.issDataRow}>
            <Ionicons name="layers" size={12} color="#a5d6a7" />
            <Text style={styles.issDataText}>{issPosition.altitude || 408} km alt</Text>
          </View>
        </Animated.View>
      )}

      {/* Controls */}
      <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
        {/* Speed control */}
        <View style={styles.speedRow}>
          <Text style={styles.controlLabel}>SPEED</Text>
          {speedOptions.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.speedBtn, simSpeed === s && styles.speedBtnActive]}
              onPress={() => setSimSpeed(s)}
            >
              <Text style={[styles.speedBtnText, simSpeed === s && styles.speedBtnTextActive]}>
                {s}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Play/Pause + orbit count */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.playBtn} onPress={() => setIsPlaying(!isPlaying)}>
            <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={40} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.orbitInfo}>
            <Text style={styles.orbitCount}>{orbitCount}</Text>
            <Text style={styles.orbitLabel}>Orbits Simulated</Text>
          </View>
          <View style={styles.dragHint}>
            <Ionicons name="hand-left-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.dragText}>Drag to rotate</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000010' },
  glContainer: { ...StyleSheet.absoluteFillObject },
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
  headerTitle: {
    color: COLORS.textPrimary, fontSize: FONT_SIZES.lg,
    fontWeight: '700', textAlign: 'center',
  },
  headerSub: {
    color: COLORS.textMuted, fontSize: FONT_SIZES.xs,
    textAlign: 'center', letterSpacing: 1,
  },
  labelBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  labelsOverlay: {
    position: 'absolute',
    top: 130,
    right: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  labelTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelDot: { width: 8, height: 8, borderRadius: 4 },
  labelText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs },
  issData: {
    position: 'absolute',
    top: 130,
    left: SPACING.md,
    backgroundColor: 'rgba(0,20,40,0.75)',
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    gap: 4,
  },
  issDataRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  issDataText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, fontVariant: ['tabular-nums'] },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    backgroundColor: 'rgba(0,5,20,0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.md,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,229,255,0.15)',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  controlLabel: {
    color: COLORS.textMuted, fontSize: FONT_SIZES.xs,
    fontWeight: '700', letterSpacing: 1.5, marginRight: 4,
  },
  speedBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    backgroundColor: 'transparent',
  },
  speedBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  speedBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  speedBtnTextActive: { color: '#000' },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playBtn: {},
  orbitInfo: { alignItems: 'center' },
  orbitCount: { color: COLORS.primary, fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  orbitLabel: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, letterSpacing: 0.5 },
  dragHint: { alignItems: 'center', gap: 2 },
  dragText: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs },
});
