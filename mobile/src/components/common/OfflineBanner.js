import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../../context/OfflineContext';
import { COLORS, FONT_SIZES, SPACING } from '../../styles/theme';

const OfflineBanner = ({ showLastUpdated = true }) => {
  const { isOnline, getTimeSinceUpdate, dependencyWarnings } = useOffline();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const hasWarnings = dependencyWarnings.length > 0;
  const shouldShow = !isOnline || hasWarnings;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shouldShow, slideAnim]);

  if (!shouldShow) return null;

  const timeSince = getTimeSinceUpdate();
  const primaryWarning = dependencyWarnings[0];
  const title = !isOnline ? 'Offline mode' : primaryWarning?.title || 'Limited app mode';
  const subtitle = !isOnline
    ? showLastUpdated && timeSince !== 'Never'
      ? `Last updated ${timeSince}`
      : 'Using cached data when available'
    : primaryWarning?.message;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.content}>
        <Ionicons
          name={!isOnline ? 'cloud-offline-outline' : 'warning-outline'}
          size={16}
          color="#FFB74D"
        />
        <Text style={styles.text}>{title}</Text>
        {subtitle ? <Text style={styles.subText}>{subtitle}</Text> : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  text: {
    color: '#FFB74D',
    fontSize: FONT_SIZES.small,
    fontWeight: '700',
  },
  subText: {
    color: 'rgba(255, 183, 77, 0.7)',
    fontSize: FONT_SIZES.caption || 11,
    fontWeight: '500',
  },
});

export default OfflineBanner;
