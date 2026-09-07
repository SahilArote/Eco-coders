import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

interface KycReminderBannerProps {
  onCompleteKyc: () => void;
}

export const KycReminderBanner: React.FC<KycReminderBannerProps> = ({
  onCompleteKyc,
}) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={onCompleteKyc}
      activeOpacity={0.88}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="shield-half" size={24} color={COLORS.accentDark} />
      </View>

      <View style={styles.contentWrap}>
        <View style={styles.badgeRow}>
          <Text style={styles.title}>{t('kycBanner.title')}</Text>
          <View style={styles.recBadge}>
            <Text style={styles.recBadgeText}>{t('kyc.recommendedBadge')}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {t('kycBanner.description')}
        </Text>

        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>{t('kycBanner.cta')}</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.primaryDark} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3', // Warm harvest gold tint
    borderWidth: 1.5,
    borderColor: '#FDE047',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contentWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#854D0E',
    flex: 1,
    marginRight: SPACING.xs,
  },
  recBadge: {
    backgroundColor: '#CA8A04',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 12,
    color: '#713F12',
    lineHeight: 16,
    marginBottom: 6,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginRight: 4,
  },
});
