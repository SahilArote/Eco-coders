import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../state/useAppStore';

interface HomeScreenProps {
  onNavigateToBooking: () => void;
  onNavigateToQueue: () => void;
  onNavigateToToken: () => void;
  onNavigateToProcurement: () => void;
  onNavigateToPayment: () => void;
  onNavigateToCenters: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToGrievance: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToBooking,
  onNavigateToQueue,
  onNavigateToToken,
  onNavigateToProcurement,
  onNavigateToPayment,
  onNavigateToCenters,
  onNavigateToNotifications,
  onNavigateToGrievance,
}) => {
  const { t } = useTranslation();
  const { farmer, activeBooking, queueState, crops, notifications, centers } =
    useAppStore();

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.greetingGroup}>
          <Text style={styles.greetingSub}>{t('home.greetingSub')}</Text>
          <Text style={styles.greetingName}>
            {t('home.greetingName', { name: farmer.fullName.split(' ')[0] })}
          </Text>
        </View>

        <View style={styles.topRightRow}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={onNavigateToNotifications}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.textPrimary}
            />
            {unreadNotifsCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Booking Hero Card */}
        {activeBooking ? (
          <LinearGradient
            colors={COLORS.gradientGreen}
            style={styles.heroTokenCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.tokenTopRow}>
              <View style={styles.tokenPill}>
                <Text style={styles.tokenPillLabel}>{t('home.activeToken')}</Text>
                <Text style={styles.tokenPillNumber}>
                  {activeBooking.tokenNumber}
                </Text>
              </View>

              <View style={styles.tokenStatusRight}>
                <StatusBadge status={activeBooking.status} size="sm" />
                <Text style={styles.tokenSlotTime}>
                  {activeBooking.slotDate} • {activeBooking.slotTimeRange}
                </Text>
              </View>
            </View>

            <View style={styles.tokenCenterRow}>
              <Ionicons name="location" size={16} color={COLORS.accent} />
              <Text style={styles.tokenCenterName} numberOfLines={1}>
                {activeBooking.centerName}
              </Text>
            </View>

            <View style={styles.tokenQueueSnapshot}>
              <View style={styles.queueSnapshotItem}>
                <Text style={styles.snapshotLabel}>{t('home.currentlyServing')}</Text>
                <Text style={styles.snapshotValue}>
                  {queueState.currentToken}
                </Text>
              </View>

              <View style={styles.snapshotDivider} />

              <View style={styles.queueSnapshotItem}>
                <Text style={styles.snapshotLabel}>{t('home.farmersAhead')}</Text>
                <Text style={styles.snapshotValueHighlight}>
                  {queueState.peopleAhead}
                </Text>
              </View>

              <View style={styles.snapshotDivider} />

              <View style={styles.queueSnapshotItem}>
                <Text style={styles.snapshotLabel}>{t('home.aiWaitTime')}</Text>
                <Text style={styles.snapshotValue}>
                  ~{queueState.estimatedWaitMinutes}m
                </Text>
              </View>
            </View>

            <View style={styles.tokenActionRow}>
              <TouchableOpacity
                style={styles.openRadarBtn}
                onPress={onNavigateToQueue}
                activeOpacity={0.8}
              >
                <Ionicons name="pulse" size={16} color={COLORS.primaryDark} />
                <Text style={styles.openRadarBtnText}>{t('home.openRadar')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewQrPassBtn}
                onPress={onNavigateToToken}
                activeOpacity={0.8}
              >
                <Ionicons name="qr-code" size={16} color={COLORS.textInverse} />
                <Text style={styles.viewQrPassText}>{t('home.viewQrPass')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ) : (
          <TouchableOpacity
            style={styles.noBookingCard}
            onPress={onNavigateToBooking}
            activeOpacity={0.8}
          >
            <View style={styles.noBookingLeft}>
              <Text style={styles.noBookingTitle}>
                {t('home.seasonOpenTitle')}
              </Text>
              <Text style={styles.noBookingSubtitle}>
                {t('home.seasonOpenSubtitle')}
              </Text>
              <View style={styles.bookNowPill}>
                <Text style={styles.bookNowText}>{t('home.bookMandiSlotNow')}</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.textInverse} />
              </View>
            </View>
            <View style={styles.wheatIconCircle}>
              <Ionicons name="leaf" size={28} color={COLORS.accentDark} />
            </View>
          </TouchableOpacity>
        )}

        {/* Live MSP Rates Horizontal Ticker */}
        <View style={styles.mspSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="trending-up" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t('home.mspRatesTitle')}</Text>
            </View>
            <Text style={styles.sectionBadge}>{t('home.officialRateBadge')}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mspScroll}
          >
            {crops.map((crop) => (
              <View key={crop.id} style={styles.mspCard}>
                <Text style={styles.mspCropName}>{crop.name.split(' ')[0]}</Text>
                <Text style={styles.mspRate}>
                  ₹{crop.mspRatePerQuintal.toLocaleString()}
                </Text>
                <Text style={styles.mspUnit}>{t('home.perQuintal')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Action Grid (6 Buttons) */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>{t('home.quickServices')}</Text>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={onNavigateToBooking}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>{t('home.serviceBookSlot')}</Text>
              <Text style={styles.gridSublabel}>{t('home.serviceBookSub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={onNavigateToQueue}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="pulse" size={24} color={COLORS.accentDark} />
              </View>
              <Text style={styles.gridLabel}>{t('home.serviceQueue')}</Text>
              <Text style={styles.gridSublabel}>{t('home.serviceQueueSub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={onNavigateToProcurement}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="scale" size={24} color={COLORS.info} />
              </View>
              <Text style={styles.gridLabel}>{t('home.serviceQuality')}</Text>
              <Text style={styles.gridSublabel}>{t('home.serviceQualitySub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={onNavigateToPayment}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="cash" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>{t('home.serviceDbt')}</Text>
              <Text style={styles.gridSublabel}>{t('home.serviceDbtSub')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={onNavigateToCenters}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="business" size={24} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.gridLabel}>{t('home.serviceMandis')}</Text>
              <Text style={styles.gridSublabel}>{t('home.serviceMandisSub', { count: 4 })}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={onNavigateToGrievance}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="chatbox" size={24} color={COLORS.danger} />
              </View>
              <Text style={styles.gridLabel}>{t('home.serviceGrievance')}</Text>
              <Text style={styles.gridSublabel}>{t('home.serviceGrievanceSub')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearest Center Live Status Card */}
        <View style={styles.centerHighlightCard}>
          <View style={styles.highlightHeader}>
            <View>
              <Text style={styles.highlightLabel}>{t('home.nearestMandiLabel')}</Text>
              <Text style={styles.highlightTitle}>{centers[0].name}</Text>
            </View>
            <View style={styles.openPill}>
              <View style={styles.greenDot} />
              <Text style={styles.openPillText}>{t('status.open')}</Text>
            </View>
          </View>

          <View style={styles.highlightMetaRow}>
            <Text style={styles.highlightDistance}>
              📍 {t('common.km_away', { count: centers[0].distanceKm })} • {centers[0].address}
            </Text>
          </View>

          <View style={styles.highlightStats}>
            <View style={styles.highlightStat}>
              <Text style={styles.statNum}>{centers[0].activeCounters} / {centers[0].totalCounters}</Text>
              <Text style={styles.statLabel}>{t('home.countersActive')}</Text>
            </View>
            <View style={styles.highlightStat}>
              <Text style={styles.statNum}>{centers[0].dailyCapacityQuintals} {t('home.qtl')}</Text>
              <Text style={styles.statLabel}>{t('home.dailyCapacity')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greetingGroup: {},
  greetingSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  heroTokenCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.elevated,
  },
  tokenTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tokenPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  tokenPillLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D1FAE5',
    letterSpacing: 0.5,
  },
  tokenPillNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textInverse,
    letterSpacing: 1,
    marginTop: 2,
  },
  tokenStatusRight: {
    alignItems: 'flex-end',
  },
  tokenSlotTime: {
    fontSize: 11,
    color: '#D1FAE5',
    marginTop: 6,
    fontWeight: '600',
  },
  tokenCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: 4,
  },
  tokenCenterName: {
    fontSize: 13,
    color: COLORS.textInverse,
    fontWeight: '700',
    flex: 1,
  },
  tokenQueueSnapshot: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  queueSnapshotItem: {
    flex: 1,
    alignItems: 'center',
  },
  snapshotLabel: {
    fontSize: 10,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  snapshotValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginTop: 2,
  },
  snapshotValueHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FEF08A',
    marginTop: 2,
  },
  snapshotDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tokenActionRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  openRadarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF08A',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  openRadarBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78350F',
  },
  viewQrPassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  viewQrPassText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  noBookingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  noBookingLeft: {
    flex: 1,
  },
  noBookingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  noBookingSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  bookNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    gap: 4,
  },
  bookNowText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  wheatIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  mspSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  mspScroll: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  mspCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 130,
    ...SHADOWS.subtle,
  },
  mspCropName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mspRate: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
  mspUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  gridSection: {
    marginBottom: SPACING.xl,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  gridItem: {
    width: '30.5%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  gridSublabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  centerHighlightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  highlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  highlightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  openPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  highlightMetaRow: {
    marginTop: SPACING.sm,
  },
  highlightDistance: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  highlightStats: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.xl,
  },
  highlightStat: {},
  statNum: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
