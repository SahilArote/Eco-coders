import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { useAppStore } from '../../state/useAppStore';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onOpenGrievance: () => void;
  onLogout: () => void;
  onOpenKyc?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onEditProfile,
  onOpenGrievance,
  onLogout,
  onOpenKyc,
}) => {
  const { t } = useTranslation();
  const {
    farmer,
    language,
    setLanguage,
    resetToInitialDemo,
    kycStatus,
    bankDetails,
  } = useAppStore();

  const handleReset = () => {
    resetToInitialDemo();
    Alert.alert(t('profile.resetAlertTitle'), t('profile.resetAlertDesc'));
  };

  return (
    <View style={styles.container}>
      <AppHeader title={t('profile.title')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Farmer Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{farmer.fullName}</Text>
            <Text style={styles.phone}>{farmer.phone}</Text>
            <Text style={styles.location}>
              {farmer.village}, {farmer.district}, {farmer.state}
            </Text>
          </View>
        </View>

        {/* Landholding & Crop Badges */}
        <View style={styles.landCard}>
          <View style={styles.landMetric}>
            <Text style={styles.landLabel}>{t('profile.cultivableLand')}</Text>
            <Text style={styles.landValue}>{farmer.landSizeAcres} {t('common.acres')}</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.cropMetric}>
            <Text style={styles.landLabel}>{t('profile.registeredCrops')}</Text>
            <Text style={styles.landValue}>
              {farmer.registeredCrops.join(', ')}
            </Text>
          </View>
        </View>

        {/* Bank KYC Status Card */}
        <View style={styles.kycCard}>
          <View style={styles.kycHeaderRow}>
            <View style={styles.kycTitleLeft}>
              <Ionicons
                name={
                  kycStatus === 'COMPLETED'
                    ? 'shield-checkmark'
                    : 'shield-outline'
                }
                size={20}
                color={
                  kycStatus === 'COMPLETED'
                    ? COLORS.primary
                    : COLORS.accentDark
                }
              />
              <Text style={styles.kycTitle}>{t('profile.bankKycTitle')}</Text>
            </View>
            <View
              style={[
                styles.kycStatusBadge,
                kycStatus === 'COMPLETED'
                  ? styles.kycBadgeCompleted
                  : styles.kycBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.kycStatusText,
                  kycStatus === 'COMPLETED'
                    ? styles.kycTextCompleted
                    : styles.kycTextPending,
                ]}
              >
                {kycStatus === 'COMPLETED'
                  ? t('profile.kycStatusCompleted')
                  : t('profile.kycStatusPending')}
              </Text>
            </View>
          </View>

          {kycStatus === 'COMPLETED' && bankDetails ? (
            <View style={styles.bankDetailBox}>
              <View style={styles.bankDetailRow}>
                <Ionicons
                  name="business-outline"
                  size={15}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.bankNameText}>{bankDetails.bankName}</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Ionicons
                  name="card-outline"
                  size={15}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.maskedAcctText}>
                  {bankDetails.accountNumberMasked}
                </Text>
              </View>
              <Text style={styles.dbtHintText}>{t('profile.dbtReady')}</Text>
            </View>
          ) : (
            <View style={styles.kycPendingBox}>
              <Text style={styles.kycPendingNotice}>
                {t('profile.pendingKycNotice')}
              </Text>
              {onOpenKyc && (
                <TouchableOpacity
                  style={styles.completeKycBtn}
                  onPress={onOpenKyc}
                  activeOpacity={0.8}
                >
                  <Text style={styles.completeKycBtnText}>
                    {t('profile.completeKycNow')}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={COLORS.textInverse}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.preferredLanguage')}</Text>
          <View style={styles.langRow}>
            {[
              { code: 'en' as const, label: 'English' },
              { code: 'hi' as const, label: 'हिंदी (Hindi)' },
              { code: 'mr' as const, label: 'मराठी (Marathi)' },
            ].map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langCard,
                  language === item.code && styles.langCardActive,
                ]}
                onPress={() => setLanguage(item.code)}
              >
                <Ionicons
                  name={
                    language === item.code
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={18}
                  color={
                    language === item.code ? COLORS.primary : COLORS.textMuted
                  }
                />
                <Text
                  style={[
                    styles.langText,
                    language === item.code && styles.langTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Menu Options */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={onEditProfile}>
            <View style={styles.menuLeft}>
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuLabel}>{t('profile.editProfileMenu')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={onOpenGrievance}>
            <View style={styles.menuLeft}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color={COLORS.accentDark} />
              <Text style={styles.menuLabel}>{t('profile.grievanceMenu')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
            <View style={styles.menuLeft}>
              <Ionicons name="refresh-circle-outline" size={20} color={COLORS.info} />
              <Text style={styles.menuLabel}>{t('profile.resetDemoMenu')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Official Helpline Box */}
        <View style={styles.helplineCard}>
          <Ionicons name="call" size={20} color={COLORS.primary} />
          <View style={styles.helplineInfo}>
            <Text style={styles.helplineTitle}>{t('profile.helplineTitle')}</Text>
            <Text style={styles.helplineNumber}>{t('profile.helplineNumber')}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>{t('profile.logoutBtn')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  phone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  location: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  landCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    ...SHADOWS.subtle,
  },
  landMetric: {
    flex: 1,
    alignItems: 'center',
  },
  cropMetric: {
    flex: 1.5,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  landLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  landValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  langRow: {
    gap: SPACING.sm,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  langCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  langTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 48,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  helplineInfo: {},
  helplineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  helplineNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  kycCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  kycHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  kycTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kycTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  kycStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  kycBadgeCompleted: {
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  kycBadgePending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  kycStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  kycTextCompleted: {
    color: COLORS.primaryDark,
  },
  kycTextPending: {
    color: '#B45309',
  },
  bankDetailBox: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: 4,
  },
  bankDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  maskedAcctText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  dbtHintText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  kycPendingBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  kycPendingNotice: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  completeKycBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  completeKycBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 8,
    marginBottom: SPACING.xxl,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
