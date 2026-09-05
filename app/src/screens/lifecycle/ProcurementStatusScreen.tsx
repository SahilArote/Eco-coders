import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { AppButton } from '../../components/AppButton';
import { useAppStore } from '../../state/useAppStore';
import { ProcurementStatus } from '../../types';

interface ProcurementStatusScreenProps {
  onViewPayment: () => void;
  onBack?: () => void;
}

const LIFECYCLE_STEPS: {
  status: ProcurementStatus;
  title: string;
  desc: string;
}[] = [
  {
    status: 'BOOKED',
    title: 'Slot Booked & Token Allocated',
    desc: 'Token A105 generated and slot confirmed.',
  },
  {
    status: 'ARRIVED',
    title: 'Physical Arrival at Mandi Gate',
    desc: 'Vehicle QR verified at Gate #2 entry.',
  },
  {
    status: 'WAITING',
    title: 'In Physical Queue Line',
    desc: 'Vehicle staged in holding bay awaiting counter call.',
  },
  {
    status: 'PROCESSING',
    title: 'Called to Unloading Counter',
    desc: 'Produce positioned at Counter 2 intake platform.',
  },
  {
    status: 'QUALITY_CHECK',
    title: 'Moisture & Grade Lab Testing',
    desc: 'Government inspection officer testing sample against FAQ norms.',
  },
  {
    status: 'WEIGHMENT',
    title: 'Electronic Weighbridge Measurement',
    desc: 'Gross and Tare vehicle weighment recorded.',
  },
  {
    status: 'ACCEPTED',
    title: 'Procurement Acceptance Certified',
    desc: 'Procurement receipt signed and forwarded for DBT payment.',
  },
  {
    status: 'PAYMENT_COMPLETED',
    title: 'Direct Benefit Transfer (DBT) Settled',
    desc: 'Funds transferred directly to linked bank account.',
  },
];

export const ProcurementStatusScreen: React.FC<ProcurementStatusScreenProps> = ({
  onViewPayment,
  onBack,
}) => {
  const { activeBooking, advanceProcurementStage } = useAppStore();

  if (!activeBooking) {
    return (
      <View style={styles.container}>
        <AppHeader title="Procurement Status" onBack={onBack} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active procurement record</Text>
        </View>
      </View>
    );
  }

  const currentStatus = activeBooking.status;
  const currentStepIndex = LIFECYCLE_STEPS.findIndex(
    (s) => s.status === currentStatus
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Procurement Journey"
        subtitle={`Token ${activeBooking.tokenNumber} • ${activeBooking.cropName}`}
        onBack={onBack}
        rightAction={<StatusBadge status={currentStatus} size="sm" />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Token & Mandi Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.overviewLabel}>Mandi Center</Text>
              <Text style={styles.overviewTitle}>{activeBooking.centerName}</Text>
            </View>
            <View style={styles.tokenPill}>
              <Text style={styles.tokenPillText}>{activeBooking.tokenNumber}</Text>
            </View>
          </View>
        </View>

        {/* Quality Lab Inspection Slip (if at or past QUALITY_CHECK) */}
        {activeBooking.qualityReport && (
          <View style={styles.labCard}>
            <View style={styles.labHeader}>
              <View style={styles.labTitleGroup}>
                <Ionicons name="flask" size={18} color={COLORS.primary} />
                <Text style={styles.labTitle}>Government Quality Inspection Slip</Text>
              </View>
              <View style={styles.passedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.primaryDark} />
                <Text style={styles.passedText}>FAQ PASSED</Text>
              </View>
            </View>

            <View style={styles.labMetricsGrid}>
              <View style={styles.labMetricBox}>
                <Text style={styles.labMetricLabel}>Moisture %</Text>
                <Text style={styles.labMetricValue}>
                  {activeBooking.qualityReport.moisturePercentage}%
                </Text>
                <Text style={styles.labMetricSub}>
                  Max limit: {activeBooking.qualityReport.moistureStandardMax}%
                </Text>
              </View>

              <View style={styles.labMetricBox}>
                <Text style={styles.labMetricLabel}>Foreign Matter</Text>
                <Text style={styles.labMetricValue}>
                  {activeBooking.qualityReport.foreignMatterPercentage}%
                </Text>
                <Text style={styles.labMetricSub}>Within tolerance</Text>
              </View>

              <View style={styles.labMetricBox}>
                <Text style={styles.labMetricLabel}>Certified Grade</Text>
                <Text style={styles.labMetricValueHighlight}>
                  {activeBooking.qualityReport.qualityGrade.replace('_', ' ')}
                </Text>
                <Text style={styles.labMetricSub}>Premium Quality</Text>
              </View>
            </View>

            <Text style={styles.inspectorNote}>
              Inspected by: {activeBooking.qualityReport.inspectorName} ({activeBooking.qualityReport.checkedAt})
            </Text>
          </View>
        )}

        {/* Certified Weighbridge Slip (if at or past WEIGHMENT) */}
        {activeBooking.weighmentSlip && (
          <View style={styles.weighCard}>
            <View style={styles.labHeader}>
              <View style={styles.labTitleGroup}>
                <Ionicons name="scale" size={18} color={COLORS.accentDark} />
                <Text style={styles.weighTitle}>Electronic Weighbridge Certificate</Text>
              </View>
              <Text style={styles.weighTime}>
                {activeBooking.weighmentSlip.weighedAt}
              </Text>
            </View>

            <View style={styles.weightRow}>
              <View style={styles.weightCol}>
                <Text style={styles.weightLabel}>Gross Weight</Text>
                <Text style={styles.weightVal}>
                  {activeBooking.weighmentSlip.grossWeightKg.toLocaleString()} kg
                </Text>
              </View>
              <Text style={styles.weightMinus}>−</Text>
              <View style={styles.weightCol}>
                <Text style={styles.weightLabel}>Tare (Vehicle)</Text>
                <Text style={styles.weightVal}>
                  {activeBooking.weighmentSlip.tareWeightKg.toLocaleString()} kg
                </Text>
              </View>
              <Text style={styles.weightEquals}>=</Text>
              <View style={styles.weightColHighlight}>
                <Text style={styles.weightLabelHighlight}>Net Produce</Text>
                <Text style={styles.netWeightVal}>
                  {activeBooking.weighmentSlip.netQuintals} Quintals
                </Text>
                <Text style={styles.netWeightKg}>
                  ({activeBooking.weighmentSlip.netWeightKg.toLocaleString()} kg)
                </Text>
              </View>
            </View>

            <Text style={styles.weighbridgeMeta}>
              Station: {activeBooking.weighmentSlip.weighedBy} • Slip #{activeBooking.weighmentSlip.id}
            </Text>
          </View>
        )}

        {/* 8-Stage Visual State Machine Stepper */}
        <Text style={styles.timelineHeading}>End-to-End State Machine Progress</Text>
        <View style={styles.stepperContainer}>
          {LIFECYCLE_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFuture = index > currentStepIndex;

            return (
              <View key={step.status} style={styles.stepItem}>
                {/* Step Indicator Dot & Vertical Line */}
                <View style={styles.dotColumn}>
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotCompleted,
                      isCurrent && styles.stepDotCurrent,
                      isFuture && styles.stepDotFuture,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={COLORS.textInverse}
                      />
                    ) : isCurrent ? (
                      <View style={styles.innerPulseDot} />
                    ) : (
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    )}
                  </View>
                  {index < LIFECYCLE_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.verticalLine,
                        index < currentStepIndex && styles.verticalLineActive,
                      ]}
                    />
                  )}
                </View>

                {/* Step Content */}
                <View style={styles.stepContent}>
                  <View style={styles.stepTitleRow}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isCurrent && styles.stepTitleCurrent,
                        isCompleted && styles.stepTitleCompleted,
                      ]}
                    >
                      {step.title}
                    </Text>
                    {isCurrent && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>IN PROGRESS</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <AppButton
            title="View Direct Benefit Transfer (DBT) Payout"
            onPress={onViewPayment}
            size="lg"
            icon={<Ionicons name="card-outline" size={20} color={COLORS.textInverse} />}
          />

          <TouchableOpacity
            style={styles.advanceStageBtn}
            onPress={advanceProcurementStage}
          >
            <Ionicons name="play-forward" size={16} color={COLORS.primary} />
            <Text style={styles.advanceStageText}>
              [Demo] Advance to Next Lifecycle Step
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  overviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  tokenPill: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  tokenPillText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },
  labCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  labTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  passedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  passedText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  labMetricsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  labMetricBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  labMetricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  labMetricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  labMetricValueHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 2,
  },
  labMetricSub: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  inspectorNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  weighCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  weighTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentDark,
  },
  weighTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
  },
  weightCol: {
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  weightVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  weightMinus: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  weightEquals: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  weightColHighlight: {
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  weightLabelHighlight: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  netWeightVal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  netWeightKg: {
    fontSize: 10,
    color: COLORS.primaryDark,
  },
  weighbridgeMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  timelineHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  stepperContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  dotColumn: {
    alignItems: 'center',
    width: 28,
    marginRight: SPACING.md,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepDotCurrent: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.accent,
    borderWidth: 2.5,
  },
  innerPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  stepDotFuture: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  verticalLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  stepTitleCurrent: {
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stepTitleCompleted: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  actionSection: {
    marginBottom: SPACING.xxl,
  },
  advanceStageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: SPACING.md,
    gap: 6,
  },
  advanceStageText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
