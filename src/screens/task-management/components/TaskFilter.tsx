import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../constants/accessibility';

export type FilterOption = 'all' | 'active' | 'completed' | 'priority';

interface FilterCounts {
  all: number;
  active: number;
  completed: number;
  priority: number;
}

interface TaskFilterProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  counts: FilterCounts;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const { t } = useTranslation();

  const filters: { key: FilterOption; label: string }[] = [
    { key: 'all', label: t('taskManagement.filters.all') },
    { key: 'active', label: t('taskManagement.filters.active') },
    { key: 'completed', label: t('taskManagement.filters.completed') },
    { key: 'priority', label: t('taskManagement.filters.priority') },
  ];

  return (
    <View style={styles.container}>
      {filters.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.filterButton,
            currentFilter === key && styles.activeFilterButton,
          ]}
          onPress={() => onFilterChange(key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentFilter === key }}
          accessibilityLabel={`${label} (${counts[key]})`}
        >
          <Text
            style={[
              styles.filterText,
              currentFilter === key && styles.activeFilterText,
            ]}
          >
            {`${label} (${counts[key]})`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: ACCESSIBILITY.SPACING.MD,
    gap: ACCESSIBILITY.SPACING.SM,
  },
  filterButton: {
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    borderRadius: 16,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  filterText: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
});

export default TaskFilter;
