import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme';
import { ProcurementStatus } from '../types';

interface StatusBadgeProps {
  status: ProcurementStatus | 'AVAILABLE' | 'FEW_LEFT' | 'FULL' | 'OPEN' | 'BUSY' | 'CLOSED';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PAYMENT_COMPLETED':
      case 'ACCEPTED':
      case 'AVAILABLE':
      case 'OPEN':
        return {
          bg: COLORS.primarySurface,
          text: COLORS.primaryDark,
          label: status.replace('_', ' '),
          dot: COLORS.primary,
        };
      case 'PROCESSING':
      case 'QUALITY_CHECK':
      case 'WEIGHMENT':
      case 'PAYMENT_PROCESSING':
      case 'FEW_LEFT':
      case 'BUSY':
        return {
          bg: COLORS.accentLight,
          text: COLORS.accentDark,
          label: status.replace('_', ' '),
          dot: COLORS.accent,
        };
      case 'REJECTED':
      case 'FULL':
      case 'CLOSED':
        return {
          bg: COLORS.dangerSurface,
          text: COLORS.danger,
          label: status.replace('_', ' '),
          dot: COLORS.danger,
        };
      case 'BOOKED':
      case 'ARRIVED':
      case 'WAITING':
      default:
        return {
          bg: COLORS.infoSurface,
          text: COLORS.info,
          label: status.replace('_', ' '),
          dot: COLORS.info,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        size === 'md' ? styles.badgeMd : styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text
        style={[
          styles.text,
          { color: config.text },
          size === 'md' ? styles.textMd : styles.textSm,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  badgeMd: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  textMd: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
