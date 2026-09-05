import { TranslationSchema } from './locales/en';

export type AppLanguage = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी (Hindi)' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी (Marathi)' },
];

export type TranslationResources = TranslationSchema;
