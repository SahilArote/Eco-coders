import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppButton } from '../../components/AppButton';
import { useAppStore } from '../../state/useAppStore';
import { authService } from '../../services/authService';

interface BankKycScreenProps {
  isOnboarding?: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  onClose?: () => void;
}

const POPULAR_BANKS = [
  'State Bank of India',
  'Bank of Baroda',
  'Bank of Maharashtra',
  'Punjab National Bank',
  'HDFC Bank',
  'ICICI Bank',
];

export const BankKycScreen: React.FC<BankKycScreenProps> = ({
  isOnboarding = true,
  onComplete,
  onSkip,
  onClose,
}) => {
  const { t } = useTranslation();
  const { farmer, language, setLanguage, completeBankKyc, skipBankKyc } =
    useAppStore();

  const [accountHolderName, setAccountHolderName] = useState(
    farmer.fullName || ''
  );
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);

  // Validate and submit KYC
  const handleSaveKyc = async () => {
    setErrorMessage(null);

    const validation = authService.validateBankDetails({
      accountHolderName,
      bankName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
    });

    if (!validation.isValid) {
      setErrorMessage(
        validation.errorKey
          ? t(validation.errorKey as any)
          : t('kyc.invalidAccount')
      );
      return;
    }

    setLoading(true);
    try {
      await completeBankKyc({
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
      });
      onComplete();
    } catch (e) {
      setErrorMessage(t('kyc.invalidAccount'));
    } finally {
      setLoading(false);
    }
  };

  // Confirm skip
  const handleConfirmSkip = async () => {
    setShowSkipModal(false);
    await skipBankKyc();
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          {onClose ? (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.govBadge}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.govText}>{t('auth.docaBadge')}</Text>
            </View>
          )}

          <View style={styles.langSelector}>
            {(['en', 'hi', 'mr'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langBtn,
                  language === lang && styles.langBtnActive,
                ]}
                onPress={() => setLanguage(lang)}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    language === lang && styles.langBtnTextActive,
                  ]}
                >
                  {lang === 'en' ? 'ENG' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Header Hero Card */}
        <View style={styles.headerCard}>
          <View style={styles.bankIconCircle}>
            <Ionicons name="business" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.titleBadgeRow}>
            <Text style={styles.headerTitle}>{t('kyc.title')}</Text>
            <View style={styles.optionalPill}>
              <Text style={styles.optionalText}>
                {isOnboarding
                  ? t('kyc.optionalBadge')
                  : t('kyc.recommendedBadge')}
              </Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>{t('kyc.subtitle')}</Text>
        </View>

        {/* Trust & Security Notice Box */}
        <View style={styles.trustBox}>
          <Ionicons
            name="lock-closed"
            size={18}
            color={COLORS.primaryDark}
            style={styles.trustIcon}
          />
          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>
              {t('kyc.securePaymentDetails')}
            </Text>
            <Text style={styles.trustMessage}>{t('kyc.trustMessage')}</Text>
          </View>
        </View>

        {/* KYC Form Card */}
        <View style={styles.formCard}>
          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* 1. Account Holder Name */}
          <Text style={styles.inputLabel}>{t('kyc.accountHolderName')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('kyc.accountHolderPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={accountHolderName}
            onChangeText={(val) => {
              setAccountHolderName(val);
              if (errorMessage) setErrorMessage(null);
            }}
          />

          {/* 2. Bank Name with Popular Bank Chips */}
          <Text style={styles.inputLabel}>{t('kyc.bankName')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('kyc.bankNamePlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={bankName}
            onChangeText={(val) => {
              setBankName(val);
              if (errorMessage) setErrorMessage(null);
            }}
          />

          {/* Quick Bank Chips */}
          <View style={styles.chipsWrap}>
            {POPULAR_BANKS.map((bank) => (
              <TouchableOpacity
                key={bank}
                style={[
                  styles.bankChip,
                  bankName === bank && styles.bankChipSelected,
                ]}
                onPress={() => {
                  setBankName(bank);
                  if (errorMessage) setErrorMessage(null);
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.bankChipText,
                    bankName === bank && styles.bankChipTextSelected,
                  ]}
                >
                  {bank}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. Account Number */}
          <Text style={styles.inputLabel}>{t('kyc.accountNumber')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('kyc.accountNumberPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
            maxLength={18}
            secureTextEntry={false}
            value={accountNumber}
            onChangeText={(val) => {
              setAccountNumber(val);
              if (errorMessage) setErrorMessage(null);
            }}
          />

          {/* 4. Confirm Account Number */}
          <Text style={styles.inputLabel}>{t('kyc.confirmAccountNumber')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('kyc.confirmAccountPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
            maxLength={18}
            value={confirmAccountNumber}
            onChangeText={(val) => {
              setConfirmAccountNumber(val);
              if (errorMessage) setErrorMessage(null);
            }}
          />

          {/* 5. IFSC Code */}
          <Text style={styles.inputLabel}>{t('kyc.ifscCode')}</Text>
          <TextInput
            style={[styles.textInput, styles.ifscInput]}
            placeholder={t('kyc.ifscPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
            maxLength={11}
            value={ifscCode}
            onChangeText={(val) => {
              setIfscCode(val.toUpperCase());
              if (errorMessage) setErrorMessage(null);
            }}
          />

          {/* Primary CTA: Save & Continue */}
          <AppButton
            title={loading ? t('kyc.savingKyc') : t('kyc.saveAndContinue')}
            onPress={handleSaveKyc}
            loading={loading}
            size="lg"
            style={styles.saveBtn}
          />

          {/* Optional Skip for Onboarding */}
          {isOnboarding && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => setShowSkipModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.skipBtnText}>{t('kyc.skipForNow')}</Text>
            </TouchableOpacity>
          )}

          {isOnboarding && (
            <Text style={styles.skipHelperText}>{t('kyc.skipHelper')}</Text>
          )}
        </View>
      </ScrollView>

      {/* Skip Confirmation Bottom Sheet / Dialog */}
      <Modal
        visible={showSkipModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSkipModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons
                name="information-circle-outline"
                size={32}
                color={COLORS.accentDark}
              />
            </View>
            <Text style={styles.modalTitle}>{t('kyc.skipDialogTitle')}</Text>
            <Text style={styles.modalDesc}>{t('kyc.skipDialogDesc')}</Text>

            <View style={styles.modalButtonsColumn}>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setShowSkipModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  {t('kyc.stayAndComplete')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSkipBtn}
                onPress={handleConfirmSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSkipBtnText}>
                  {t('kyc.confirmSkip')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backBtn: {
    padding: 6,
  },
  govBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  govText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: 5,
  },
  langSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.full,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  langBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.subtle,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  langBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  bankIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    ...SHADOWS.subtle,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  optionalPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  trustIcon: {
    marginRight: SPACING.md,
  },
  trustContent: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  trustMessage: {
    fontSize: 11,
    color: COLORS.primaryDark,
    marginTop: 2,
    lineHeight: 16,
    opacity: 0.9,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerSurface,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: 8,
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: SPACING.md,
  },
  textInput: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  ifscInput: {
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  bankChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  bankChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bankChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  bankChipTextSelected: {
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  saveBtn: {
    marginTop: SPACING.xl,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: SPACING.sm,
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  skipHelperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.elevated,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  modalButtonsColumn: {
    width: '100%',
    gap: SPACING.sm,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  modalSkipBtn: {
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  modalSkipBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
