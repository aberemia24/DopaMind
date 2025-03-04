import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import { MaterialIcons } from '@expo/vector-icons';

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

  const scaleAnims = useRef(
    filters.reduce((acc, { key }) => {
      acc[key] = new Animated.Value(key === currentFilter ? 1.05 : 1);
      return acc;
    }, {} as Record<FilterOption, Animated.Value>)
  ).current;

  useEffect(() => {
    Object.entries(scaleAnims).forEach(([key, anim]) => {
      Animated.spring(anim, {
        toValue: key === currentFilter ? 1.05 : 1,
        damping: 15,
        mass: 1,
        stiffness: 120,
        useNativeDriver: true,
      }).start();
    });
  }, [currentFilter]);

  const handlePress = (key: FilterOption) => {
    Animated.sequence([
      Animated.timing(scaleAnims[key], {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[key], {
        toValue: key === currentFilter ? 1 : 1.05,
        damping: 15,
        mass: 1,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onFilterChange(key);
  };

  const getFilterIcon = (filter: FilterOption) => {
    switch (filter) {
      case 'all':
        return 'list';
      case 'completed':
        return 'check-circle';
      case 'active':
        return 'radio-button-unchecked';
      case 'priority':
        return 'star';
      default:
        return 'filter-list';
    }
  };

  const getFilterIconColor = (filter: FilterOption, isActive: boolean) => {
    if (filter === 'completed') {
      return ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY;
    }
    return isActive ? ACCESSIBILITY.COLORS.TEXT.PRIMARY : ACCESSIBILITY.COLORS.TEXT.SECONDARY;
  };

  return (
    <View style={styles.container}>
      {filters.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[styles.filterButton, currentFilter === key && styles.activeFilterButton]}
          onPress={() => handlePress(key)}
          accessibilityRole="button"
          accessibilityState={{ selected: currentFilter === key }}
          accessibilityLabel={`${label} (${counts[key]})`}
        >
          <Animated.View
            style={[
              styles.filterContent,
              {
                transform: [{ scale: scaleAnims[key] }],
                opacity: currentFilter === key ? 1 : 0.8,
              },
            ]}
          >
            <MaterialIcons
              name={getFilterIcon(key)}
              size={16}
              color={getFilterIconColor(key, currentFilter === key)}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                currentFilter === key && styles.activeFilterText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {key === 'completed' ? `Done (${counts[key]})` : `${label} (${counts[key]})`}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    paddingHorizontal: ACCESSIBILITY.SPACING.XS,
  },
  filterButton: {
    flex: 1,
    paddingVertical: ACCESSIBILITY.SPACING.XS,
    paddingHorizontal: ACCESSIBILITY.SPACING.XS / 2,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    marginHorizontal: ACCESSIBILITY.SPACING.XS / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  filterText: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XS,
    textAlign: 'center',
    flexShrink: 1,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    marginRight: ACCESSIBILITY.SPACING.XS / 2,
  },
});

export default TaskFilter;
