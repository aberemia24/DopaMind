import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ERROR_TRANSLATIONS } from '../i18n/keys';

export function useErrorHandler() {
  const { t } = useTranslation();

  const handleError = useCallback((error: Error) => {
    // În development, logăm în consolă
    if (__DEV__) {
      console.error('🔴 Error:', error);
    }

    // Afișăm un Alert simplu către user
    Alert.alert(
      t(ERROR_TRANSLATIONS.TITLE),
      t(ERROR_TRANSLATIONS.GENERIC),
      [{ text: t(ERROR_TRANSLATIONS.OK) }]
    );
  }, [t]);

  return { handleError };
}
