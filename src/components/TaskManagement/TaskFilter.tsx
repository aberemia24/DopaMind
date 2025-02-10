import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../constants/accessibility';
import { TASK_TRANSLATIONS } from '../../i18n/keys';

export type FilterOption = 'all' | 'active' | 'completed' | 'priority';

export interface TaskFilterCounts {
  all: number;
  active: number;
  completed: number;
  priority: number;
}

export interface TaskFilterProps {
  /** Filtrul curent selectat */
  currentFilter: FilterOption;
  /** Callback apelat la schimbarea filtrului */
  onFilterChange: (filter: FilterOption) => void;
  /** Numărul de task-uri pentru fiecare categorie */
  counts: TaskFilterCounts;
  /** Opțional, stiluri custom pentru container */
  style?: StyleSheet.NamedStyles<any>;
}

/**
 * Componenta pentru filtrarea task-urilor
 * Permite filtrarea după stare (toate, active, completate) și prioritate
 */
const TaskFilter: React.FC<TaskFilterProps> = memo(({
  currentFilter,
  onFilterChange,
  counts,
  style
}) => {
  const { t } = useTranslation();

  const filters: Array<{ key: FilterOption; label: string }> = [
    { key: 'all', label: t(TASK_TRANSLATIONS.FILTER.OPTIONS.ALL) },
    { key: 'active', label: t(TASK_TRANSLATIONS.FILTER.OPTIONS.ACTIVE) },
    { key: 'completed', label: t(TASK_TRANSLATIONS.FILTER.OPTIONS.COMPLETED) },
    { key: 'priority', label: t(TASK_TRANSLATIONS.FILTER.OPTIONS.PRIORITY) }
  ];

  return (
    <View style={[styles.container, style]}>
      {filters.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.filterButton,
            currentFilter === key && styles.activeFilter,
            { minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH }
          ]}
          onPress={() => onFilterChange(key)}
          accessibilityRole="button"
          accessibilityState={{ selected: currentFilter === key }}
          accessibilityLabel={t(TASK_TRANSLATIONS.FILTER.ACCESSIBILITY.FILTER_BUTTON, {
            filter: label,
            count: counts[key]
          })}
        >
          <Text
            style={[
              styles.filterText,
              currentFilter === key && styles.activeFilterText
            ]}
          >
            {label} ({counts[key]})
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

TaskFilter.displayName = 'TaskFilter';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: ACCESSIBILITY.SPACING.MD,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY
  },
  filterButton: {
    padding: ACCESSIBILITY.SPACING.SM,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ACCESSIBILITY.SPACING.SM
  },
  activeFilter: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY
  },
  filterText: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM
  },
  activeFilterText: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: 'bold'
  }
});

export default TaskFilter;
