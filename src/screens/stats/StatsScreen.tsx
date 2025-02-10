import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../constants/accessibility';

const StatsScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('stats.title')}</Text>
      <Text style={styles.comingSoon}>{t('common.comingSoon')}</Text>
      <Text style={styles.description}>{t('stats.description')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    padding: ACCESSIBILITY.SPACING.BASE,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  comingSoon: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  description: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    paddingHorizontal: ACCESSIBILITY.SPACING.BASE,
  },
});

export default StatsScreen;
