import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../constants/accessibility';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Componenta TodayDate afișează data curentă cu o iconiță specifică perioadei zilei
 * Folosește aceleași iconițe și culori ca în secțiunile de task management
 */
const TodayDate: React.FC = () => {
  const { t, i18n } = useTranslation();
  const today = new Date();
  
  // Formatarea datei (doar ziua și luna)
  const formattedDate = today.toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'long',
  });

  // Pentru ora curentă (16:41), afișăm iconița pentru după-amiază
  // Folosim exact aceeași iconiță ca în interfața de task management
  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="wb-sunny" 
        size={20} 
        color={ACCESSIBILITY.COLORS.DAYTIME.AFTERNOON.ICON} 
        style={styles.icon}
      />
      <Text style={styles.text}>{formattedDate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,
    paddingVertical: ACCESSIBILITY.SPACING.XS,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginLeft: ACCESSIBILITY.SPACING.MD,
  },
  icon: {
    marginRight: ACCESSIBILITY.SPACING.XS,
  },
  text: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
});

export default TodayDate;
