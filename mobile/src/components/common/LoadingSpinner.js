import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../styles/theme';

const LoadingSpinner = ({ message = 'Loading...', size = 'large', fullScreen = true }) => {
  const content = (
    <View style={fullScreen ? styles.fullScreen : styles.inline}>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size={size} color={COLORS.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );

  return content;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    marginTop: SPACING.sm,
  },
});

export default LoadingSpinner;
