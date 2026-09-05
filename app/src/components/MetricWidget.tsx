import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

interface MetricWidgetProps {
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'accent' | 'default';
  style?: ViewStyle;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  label,
  value,
  unit,
  sublabel,
  icon,
  variant = 'default',
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        variant === 'primary' && styles.primaryBorder,
        variant === 'accent' && styles.accentBorder,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            variant === 'primary' && styles.primaryValue,
            variant === 'accent' && styles.accentValue,
          ]}
        >
          {value}
        </Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    ...SHADOWS.subtle,
  },
  primaryBorder: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  accentBorder: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    marginLeft: SPACING.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  primaryValue: {
    color: COLORS.primary,
  },
  accentValue: {
    color: COLORS.accentDark,
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  sublabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
