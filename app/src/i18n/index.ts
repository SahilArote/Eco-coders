import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { mr } from './locales/mr';
import { AppLanguage, SUPPORTED_LANGUAGES } from './types';
import { getStoredLanguage, setStoredLanguage } from './storage';

export const defaultNS = 'translation';
export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    react: {
      useSuspense: false,
    },
  });
}

/**
 * Change language globally:
 * 1. Updates i18next runtime
 * 2. Persists to AsyncStorage
 */
export async function changeAppLanguage(lang: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  await setStoredLanguage(lang);
}

/**
 * Load persisted language on app launch
 */
export async function initializeLanguage(): Promise<AppLanguage> {
  const savedLang = await getStoredLanguage();
  if (savedLang && savedLang !== i18n.language) {
    await i18n.changeLanguage(savedLang);
  }
  return savedLang;
}

export { SUPPORTED_LANGUAGES, AppLanguage };
export default i18n;
