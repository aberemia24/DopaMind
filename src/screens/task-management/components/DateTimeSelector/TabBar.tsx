import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../../constants/accessibility';
import { TASK_TRANSLATIONS } from '../../../../i18n/keys';

interface TabBarProps {
  activeTab: 'date' | 'duration';
  onTabChange: (tab: 'date' | 'duration') => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'date' && styles.activeTab
        ]}
        onPress={() => onTabChange('date')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'date' }}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'date' && styles.activeTabText
        ]}>
          {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TABS.DATE)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'duration' && styles.activeTab
        ]}
        onPress={() => onTabChange('duration')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'duration' }}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'duration' && styles.activeTabText
        ]}>
          {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TABS.DURATION)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: ACCESSIBILITY.SPACING.BASE,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    padding: ACCESSIBILITY.SPACING.XS,
  },
  tab: {
    flex: 1,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    alignItems: 'center',
    borderRadius: ACCESSIBILITY.SPACING.XS,
  },
  activeTab: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  tabText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  activeTabText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
  },
});
