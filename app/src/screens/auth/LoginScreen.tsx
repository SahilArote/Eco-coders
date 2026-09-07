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
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppButton } from '../../components/AppButton';
import { FarmerAppLogo } from '../../components/FarmerAppLogo';
import { useAppStore } from '../../state/useAppStore';

import { authService, isValidIndianMobile, isValidPassword } from '../../services/authService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const { t } = useTranslation();
  const { farmer, language, setLanguage, login } = useAppStore();
  const [phoneNumber, setPhoneNumber] = useState('9822144589');
  const [password, setPassword] = useState('kisan123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);

    const cleanedPhone = phoneNumber.trim();
    if (!isValidIndianMobile(cleanedPhone)) {
      setErrorMessage(t('auth.validationMobile'));
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(cleanedPhone, password);
      if (res.success) {
        login(cleanedPhone);
        onLoginSuccess();
      } else {
        setErrorMessage(t('auth.passwordTooShort'));
      }
    } catch (e) {
      setErrorMessage(t('auth.validationMobile'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setPhoneNumber('9822144589');
    login('9822144589');
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
            <Text style={styles.govText}>{t('auth.docaBadge')}</Text>
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
          <View style={styles.logoBadgeContainer}>
            <FarmerAppLogo size={68} />
          </View>
          <Text style={styles.heroTitle}>{t('common.appName')}</Text>
          <Text style={styles.heroTitleHindi}>{t('common.portalSubtitle')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('auth.heroSubtitle')}
          </Text>
        </LinearGradient>

        {/* Login Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formHeader}>{t('auth.loginTitle')}</Text>
          <Text style={styles.formSubHeader}>{t('auth.loginSubtitle')}</Text>

          {/* Validation Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Mobile Number Field */}
          <Text style={styles.inputLabel}>{t('auth.mobileNumber')}</Text>
          <View style={styles.inputContainer}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder={t('auth.enterMobilePlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={(val) => {
                setPhoneNumber(val);
                if (errorMessage) setErrorMessage(null);
              }}
            />
          </View>

          {/* Password Field */}
          <Text style={styles.inputLabel}>{t('auth.password')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={t('auth.enterPasswordPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errorMessage) setErrorMessage(null);
              }}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <AppButton
            title={loading ? t('auth.loggingIn') : t('auth.loginBtn')}
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.actionBtn}
          />

          {/* Register Link */}
          {onNavigateToRegister && (
            <TouchableOpacity
              style={styles.registerLinkBtn}
              onPress={onNavigateToRegister}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLinkText}>
                {t('auth.newFarmerRegister')}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.quickDemo')}</Text>
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
                {farmer.village}, {farmer.district} • 6.5 {t('common.acres')} (Wheat & Chana)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Footer Support Tag */}
        <View style={styles.footer}>
          <Ionicons name="headset-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>{t('auth.kisanHelpline')}</Text>
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
  logoBadgeContainer: {
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textInverse,
    textAlign: 'center',
    letterSpacing: 1,
  },
  heroTitleHindi: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FEF08A',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.5,
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
    marginTop: SPACING.sm,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  eyeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
  },
  actionBtn: {
    marginTop: SPACING.lg,
  },
  registerLinkBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },
  registerLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
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
