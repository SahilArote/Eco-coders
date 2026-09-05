import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { AppButton } from '../../components/AppButton';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../state/useAppStore';

interface PaymentStatusScreenProps {
  onBack?: () => void;
  onGoHome: () => void;
}

export const PaymentStatusScreen: React.FC<PaymentStatusScreenProps> = ({
  onBack,
  onGoHome,
}) => {
  const { activeBooking, farmer } = useAppStore();

  const payment = activeBooking?.paymentDetails || {
    id: 'pay-77401',
    netAmount: 91000,
    mspRate: 2275,
    quantityQuintals: 40.0,
    currency: 'INR',
    status: 'COMPLETED' as const,
    bankName: 'State Bank of India',
    accountMasked: '•••• •••• •••• 4819',
    dbtReferenceNumber: 'DBT-PFMS-MH-2026-0914820',
    initiatedAt: '10:45 AM',
    completedAt: '11:15 AM',
  };

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: `Official MSP Payment Receipt\nAmount: ₹${payment.netAmount.toLocaleString()}\nCrop: ${activeBooking?.cropName || 'Wheat'}\nQuantity: ${payment.quantityQuintals} Quintals\nDBT Ref: ${payment.dbtReferenceNumber}\nBeneficiary: ${farmer.fullName}`,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Direct Benefit Transfer"
        subtitle="Government MSP Payment Settlement"
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={handleShareReceipt} style={styles.shareBtn}>
            <Ionicons name="download-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Settlement Hero Card */}
        <LinearGradient
          colors={COLORS.gradientGreen}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.govTag}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.accent} />
            <Text style={styles.govTagText}>DBT • PFMS Direct Transfer</Text>
          </View>

          <Text style={styles.amountLabel}>Total Net Payout</Text>
          <Text style={styles.amountValue}>
            ₹{payment.netAmount.toLocaleString('en-IN')}
          </Text>

          <View style={styles.statusPillRow}>
            <StatusBadge
              status={
                payment.status === 'COMPLETED'
                  ? 'PAYMENT_COMPLETED'
                  : 'PAYMENT_PROCESSING'
              }
              size="md"
            />
          </View>
        </LinearGradient>

        {/* Calculation Breakdown Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardSectionTitle}>MSP Rate Calculation</Text>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Certified Net Produce</Text>
            <Text style={styles.calcValue}>
              {payment.quantityQuintals} Quintals
            </Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Official Government MSP</Text>
            <Text style={styles.calcValue}>
              ₹{payment.mspRate.toLocaleString()} / Quintal
            </Text>
          </View>

          <View style={styles.calcDivider} />

          <View style={styles.calcRowTotal}>
            <Text style={styles.calcLabelTotal}>Gross Payout</Text>
            <Text style={styles.calcValueTotal}>
              ₹{payment.netAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.calcRowDeduction}>
            <Text style={styles.deductionLabel}>Mandi Fee / Deductions</Text>
            <Text style={styles.deductionValue}>₹0.00 (100% Free for Farmers)</Text>
          </View>
        </View>

        {/* Banking & Transfer Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardSectionTitle}>Beneficiary Account</Text>

          <View style={styles.bankRow}>
            <View style={styles.bankIcon}>
              <Ionicons name="business" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>{payment.bankName}</Text>
              <Text style={styles.accountNumber}>{payment.accountMasked}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
          </View>

          <View style={styles.dbtMetaBox}>
            <View style={styles.dbtMetaRow}>
              <Text style={styles.metaLabel}>PFMS UTR Number</Text>
              <Text style={styles.metaValue}>{payment.dbtReferenceNumber}</Text>
            </View>
            <View style={styles.dbtMetaRow}>
              <Text style={styles.metaLabel}>Beneficiary Name</Text>
              <Text style={styles.metaValue}>{farmer.fullName}</Text>
            </View>
            <View style={styles.dbtMetaRow}>
              <Text style={styles.metaLabel}>Settlement Date</Text>
              <Text style={styles.metaValue}>
                {payment.completedAt || 'Processing (within 24 hrs)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Trust Guarantee Box */}
        <View style={styles.guaranteeBox}>
          <Ionicons name="information-circle" size={18} color={COLORS.primary} />
          <Text style={styles.guaranteeText}>
            Direct Benefit Transfer funds are credited directly to your bank account with zero intermediary commission as mandated by DoCA regulations.
          </Text>
        </View>

        <AppButton
          title="Return to Dashboard"
          onPress={onGoHome}
          size="lg"
          style={styles.homeBtn}
        />
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
  shareBtn: {
    padding: SPACING.xs,
  },
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.elevated,
  },
  govTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  govTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: 0.5,
  },
  amountLabel: {
    fontSize: 12,
    color: '#D1FAE5',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.lg,
  },
  amountValue: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.textInverse,
    letterSpacing: -1,
    marginTop: 4,
  },
  statusPillRow: {
    marginTop: SPACING.md,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  calcLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  calcDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  calcRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabelTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calcValueTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  calcRowDeduction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  deductionLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deductionValue: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  accountNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dbtMetaBox: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  dbtMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  guaranteeBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primarySurface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  guaranteeText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  homeBtn: {
    marginBottom: SPACING.xxl,
  },
});
