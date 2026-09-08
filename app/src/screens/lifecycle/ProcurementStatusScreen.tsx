import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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

const LIFECYCLE_STEP_KEYS = [
  {
    status: 'BOOKED' as ProcurementStatus,
    titleKey: 'lifecycle.stepBookedTitle',
    descKey: 'lifecycle.stepBookedDesc',
  },
  {
    status: 'ARRIVED' as ProcurementStatus,
    titleKey: 'lifecycle.stepArrivedTitle',
    descKey: 'lifecycle.stepArrivedDesc',
  },
  {
    status: 'WAITING' as ProcurementStatus,
    titleKey: 'lifecycle.stepWaitingTitle',
    descKey: 'lifecycle.stepWaitingDesc',
  },
  {
    status: 'PROCESSING' as ProcurementStatus,
    titleKey: 'lifecycle.stepProcessingTitle',
    descKey: 'lifecycle.stepProcessingDesc',
  },
  {
    status: 'QUALITY_CHECK' as ProcurementStatus,
    titleKey: 'lifecycle.stepQcTitle',
    descKey: 'lifecycle.stepQcDesc',
  },
  {
    status: 'WEIGHMENT' as ProcurementStatus,
    titleKey: 'lifecycle.stepWeighmentTitle',
    descKey: 'lifecycle.stepWeighmentDesc',
  },
  {
    status: 'ACCEPTED' as ProcurementStatus,
    titleKey: 'lifecycle.stepAcceptedTitle',
    descKey: 'lifecycle.stepAcceptedDesc',
  },
  {
    status: 'PAYMENT_COMPLETED' as ProcurementStatus,
    titleKey: 'lifecycle.stepPaymentTitle',
    descKey: 'lifecycle.stepPaymentDesc',
  },
];

export const ProcurementStatusScreen: React.FC<ProcurementStatusScreenProps> = ({
  onViewPayment,
  onBack,
}) => {
  const { t } = useTranslation();
  const { activeBooking, advanceProcurementStage } = useAppStore();

  if (!activeBooking) {
    return (
      <View style={styles.container}>
        <AppHeader title={t('lifecycle.title')} onBack={onBack} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('lifecycle.noRecord')}</Text>
        </View>
      </View>
    );
  }

  const currentStatus = activeBooking.status;
  const currentStepIndex = LIFECYCLE_STEP_KEYS.findIndex(
    (s) => s.status === currentStatus
  );

  // Check if current stage is at or past QUALITY_CHECK (step index >= 4)
  const isQcCompletedOrCurrent =
    currentStepIndex >= 4 ||
    ['QUALITY_CHECK', 'WEIGHMENT', 'ACCEPTED', 'COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'].includes(currentStatus);

  // Check if current stage is at or past WEIGHMENT (step index >= 5)
  const isWeighmentCompletedOrCurrent =
    currentStepIndex >= 5 ||
    ['WEIGHMENT', 'ACCEPTED', 'COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'].includes(currentStatus);

  const qcReport = activeBooking.qualityReport || {
    id: 'qc-8941',
    moisturePercentage: 11.4,
    moistureStandardMax: 12.0,
    foreignMatterPercentage: 0.7,
    qualityGrade: 'GRADE_A' as const,
    qualityStatus: 'PASSED' as const,
    inspectorName: 'K. S. Sharma (Agri Officer)',
    checkedAt: '10:24 AM',
    remarks: 'Produce meets FAQ standards. Clean golden grain.',
  };

  const netQ = activeBooking.estimatedQuantityQuintals || 40;
  const netKg = netQ * 100;
  const tareKg = 850;
  const grossKg = netKg + tareKg;

  const weighment = activeBooking.weighmentSlip || {
    id: 'ws-44102',
    grossWeightKg: grossKg,
    tareWeightKg: tareKg,
    netWeightKg: netKg,
    netQuintals: netQ,
    weighedBy: 'Electronic Weighbridge #2',
    weighedAt: '10:38 AM',
    weighbridgeId: 'WB-02-CERTIFIED',
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('lifecycle.title')}
        subtitle={`Token ${activeBooking.tokenNumber} • ${activeBooking.cropName}`}
        onBack={onBack}
        rightAction={<StatusBadge status={currentStatus} size="sm" />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Token & Mandi Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.overviewLabel}>{t('lifecycle.mandiCenter')}</Text>
              <Text style={styles.overviewTitle}>{activeBooking.centerName}</Text>
            </View>
            <View style={styles.tokenPill}>
              <Text style={styles.tokenPillText}>{activeBooking.tokenNumber}</Text>
            </View>
          </View>
        </View>

        {/* Quality Lab Inspection Slip (if at or past QUALITY_CHECK) */}
        {isQcCompletedOrCurrent && (
          <View style={styles.labCard}>
            <View style={styles.labHeader}>
              <View style={styles.labTitleGroup}>
                <Ionicons name="flask" size={18} color={COLORS.primary} />
                <Text style={styles.labTitle}>{t('lifecycle.qcReportTitle')}</Text>
              </View>
              <View style={styles.passedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.primaryDark} />
                <Text style={styles.passedText}>{t('lifecycle.faqPassed')}</Text>
              </View>
            </View>

            <View style={styles.labMetricsGrid}>
              <View style={styles.labMetricBox}>
                <Text style={styles.labMetricLabel}>{t('lifecycle.qcMoisture')}</Text>
                <Text style={styles.labMetricValue}>
                  {qcReport.moisturePercentage}%
                </Text>
                <Text style={styles.labMetricSub}>
                  {t('lifecycle.maxLimit', {
                    max: qcReport.moistureStandardMax,
                  })}
                </Text>
              </View>

              <View style={styles.labMetricBox}>
                <Text style={styles.labMetricLabel}>{t('lifecycle.qcForeignMatter')}</Text>
                <Text style={styles.labMetricValue}>
                  {qcReport.foreignMatterPercentage}%
                </Text>
                <Text style={styles.labMetricSub}>{t('lifecycle.withinTolerance')}</Text>
              </View>

              <View style={styles.labMetricBox}>
                <Text style={styles.labMetricLabel}>{t('lifecycle.qcGrade')}</Text>
                <Text style={styles.labMetricValueHighlight}>
                  {qcReport.qualityGrade.replace('_', ' ')}
                </Text>
                <Text style={styles.labMetricSub}>{t('lifecycle.premiumQuality')}</Text>
              </View>
            </View>

            <Text style={styles.inspectorNote}>
              {t('lifecycle.inspectedBy', {
                inspector: qcReport.inspectorName,
                time: qcReport.checkedAt,
              })}
            </Text>
          </View>
        )}

        {/* Certified Weighbridge Slip (if at or past WEIGHMENT) */}
        {isWeighmentCompletedOrCurrent && (
          <View style={styles.weighCard}>
            <View style={styles.labHeader}>
              <View style={styles.labTitleGroup}>
                <Ionicons name="scale" size={18} color={COLORS.accentDark} />
                <Text style={styles.weighTitle}>{t('lifecycle.slipTitle')}</Text>
              </View>
              <Text style={styles.weighTime}>
                {weighment.weighedAt}
              </Text>
            </View>

            <View style={styles.weightRow}>
              <View style={styles.weightCol}>
                <Text style={styles.weightLabel}>{t('lifecycle.slipGross')}</Text>
                <Text style={styles.weightVal}>
                  {weighment.grossWeightKg.toLocaleString()} kg
                </Text>
              </View>
              <Text style={styles.weightMinus}>−</Text>
              <View style={styles.weightCol}>
                <Text style={styles.weightLabel}>{t('lifecycle.slipTare')}</Text>
                <Text style={styles.weightVal}>
                  {weighment.tareWeightKg.toLocaleString()} kg
                </Text>
              </View>
              <Text style={styles.weightEquals}>=</Text>
              <View style={styles.weightColHighlight}>
                <Text style={styles.weightLabelHighlight}>{t('lifecycle.slipNet')}</Text>
                <Text style={styles.netWeightVal}>
                  {weighment.netQuintals} {t('common.quintals')}
                </Text>
                <Text style={styles.netWeightKg}>
                  ({weighment.netWeightKg.toLocaleString()} kg)
                </Text>
              </View>
            </View>

            <Text style={styles.weighbridgeMeta}>
              {t('lifecycle.weighMeta', {
                station: weighment.weighedBy,
                slip: weighment.id,
              })}
            </Text>
          </View>
        )}

        {/* 8-Stage Visual State Machine Stepper */}
        <Text style={styles.timelineHeading}>{t('lifecycle.timelineHeading')}</Text>
        <View style={styles.stepperContainer}>
          {LIFECYCLE_STEP_KEYS.map((step, index) => {
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
                  {index < LIFECYCLE_STEP_KEYS.length - 1 && (
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
                      {t(step.titleKey as any)}
                    </Text>
                    {isCurrent && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>{t('lifecycle.inProgress')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stepDesc}>
                    {t(step.descKey as any, { token: activeBooking.tokenNumber })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <AppButton
            title={t('lifecycle.viewPaymentBtn')}
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
              {t('lifecycle.simAdvanceBtn')}
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
