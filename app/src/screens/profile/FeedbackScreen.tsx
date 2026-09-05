import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { AppButton } from '../../components/AppButton';
import { useAppStore } from '../../state/useAppStore';

interface FeedbackScreenProps {
  onBack?: () => void;
  onSubmitDone: () => void;
}

const CATEGORIES = [
  'Waiting Time Delay',
  'Weighbridge Discrepancy',
  'Moisture Lab Test Dispute',
  'Payment Delay',
  'Staff Behavior',
  'General Suggestion',
];

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  onBack,
  onSubmitDone,
}) => {
  const { activeBooking } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmitDone();
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Grievance & Feedback"
        subtitle="Department of Consumer Affairs"
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {submitted ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
            <Text style={styles.successTitle}>Grievance Logged Successfully</Text>
            <Text style={styles.successSubtitle}>
              Reference Ticket: GRV-{Math.floor(100000 + Math.random() * 900000)}
            </Text>
            <Text style={styles.successNote}>
              Your feedback has been routed to the District Mandi Inspector.
            </Text>
          </View>
        ) : (
          <>
            {/* Active Procurement Tag */}
            {activeBooking && (
              <View style={styles.linkedBookingCard}>
                <Ionicons name="link-outline" size={18} color={COLORS.primary} />
                <View style={styles.linkedInfo}>
                  <Text style={styles.linkedLabel}>Linked Procurement</Text>
                  <Text style={styles.linkedTitle}>
                    Token {activeBooking.tokenNumber} • {activeBooking.centerName}
                  </Text>
                </View>
              </View>
            )}

            {/* Category Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Select Grievance Category</Text>
              <View style={styles.catWrap}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catPill,
                      selectedCategory === cat && styles.catPillActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catText,
                        selectedCategory === cat && styles.catTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Star Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Mandi Experience Rating</Text>
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
              <Text style={styles.sectionTitle}>3. Detailed Remarks</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Describe your issue or suggestion in detail..."
                placeholderTextColor={COLORS.textMuted}
                value={comments}
                onChangeText={setComments}
              />
            </View>

            <AppButton
              title="Submit Official Feedback"
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
