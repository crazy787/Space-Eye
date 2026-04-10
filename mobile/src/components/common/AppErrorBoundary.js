import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../styles/theme';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error',
    };
  }

  componentDidCatch(error, info) {
    console.error('AppErrorBoundary caught an error:', error, info);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      errorMessage: '',
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(255, 107, 53, 0.18)', 'rgba(108, 99, 255, 0.16)']}
          style={styles.card}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="warning-outline" size={28} color="#FFB74D" />
          </View>
          <Text style={styles.title}>App recovery mode</Text>
          <Text style={styles.message}>
            A system dependency failed to initialize. The app stayed up, but one feature may be limited.
          </Text>
          <Text style={styles.detail}>{this.state.errorMessage}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 183, 77, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  detail: {
    color: '#FFB74D',
    fontSize: FONT_SIZES.small,
    marginBottom: SPACING.lg,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
  },
});

export default AppErrorBoundary;
