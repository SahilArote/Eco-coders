import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage } from './types';

const LANGUAGE_STORAGE_KEY = '@kisan_eprocure_language_v1';

export async function getStoredLanguage(): Promise<AppLanguage> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'hi' || saved === 'mr') {
      return saved;
    }
  } catch (error) {
    // Silently fallback to default on error
  }
  return 'en';
}

export async function setStoredLanguage(lang: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    // Storage fallback
  }
}
