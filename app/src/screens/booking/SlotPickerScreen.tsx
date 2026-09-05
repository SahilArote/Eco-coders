import React, { useState } from 'react';
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
import { AppButton } from '../../components/AppButton';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../state/useAppStore';
import { ProcurementCenter, TimeSlot } from '../../types';

interface SlotPickerScreenProps {
  center: ProcurementCenter;
  onSelectSlot: (slot: TimeSlot, date: string) => void;
  onBack: () => void;
}

const DATES = [
  { id: 'd-1', label: 'Today', sub: '5 Sep', dateStr: '2026-09-05' },
  { id: 'd-2', label: 'Tomorrow', sub: '6 Sep', dateStr: '2026-09-06' },
  { id: 'd-3', label: 'Monday', sub: '7 Sep', dateStr: '2026-09-07' },
  { id: 'd-4', label: 'Tuesday', sub: '8 Sep', dateStr: '2026-09-08' },
];

export const SlotPickerScreen: React.FC<SlotPickerScreenProps> = ({
  center,
  onSelectSlot,
  onBack,
}) => {
  const { slots } = useAppStore();
  const [selectedDateId, setSelectedDateId] = useState('d-1');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const selectedDateObj = DATES.find((d) => d.id === selectedDateId) || DATES[0];
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const handleProceed = () => {
    if (selectedSlot) {
      onSelectSlot(selectedSlot, selectedDateObj.label);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Select Date & Slot"
        subtitle={center.name}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Selected Center Banner */}
        <View style={styles.centerBanner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="business" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{center.name}</Text>
            <Text style={styles.bannerSubtitle}>
              Center Code: {center.code} • {center.distanceKm} km away
            </Text>
          </View>
        </View>

        {/* Date Selector Carousel */}
        <Text style={styles.sectionHeading}>1. Choose Procurement Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateCarousel}
        >
          {DATES.map((dateItem) => {
            const isSelected = selectedDateId === dateItem.id;
            return (
              <TouchableOpacity
                key={dateItem.id}
                style={[
                  styles.dateCard,
                  isSelected && styles.dateCardActive,
                ]}
                onPress={() => setSelectedDateId(dateItem.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateDay,
                    isSelected && styles.dateDayActive,
                  ]}
                >
                  {dateItem.label}
                </Text>
                <Text
                  style={[
                    styles.dateNum,
                    isSelected && styles.dateNumActive,
                  ]}
                >
                  {dateItem.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slot Availability List */}
        <View style={styles.slotsHeadingRow}>
          <Text style={styles.sectionHeading}>2. Available Time Slots</Text>
          <Text style={styles.slotsSublabel}>
            Real-time capacity managed
          </Text>
        </View>

        <View style={styles.slotsList}>
          {slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isFull = slot.status === 'FULL';
            const remaining = slot.capacity - slot.bookedCount;

            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotCard,
                  isSelected && styles.slotCardActive,
                  isFull && styles.slotCardDisabled,
                ]}
                onPress={() => !isFull && setSelectedSlotId(slot.id)}
                disabled={isFull}
                activeOpacity={0.8}
              >
                <View style={styles.slotLeft}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={
                      isSelected
                        ? COLORS.primary
                        : isFull
                        ? COLORS.textMuted
                        : COLORS.textSecondary
                    }
                  />
                  <View style={styles.slotTimeGroup}>
                    <Text
                      style={[
                        styles.slotTime,
                        isSelected && styles.slotTimeActive,
                        isFull && styles.slotTimeDisabled,
                      ]}
                    >
                      {slot.startTime} – {slot.endTime}
                    </Text>
                    <Text style={styles.slotCapacityText}>
                      {isFull
                        ? '0 of 20 slots available'
                        : `${remaining} of ${slot.capacity} slots left`}
                    </Text>
                  </View>
                </View>

                <View style={styles.slotRight}>
                  <StatusBadge status={slot.status} size="sm" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Guaranteed Concurrency Notice */}
        <View style={styles.concurrencyNotice}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
          <Text style={styles.concurrencyText}>
            Concurrency Protected: Exact capacity is verified with database row-lock on booking.
          </Text>
        </View>

        <AppButton
          title={
            selectedSlotId
              ? 'Proceed to Quantity Entry'
              : 'Select a Slot to Continue'
          }
          onPress={handleProceed}
          disabled={!selectedSlotId}
          size="lg"
          style={styles.proceedBtn}
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
  centerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  dateCarousel: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  dateCard: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 96,
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.elevated,
  },
  dateDay: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dateDayActive: {
    color: COLORS.textInverse,
  },
  dateNum: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  dateNumActive: {
    color: '#D1FAE5',
    fontWeight: '600',
  },
  slotsHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  slotsSublabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  slotsList: {
    gap: SPACING.sm,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  slotCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },
  slotCardDisabled: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.borderLight,
    opacity: 0.6,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotTimeGroup: {
    marginLeft: SPACING.md,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  slotTimeActive: {
    color: COLORS.primaryDark,
  },
  slotTimeDisabled: {
    color: COLORS.textMuted,
  },
  slotCapacityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  slotRight: {},
  concurrencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  concurrencyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  proceedBtn: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
});
