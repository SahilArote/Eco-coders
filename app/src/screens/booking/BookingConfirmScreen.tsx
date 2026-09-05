import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { AppButton } from '../../components/AppButton';
import { useAppStore } from '../../state/useAppStore';
import { ProcurementCenter, TimeSlot, Crop } from '../../types';

interface BookingConfirmScreenProps {
  center: ProcurementCenter;
  slot: TimeSlot;
  dateStr: string;
  onBookingSuccess: () => void;
  onBack: () => void;
}

export const BookingConfirmScreen: React.FC<BookingConfirmScreenProps> = ({
  center,
  slot,
  dateStr,
  onBookingSuccess,
  onBack,
}) => {
  const { crops, farmer, bookSlot } = useAppStore();

  const [selectedCropId, setSelectedCropId] = useState(
    center.acceptedCropIds[0] || crops[0].id
  );
  const [quantity, setQuantity] = useState('40'); // Default 40 Quintals (~4 tonnes)
  const [vehicleType, setVehicleType] = useState('Tractor Trolley');
  const [loading, setLoading] = useState(false);

  const selectedCrop =
    crops.find((c) => c.id === selectedCropId) || crops[0];
  const numQuantity = parseFloat(quantity) || 0;
  const estimatedPayout = numQuantity * selectedCrop.mspRatePerQuintal;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      bookSlot({
        centerId: center.id,
        cropId: selectedCrop.id,
        slotId: slot.id,
        slotDate: dateStr,
        slotTimeRange: `${slot.startTime} – ${slot.endTime}`,
        quantityQuintals: numQuantity,
      });
      setLoading(false);
      onBookingSuccess();
    }, 600); // realistic network delay simulation
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Confirm Booking"
        subtitle="Review Produce & Slot Details"
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Slot Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Center</Text>
              <Text style={styles.summaryValue}>{center.name}</Text>
            </View>
            <View style={styles.summaryColRight}>
              <Text style={styles.summaryLabel}>Slot Window</Text>
              <Text style={styles.summaryValueHighlight}>
                {dateStr}, {slot.startTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Crop Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Crop to Sell</Text>
          <View style={styles.cropList}>
            {center.acceptedCropIds.map((cropId) => {
              const cropObj = crops.find((c) => c.id === cropId);
              if (!cropObj) return null;
              const isSelected = selectedCropId === cropId;

              return (
                <TouchableOpacity
                  key={cropId}
                  style={[
                    styles.cropSelectCard,
                    isSelected && styles.cropSelectCardActive,
                  ]}
                  onPress={() => setSelectedCropId(cropId)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cropRadio}>
                    <Ionicons
                      name={
                        isSelected ? 'radio-button-on' : 'radio-button-off'
                      }
                      size={20}
                      color={isSelected ? COLORS.primary : COLORS.textMuted}
                    />
                  </View>
                  <View style={styles.cropInfo}>
                    <Text style={styles.cropName}>{cropObj.name}</Text>
                    <Text style={styles.cropMsp}>
                      Official MSP: ₹{cropObj.mspRatePerQuintal.toLocaleString()} / Quintal
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quantity Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Estimated Quantity</Text>
          <View style={styles.quantityInputWrapper}>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="e.g. 40"
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={styles.unitPill}>
              <Text style={styles.unitText}>Quintals</Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            1 Quintal = 100 kg. Actual weighment will be certified at the mandi weighbridge.
          </Text>
        </View>

        {/* Estimated MSP Payout Card */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutTop}>
            <Ionicons name="cash-outline" size={24} color={COLORS.accentDark} />
            <Text style={styles.payoutLabel}>Estimated Total MSP Payout</Text>
          </View>
          <Text style={styles.payoutAmount}>
            ₹{estimatedPayout.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.payoutFormula}>
            {numQuantity} Quintals × ₹{selectedCrop.mspRatePerQuintal}/Qtl MSP
          </Text>
          <View style={styles.dbtBadge}>
            <Ionicons name="checkmark-done" size={14} color={COLORS.primary} />
            <Text style={styles.dbtText}>
              Direct Benefit Transfer (DBT) to linked SBI •••• 4819
            </Text>
          </View>
        </View>

        {/* Transport Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Transport Vehicle</Text>
          <View style={styles.vehicleRow}>
            {['Tractor Trolley', 'Mini Truck (Pick-up)', 'Bullock Cart'].map(
              (v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.vehiclePill,
                    vehicleType === v && styles.vehiclePillActive,
                  ]}
                  onPress={() => setVehicleType(v)}
                >
                  <Text
                    style={[
                      styles.vehicleText,
                      vehicleType === v && styles.vehicleTextActive,
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <AppButton
          title={loading ? 'Locking Slot...' : 'Confirm & Generate Digital Token'}
          onPress={handleConfirm}
          loading={loading}
          size="lg"
          style={styles.confirmBtn}
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
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
  },
  summaryColRight: {
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  summaryValueHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  cropList: {
    gap: SPACING.sm,
  },
  cropSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cropSelectCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },
  cropRadio: {
    marginRight: SPACING.md,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cropMsp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quantityInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderTopLeftRadius: RADIUS.md,
    borderBottomLeftRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unitPill: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderColor: COLORS.border,
    borderTopRightRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 15,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 15,
  },
  payoutCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  payoutTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  payoutLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentDark,
    textTransform: 'uppercase',
  },
  payoutAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  payoutFormula: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  dbtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  dbtText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginLeft: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  vehiclePill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vehiclePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  vehicleTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  confirmBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
});
