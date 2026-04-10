import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, SHADOWS } from '../../styles/theme';

const GradientButton = ({
  title,
  onPress,
  gradientColors,
  style,
  textStyle,
  icon,
  loading = false,
  disabled = false,
  size = 'md', // sm, md, lg
}) => {
  const buttonSizes = {
    sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, fontSize: FONT_SIZES.small },
    md: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, fontSize: FONT_SIZES.bodyLarge },
    lg: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl, fontSize: FONT_SIZES.subtitle },
  };

  const sizeConfig = buttonSizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.wrapper, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={disabled ? ['#3A3D5C', '#2A2D4C'] : (gradientColors || COLORS.gradientPrimary)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.button,
          {
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textPrimary} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, { fontSize: sizeConfig.fontSize }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  text: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default GradientButton;
