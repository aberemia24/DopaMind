import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../constants/accessibility';
import { AUTH_TRANSLATIONS, ERROR_TRANSLATIONS, HOME_TRANSLATIONS } from '../i18n/keys';

export function HomeScreen() {
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(t(ERROR_TRANSLATIONS.AUTH.DEFAULT), error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>{t(HOME_TRANSLATIONS.WELCOME)}</Text>
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityRole="button"
        accessibilityLabel={t(AUTH_TRANSLATIONS.SIGN_OUT)}
      >
        <Text style={styles.signOutText}>{t(AUTH_TRANSLATIONS.SIGN_OUT)}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginBottom: ACCESSIBILITY.SPACING.XL,
  },
  signOutButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    paddingHorizontal: ACCESSIBILITY.SPACING.XL,
    paddingVertical: ACCESSIBILITY.SPACING.MD,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
});
