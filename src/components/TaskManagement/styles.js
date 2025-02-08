import { StyleSheet } from 'react-native';

// Design constants
export const COLORS = {
  primary: '#7C3AED', // Purple
  primaryLight: '#F5F3FF',
  secondary: '#E5E7EB',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
  },
  success: '#10B981',
  error: '#EF4444',
  border: '#E5E7EB',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const TYPOGRAPHY = {
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

const styles = StyleSheet.create({
  // Task Item Styles
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderRadius: SPACING.md,
    ...SHADOWS.small,
    marginVertical: SPACING.xs,
  },
  checkbox: {
    marginRight: SPACING.md,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.background.primary,
    fontSize: TYPOGRAPHY.body.fontSize,
  },
  titleContainer: {
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.text.disabled,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SPACING.xs,
  },
  deleteButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Time Section Styles
  timeSection: {
    marginBottom: SPACING.xxl,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
  },
  currentTimeSection: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flex: 1,
  },
  timePeriodTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  timeFrame: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  currentIndicator: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.lg,
  },
  currentIndicatorText: {
    color: COLORS.background.primary,
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
  },
  addTaskButton: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addTaskButtonText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  addTaskDescription: {
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.caption,
  },
});

export default styles;
