import React, { useState } from 'react';
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
  { id: 'd-1', labelKey: 'common.today', sub: '5 Sep', dateStr: '2026-09-05' },
  { id: 'd-2', labelKey: 'common.tomorrow', sub: '6 Sep', dateStr: '2026-09-06' },
  { id: 'd-3', labelKey: 'common.monday', sub: '7 Sep', dateStr: '2026-09-07' },
  { id: 'd-4', labelKey: 'common.tuesday', sub: '8 Sep', dateStr: '2026-09-08' },
];

export const SlotPickerScreen: React.FC<SlotPickerScreenProps> = ({
  center,
  onSelectSlot,
  onBack,
}) => {
  const { t } = useTranslation();
  const { slots } = useAppStore();
  const [selectedDateId, setSelectedDateId] = useState('d-1');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const selectedDateObj = DATES.find((d) => d.id === selectedDateId) || DATES[0];
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const handleProceed = () => {
    if (selectedSlot) {
      onSelectSlot(selectedSlot, t(selectedDateObj.labelKey as any));
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('booking.titleSelect')}
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
              {t('booking.centerCode', {
                code: center.code,
                distance: center.distanceKm,
              })}
            </Text>
          </View>
        </View>

        {/* Date Selector Carousel */}
        <Text style={styles.sectionHeading}>{t('booking.stepDate')}</Text>
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
                  {t(dateItem.labelKey as any)}
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
          <Text style={styles.sectionHeading}>{t('booking.stepTime')}</Text>
          <Text style={styles.slotsSublabel}>
            {t('booking.realtimeCapacity')}
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
                        ? t('booking.slotsFull', { capacity: slot.capacity })
                        : t('booking.slotsAvailable', {
                            remaining,
                            capacity: slot.capacity,
                          })}
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
            {t('booking.concurrencyNotice')}
          </Text>
        </View>

        <AppButton
          title={
            selectedSlotId
              ? t('booking.proceedToQuantity')
              : t('booking.selectSlotToContinue')
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
