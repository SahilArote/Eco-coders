import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  onPress?: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  variant = 'elevated',
}) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.xs,
  },
  elevated: {
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  flat: {
    backgroundColor: COLORS.surfaceMuted,
  },
});
