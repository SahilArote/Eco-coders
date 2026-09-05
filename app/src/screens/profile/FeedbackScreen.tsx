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
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { AppButton } from '../../components/AppButton';
import { useAppStore } from '../../state/useAppStore';

interface FeedbackScreenProps {
  onBack?: () => void;
  onSubmitDone: () => void;
}

const CATEGORIES = [
  { id: 'delay', labelKey: 'feedback.catDelay' },
  { id: 'weighbridge', labelKey: 'feedback.catWeighbridge' },
  { id: 'moisture', labelKey: 'feedback.catMoisture' },
  { id: 'payment', labelKey: 'feedback.catPayment' },
  { id: 'staff', labelKey: 'feedback.catStaff' },
  { id: 'general', labelKey: 'feedback.catGeneral' },
];

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  onBack,
  onSubmitDone,
}) => {
  const { t } = useTranslation();
  const { activeBooking } = useAppStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState(CATEGORIES[0].id);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketNum] = useState(() => Math.floor(100000 + Math.random() * 900000));

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmitDone();
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('feedback.title')}
        subtitle={t('feedback.subtitle')}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {submitted ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
            <Text style={styles.successTitle}>{t('feedback.successTitle')}</Text>
            <Text style={styles.successSubtitle}>
              {t('feedback.refTicket', { ticket: `GRV-${ticketNum}` })}
            </Text>
            <Text style={styles.successNote}>
              {t('feedback.successNote')}
            </Text>
          </View>
        ) : (
          <>
            {/* Active Procurement Tag */}
            {activeBooking && (
              <View style={styles.linkedBookingCard}>
                <Ionicons name="link-outline" size={18} color={COLORS.primary} />
                <View style={styles.linkedInfo}>
                  <Text style={styles.linkedLabel}>{t('feedback.linkedProcurement')}</Text>
                  <Text style={styles.linkedTitle}>
                    Token {activeBooking.tokenNumber} • {activeBooking.centerName}
                  </Text>
                </View>
              </View>
            )}

            {/* Category Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('feedback.stepCategory')}</Text>
              <View style={styles.catWrap}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catPill,
                      selectedCategoryId === cat.id && styles.catPillActive,
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.catText,
                        selectedCategoryId === cat.id && styles.catTextActive,
                      ]}
                    >
                      {t(cat.labelKey as any)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Star Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('feedback.stepRating')}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? COLORS.accent : COLORS.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comments Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('feedback.stepComments')}</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder={t('feedback.placeholderComments')}
                placeholderTextColor={COLORS.textMuted}
                value={comments}
                onChangeText={setComments}
              />
            </View>

            <AppButton
              title={t('feedback.submitBtn')}
              onPress={handleSubmit}
              size="lg"
              style={styles.submitBtn}
            />
          </>
        )}
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
  linkedBookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  linkedInfo: {
    marginLeft: SPACING.md,
  },
  linkedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  linkedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
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
  catWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  catPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    height: 110,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  successBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.xl,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  successSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 6,
  },
  successNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
});
