import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ACCESSIBILITY } from '../../constants/accessibility';
import { useTranslation } from 'react-i18next';

export type FilterOption = 'all' | 'active' | 'completed' | 'priority';

interface TaskFilterProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    priority: number;
  };
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts
}) => {
  const { t } = useTranslation();
  const [animation] = useState(new Animated.Value(0));

  const filterOptions: { id: FilterOption; label: string }[] = [
    { id: 'all', label: t('taskFilter.all') },
    { id: 'active', label: t('taskFilter.active') },
    { id: 'completed', label: t('taskFilter.completed') },
    { id: 'priority', label: t('taskFilter.priority') }
  ];

  const handleFilterPress = (filter: FilterOption) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    onFilterChange(filter);
  };

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="tablist"
      accessibilityLabel={t('taskFilter.accessibility.filterList')}
    >
      {filterOptions.map(({ id, label }) => (
        <TouchableOpacity
          key={id}
          style={[
            styles.filterButton,
            currentFilter === id && styles.filterButtonActive
          ]}
          onPress={() => handleFilterPress(id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentFilter === id }}
          accessibilityLabel={t('taskFilter.accessibility.filterOption', {
            filter: label,
            count: counts[id]
          })}
        >
          <Text style={[
            styles.filterText,
            currentFilter === id && styles.filterTextActive
          ]}>
            {label}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{counts[id]}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  filterButtonActive: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  filterText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  filterTextActive: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  countBadge: {
    marginLeft: ACCESSIBILITY.SPACING.XS,
    paddingHorizontal: ACCESSIBILITY.SPACING.XS,
    paddingVertical: 2,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.XS,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XS,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
});

export default TaskFilter;
