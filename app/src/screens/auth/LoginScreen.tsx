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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppButton } from '../../components/AppButton';
import { useAppStore } from '../../state/useAppStore';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { farmer, language, setLanguage } = useAppStore();
  const [phoneNumber, setPhoneNumber] = useState('9822144589');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);

  const handleSendOtp = () => {
    if (phoneNumber.length >= 10) {
      setOtpStep(true);
      setOtp('8492'); // Auto-fill demo OTP for instant evaluation
    }
  };

  const handleVerifyOtp = () => {
    if (otp === '8492' || otp.length === 4) {
      onLoginSuccess();
    }
  };

  const handleQuickDemoLogin = () => {
    setPhoneNumber('9822144589');
    onLoginSuccess();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Government & Language Bar */}
        <View style={styles.topBar}>
          <View style={styles.govBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
            <Text style={styles.govText}>DoCA • Smart Procurement</Text>
          </View>
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

        {/* Hero Brand Card */}
        <LinearGradient
          colors={COLORS.gradientGreen}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={28} color={COLORS.accent} />
          </View>
          <Text style={styles.heroTitle}>Kisan e-Setu (किसान सेतु)</Text>
          <Text style={styles.heroSubtitle}>
            Direct APMC Scheduling, Live Queue Tracking & Transparent MSP Payout
          </Text>
        </LinearGradient>

        {/* Login Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formHeader}>
            {otpStep ? 'Enter 4-Digit OTP' : 'Farmer Registration / Login'}
          </Text>
          <Text style={styles.formSubHeader}>
            {otpStep
              ? `We sent an SMS code to +91 ${phoneNumber}`
              : 'Enter your 10-digit Aadhaar-linked mobile number'}
          </Text>

          {!otpStep ? (
            <View style={styles.inputContainer}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter Mobile Number"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          ) : (
            <View style={styles.otpContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="• • • •"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                value={otp}
                onChangeText={setOtp}
                textAlign="center"
              />
              <View style={styles.demoOtpHint}>
                <Ionicons name="information-circle-outline" size={14} color={COLORS.primary} />
                <Text style={styles.demoOtpText}>Demo OTP: 8492 (Auto-filled)</Text>
              </View>
            </View>
          )}

          <AppButton
            title={otpStep ? 'Verify OTP & Continue' : 'Get Verification OTP'}
            onPress={otpStep ? handleVerifyOtp : handleSendOtp}
            size="lg"
            style={styles.actionBtn}
          />

          {otpStep && (
            <TouchableOpacity
              style={styles.changeNumberBtn}
              onPress={() => setOtpStep(false)}
            >
              <Text style={styles.changeNumberText}>Edit Phone Number</Text>
            </TouchableOpacity>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>QUICK DEMO</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Quick Demo Login Option for Hackathon Judges */}
          <TouchableOpacity
            style={styles.demoPersonaCard}
            onPress={handleQuickDemoLogin}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.personaInfo}>
              <Text style={styles.personaName}>{farmer.fullName}</Text>
              <Text style={styles.personaMeta}>
                {farmer.village}, {farmer.district} • 6.5 Acres (Wheat & Chana)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Footer Support Tag */}
        <View style={styles.footer}>
          <Ionicons name="headset-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>Toll-Free Kisan Helpline: 1800-180-1551</Text>
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
    paddingTop: SPACING.xxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.elevated,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textInverse,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#D1FAE5',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  formHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  formSubHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
  },
  prefixBox: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    backgroundColor: '#E2E8F0',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  otpInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
    letterSpacing: 10,
  },
  demoOtpHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  demoOtpText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionBtn: {
    marginTop: SPACING.lg,
  },
  changeNumberBtn: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  changeNumberText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginHorizontal: SPACING.md,
    letterSpacing: 1,
  },
  demoPersonaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  personaMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
});
