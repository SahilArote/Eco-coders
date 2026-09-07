import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppButton } from '../../components/AppButton';
import { useAppStore } from '../../state/useAppStore';
import { authService, DEMO_OTP } from '../../services/authService';

interface OtpVerificationScreenProps {
  phone: string;
  onBack: () => void;
  onVerifySuccess: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  phone,
  onBack,
  onVerifySuccess,
}) => {
  const { t } = useTranslation();
  const { language, setLanguage, registerNewUser } = useAppStore();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle single digit input
  const handleDigitChange = (val: string, index: number) => {
    if (errorMessage) setErrorMessage(null);

    // Handle paste of full 6 digits
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleaned[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(cleaned.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Advance focus
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-fill demo OTP
  const handleAutoFillDemo = () => {
    const chars = DEMO_OTP.split('');
    setOtpDigits(chars);
    setErrorMessage(null);
    inputRefs.current[5]?.focus();
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      await authService.sendOtp(phone);
      setTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (e) {
      setErrorMessage(t('auth.otpInvalid'));
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMessage(t('auth.validationOtp6'));
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.verifyOtp(phone, fullOtp);
      if (res.success) {
        await registerNewUser(phone);
        onVerifySuccess();
      } else {
        setErrorMessage(t('auth.otpInvalid'));
      }
    } catch (e) {
      setErrorMessage(t('auth.otpInvalid'));
    } finally {
      setLoading(false);
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
        {/* Top Government & Language Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>

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

        {/* Verification Icon Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('auth.verifyMobileTitle')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('auth.otpSentTo6', { phone })}
          </Text>

          <TouchableOpacity
            style={styles.changePhoneBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={15} color={COLORS.primary} />
            <Text style={styles.changePhoneText}>{t('auth.changeMobile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View style={styles.formCard}>
          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* 6 OTP Boxes */}
          <View style={styles.otpInputsRow}>
            {otpDigits.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => {
                  inputRefs.current[idx] = ref;
                }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  errorMessage ? styles.otpBoxError : null,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleDigitChange(val, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Demo OTP Helper */}
          <TouchableOpacity
            style={styles.demoHelper}
            onPress={handleAutoFillDemo}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={15} color={COLORS.accentDark} />
            <Text style={styles.demoHelperText}>{t('auth.demoOtpHint6')}</Text>
          </TouchableOpacity>

          {/* Resend Timer / Action */}
          <View style={styles.timerRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                {t('auth.resendOtpIn', { timer })}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
                <Text style={styles.resendActionText}>
                  {t('auth.resendOtpNow')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Primary CTA */}
          <AppButton
            title={loading ? t('auth.verifying') : t('auth.verifyAndContinue')}
            onPress={handleVerify}
            loading={loading}
            size="lg"
            style={styles.verifyBtn}
          />
        </View>

        {/* Official Trust Note */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.footerText}>{t('auth.trustFooter')}</Text>
        </View>
      </ScrollView>
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 4,
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
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    ...SHADOWS.subtle,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  changePhoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changePhoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
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
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: 8,
    flex: 1,
  },
  otpInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },
  otpBoxError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerSurface,
  },
  demoHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  demoHelperText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#854D0E',
    marginLeft: 6,
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  resendActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  verifyBtn: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 5,
  },
});
