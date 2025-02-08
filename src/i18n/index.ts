import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import en from './translations/en.json';
import ro from './translations/ro.json';

type SupportedLanguages = 'en' | 'ro';

const resources = {
  en: {
    translation: en,
  },
  ro: {
    translation: ro,
  },
} as const;

// Verificăm dacă limba este suportată
const isSupportedLanguage = (lang: string): lang is SupportedLanguages => {
  return ['en', 'ro'].includes(lang);
};

// Get device language
const getDeviceLanguage = () => {
  const deviceLang = Localization.locale.split('-')[0];
  return isSupportedLanguage(deviceLang) ? deviceLang : 'ro';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'ro',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Recommended for React Native
    },
  });

// Export function to change language dynamically
export const changeLanguage = (language: string) => {
  return i18n.changeLanguage(language);
};

export default i18n;
