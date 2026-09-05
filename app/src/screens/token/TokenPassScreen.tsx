import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { AppButton } from '../../components/AppButton';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../state/useAppStore';

interface TokenPassScreenProps {
  onTrackQueue: () => void;
  onViewProcurement: () => void;
  onBack?: () => void;
}

export const TokenPassScreen: React.FC<TokenPassScreenProps> = ({
  onTrackQueue,
  onViewProcurement,
  onBack,
}) => {
  const { activeBooking, farmer } = useAppStore();

  if (!activeBooking) {
    return (
      <View style={styles.container}>
        <AppHeader title="Digital Token" onBack={onBack} />
        <View style={styles.emptyState}>
          <Ionicons name="ticket-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Active Booking Found</Text>
          <Text style={styles.emptySubtitle}>
            Please select a procurement center and book a slot to receive your token.
          </Text>
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Kisan e-Setu Token Pass: ${activeBooking.tokenNumber}\nCenter: ${activeBooking.centerName}\nCrop: ${activeBooking.cropName}\nSlot: ${activeBooking.slotDate}, ${activeBooking.slotTimeRange}\nFarmer: ${farmer.fullName}`,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Digital Token Pass"
        subtitle="Present at Mandi Entry Gate"
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={handleShare} style={styles.shareIconBtn}>
            <Ionicons name="share-social-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Offline Availability Banner */}
        <View style={styles.offlineNotice}>
          <Ionicons name="cloud-offline-outline" size={16} color={COLORS.primaryDark} />
          <Text style={styles.offlineText}>
            Cached Locally: Available even if network drops at the Mandi.
          </Text>
        </View>

        {/* Boarding Pass Style Card */}
        <View style={styles.passCard}>
          {/* Header Gradient */}
          <LinearGradient
            colors={COLORS.gradientGreen}
            style={styles.passHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.passHeaderTop}>
              <View style={styles.badgeWrap}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.accent} />
                <Text style={styles.badgeText}>OFFICIAL TOKEN</Text>
              </View>
              <StatusBadge status={activeBooking.status} size="sm" />
            </View>
            <Text style={styles.tokenLabel}>Digital Queue Token</Text>
            <Text style={styles.tokenNumber}>{activeBooking.tokenNumber}</Text>
          </LinearGradient>

          {/* Tear-off Line with Punch Circles */}
          <View style={styles.punchRow}>
            <View style={[styles.punchCircle, styles.punchLeft]} />
            <View style={styles.dashedLine} />
            <View style={[styles.punchCircle, styles.punchRight]} />
          </View>

          {/* Pass Details Body */}
          <View style={styles.passBody}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Farmer</Text>
                <Text style={styles.fieldValue}>{farmer.fullName}</Text>
              </View>
              <View style={styles.gridColRight}>
                <Text style={styles.fieldLabel}>Registered Crop</Text>
                <Text style={styles.fieldValue}>{activeBooking.cropName}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Procurement Center</Text>
                <Text style={styles.fieldValue}>{activeBooking.centerName}</Text>
              </View>
              <View style={styles.gridColRight}>
                <Text style={styles.fieldLabel}>Slot Window</Text>
                <Text style={styles.fieldValueHighlight}>
                  {activeBooking.slotDate} • {activeBooking.slotTimeRange}
                </Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Estimated Quantity</Text>
                <Text style={styles.fieldValue}>
                  {activeBooking.estimatedQuantityQuintals} Quintals
                </Text>
              </View>
              <View style={styles.gridColRight}>
                <Text style={styles.fieldLabel}>Check-in Station</Text>
                <Text style={styles.fieldValue}>Gate #2 (Weighbridge A)</Text>
              </View>
            </View>

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <View style={styles.qrBox}>
                <QRCode
                  value={activeBooking.qrPayload}
                  size={150}
                  color={COLORS.textPrimary}
                  backgroundColor={COLORS.surface}
                />
              </View>
              <Text style={styles.qrHint}>
                Scan QR at Mandi Entry Gate to confirm physical arrival
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGroup}>
          <AppButton
            title="Track in Live Queue Radar"
            onPress={onTrackQueue}
            size="lg"
            icon={<Ionicons name="pulse-outline" size={20} color={COLORS.textInverse} />}
          />

          <AppButton
            title="View Full Procurement Inspection Slip"
            onPress={onViewProcurement}
            variant="outline"
            size="md"
            style={{ marginTop: SPACING.md }}
            icon={<Ionicons name="receipt-outline" size={18} color={COLORS.primary} />}
          />
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
  shareIconBtn: {
    padding: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: SPACING.lg,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginLeft: 6,
    flex: 1,
  },
  passCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  passHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  passHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: 0.5,
  },
  tokenLabel: {
    fontSize: 13,
    color: '#D1FAE5',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tokenNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.textInverse,
    letterSpacing: 2,
    marginTop: 4,
  },
  punchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    position: 'relative',
    height: 24,
    marginVertical: -12,
  },
  punchCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'absolute',
  },
  punchLeft: {
    left: -12,
  },
  punchRight: {
    right: -12,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginHorizontal: 16,
  },
  passBody: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  gridCol: {
    flex: 1,
  },
  gridColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  fieldValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  qrSection: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  qrBox: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  qrHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    maxWidth: 220,
    lineHeight: 16,
  },
  actionGroup: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
});
