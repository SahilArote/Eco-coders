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
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { MetricWidget } from '../../components/MetricWidget';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../state/useAppStore';

interface LiveQueueScreenProps {
  onViewTokenPass: () => void;
  onViewProcurementLifecycle: () => void;
  onBack?: () => void;
}

export const LiveQueueScreen: React.FC<LiveQueueScreenProps> = ({
  onViewTokenPass,
  onViewProcurementLifecycle,
  onBack,
}) => {
  const { queueState, activeBooking, advanceQueue, advanceProcurementStage } =
    useAppStore();

  const isMyTurn = queueState.currentToken === queueState.yourToken;
  const isClose = queueState.peopleAhead <= 3;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Live Queue Radar"
        subtitle="Real-Time Mandi Counter Monitoring"
        onBack={onBack}
        rightAction={
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Center Alert Header */}
        <View style={styles.centerStatusRow}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.centerStatusText} numberOfLines={1}>
            {activeBooking ? activeBooking.centerName : 'APMC Nashik Main Yard'}
          </Text>
          <View style={styles.gateBadge}>
            <Text style={styles.gateText}>Gate #2 Open</Text>
          </View>
        </View>

        {/* Hero Token Status Card */}
        <LinearGradient
          colors={
            isMyTurn
              ? (['#DC2626', '#991B1B'] as const)
              : isClose
              ? (['#D97706', '#B45309'] as const)
              : COLORS.gradientGreen
          }
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isMyTurn ? (
            <View style={styles.urgentAlertBox}>
              <Ionicons name="megaphone" size={24} color="#FEF08A" />
              <Text style={styles.urgentAlertText}>
                YOUR TOKEN IS BEING CALLED!
              </Text>
              <Text style={styles.urgentAlertSub}>
                Proceed to Counter 2 with your produce and vehicle
              </Text>
            </View>
          ) : (
            <View style={styles.tokenStatusTop}>
              <View style={styles.tokenBox}>
                <Text style={styles.tokenBoxLabel}>SERVING NOW</Text>
                <Text style={styles.tokenBoxValue}>
                  {queueState.currentToken}
                </Text>
                <Text style={styles.counterRef}>Counter #2</Text>
              </View>

              <View style={styles.dividerArrow}>
                <Ionicons
                  name="arrow-forward-circle"
                  size={32}
                  color="rgba(255,255,255,0.7)"
                />
              </View>

              <View style={[styles.tokenBox, styles.myTokenBox]}>
                <Text style={styles.tokenBoxLabel}>YOUR TOKEN</Text>
                <Text style={styles.tokenBoxValueHighlight}>
                  {queueState.yourToken}
                </Text>
                <Text style={styles.counterRef}>
                  {isClose ? 'Get Ready' : 'In Queue'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.statusFooterRow}>
            <Text style={styles.updateTimestamp}>
              ● {queueState.lastUpdatedAt}
            </Text>
            <TouchableOpacity onPress={onViewTokenPass} style={styles.viewPassLink}>
              <Text style={styles.viewPassText}>View QR Pass</Text>
              <Ionicons name="chevron-forward" size={12} color="#D1FAE5" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 3 Metric Widgets Row */}
        <View style={styles.metricsRow}>
          <MetricWidget
            label="Ahead of You"
            value={queueState.peopleAhead}
            unit="farmers"
            sublabel="Waiting at Mandi"
            icon={
              <Ionicons
                name="people-outline"
                size={16}
                color={COLORS.textSecondary}
              />
            }
          />
          <MetricWidget
            label="Active Counters"
            value={queueState.activeCounters}
            unit="open"
            sublabel="Avg 11 min/farmer"
            icon={
              <Ionicons
                name="desktop-outline"
                size={16}
                color={COLORS.textSecondary}
              />
            }
          />
        </View>

        {/* AI Predictive Waiting Time Card */}
        <View style={styles.aiPredictionCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiTag}>
              <Ionicons name="sparkles" size={14} color={COLORS.accentDark} />
              <Text style={styles.aiTagText}>AI Estimated Wait Time</Text>
            </View>
            <View style={styles.confidencePill}>
              <Text style={styles.confidenceText}>88% Model Confidence</Text>
            </View>
          </View>

          <View style={styles.aiValueRow}>
            <Text style={styles.aiMinutes}>
              ~{queueState.estimatedWaitMinutes}
            </Text>
            <Text style={styles.aiUnit}>minutes</Text>
          </View>

          <Text style={styles.aiFormulaNote}>
            Calculated via Gradient Boosting model trained on 10,000+ historical
            APMC weighbridge transactions. Automatically falls back to deterministic
            formula if network degrades.
          </Text>
        </View>

        {/* Current Procurement Stage Quick Preview */}
        {activeBooking && (
          <TouchableOpacity
            style={styles.stagePreviewCard}
            onPress={onViewProcurementLifecycle}
            activeOpacity={0.8}
          >
            <View style={styles.stageLeft}>
              <Text style={styles.stageLabel}>CURRENT LIFECYCLE STAGE</Text>
              <Text style={styles.stageName}>
                {activeBooking.status.replace('_', ' ')}
              </Text>
            </View>
            <StatusBadge status={activeBooking.status} size="md" />
          </TouchableOpacity>
        )}

        {/* ----------------- HACKATHON LIVE DEMO CONTROL BAR ----------------- */}
        <View style={styles.demoBar}>
          <View style={styles.demoBarHeader}>
            <Ionicons name="hardware-chip-outline" size={16} color={COLORS.accentDark} />
            <Text style={styles.demoBarTitle}>HACKATHON DEMO SIMULATOR</Text>
          </View>
          <Text style={styles.demoBarSubtitle}>
            Tap below to simulate procurement actions happening live at the Mandi counter:
          </Text>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={advanceQueue}
            activeOpacity={0.8}
          >
            <Ionicons name="volume-high-outline" size={18} color={COLORS.textInverse} />
            <Text style={styles.demoBtnText}>
              Simulate Operator Calling Next Token ({queueState.currentToken} ➔ A
              {String(
                (parseInt(queueState.currentToken.replace('A', ''), 10) || 92) + 1
              ).padStart(3, '0')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoSecondaryBtn}
            onPress={advanceProcurementStage}
            activeOpacity={0.8}
          >
            <Ionicons name="play-forward-outline" size={18} color={COLORS.primary} />
            <Text style={styles.demoSecondaryBtnText}>
              Simulate Stage Advance (Quality ➔ Weighment ➔ Payment)
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: SPACING.lg,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  centerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  centerStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 4,
    flex: 1,
  },
  gateBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  gateText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.elevated,
    marginBottom: SPACING.lg,
  },
  urgentAlertBox: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  urgentAlertText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textInverse,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  urgentAlertSub: {
    fontSize: 13,
    color: '#FEF08A',
    marginTop: 4,
    textAlign: 'center',
  },
  tokenStatusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  tokenBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  myTokenBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: 1.5,
    borderColor: '#FEF08A',
  },
  tokenBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D1FAE5',
    letterSpacing: 1,
  },
  tokenBoxValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textInverse,
    letterSpacing: 1,
    marginVertical: 4,
  },
  tokenBoxValueHighlight: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FEF08A',
    letterSpacing: 1,
    marginVertical: 4,
  },
  counterRef: {
    fontSize: 11,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  dividerArrow: {
    paddingHorizontal: SPACING.xs,
  },
  statusFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  updateTimestamp: {
    fontSize: 11,
    color: '#D1FAE5',
  },
  viewPassLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D1FAE5',
    marginRight: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  aiPredictionCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentDark,
    textTransform: 'uppercase',
  },
  confidencePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentDark,
  },
  aiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: SPACING.xs,
  },
  aiMinutes: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  aiUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  aiFormulaNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  stagePreviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  stageLeft: {},
  stageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  stageName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  demoBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.xxl,
  },
  demoBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBarTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentDark,
    letterSpacing: 0.5,
  },
  demoBarSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
    lineHeight: 15,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 8,
    marginBottom: SPACING.sm,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  demoSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  demoSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
