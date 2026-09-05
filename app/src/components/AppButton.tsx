import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    const base: ViewStyle[] = [styles.button, styles[`size_${size}`]];
    if (variant === 'primary') base.push(styles.primary);
    if (variant === 'secondary') base.push(styles.secondary);
    if (variant === 'outline') base.push(styles.outline);
    if (variant === 'danger') base.push(styles.danger);
    if (disabled) base.push(styles.disabled);
    if (style) base.push(style);
    return base;
  };

  const getTextStyle = () => {
    const base: TextStyle[] = [styles.text, styles[`textSize_${size}`]];
    if (variant === 'primary') base.push(styles.textPrimary);
    if (variant === 'secondary') base.push(styles.textSecondary);
    if (variant === 'outline') base.push(styles.textOutline);
    if (variant === 'danger') base.push(styles.textDanger);
    if (disabled) base.push(styles.textDisabled);
    if (textStyle) base.push(textStyle);
    return base;
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? COLORS.primary : COLORS.textInverse}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  size_sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: SPACING.xl,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.accentLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  disabled: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 16,
  },
  textPrimary: {
    color: COLORS.textInverse,
  },
  textSecondary: {
    color: COLORS.accentDark,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textDanger: {
    color: COLORS.textInverse,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
});
