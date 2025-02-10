import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { ACCESSIBILITY } from '../../constants/accessibility';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sections.general')}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel={t('auth.signOut')}
        >
          <Text style={styles.buttonText}>{t('auth.signOut')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    padding: ACCESSIBILITY.SPACING.BASE,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  section: {
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  sectionTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  button: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    padding: ACCESSIBILITY.SPACING.BASE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  buttonText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
});

export default SettingsScreen;
