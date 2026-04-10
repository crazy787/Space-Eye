import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../../styles/theme';

const GlassCard = ({ children, style, gradientColors, noBorder = false }) => {
  return (
    <LinearGradient
      colors={gradientColors || COLORS.gradientCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, !noBorder && styles.border, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  border: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
});

export default GlassCard;
