import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ACCESSIBILITY } from '../../constants/accessibility';

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  content: ViewStyle;
  taskSection: ViewStyle;
  taskSectionHeader: ViewStyle;
  taskSectionTitle: TextStyle;
  taskSectionDescription: TextStyle;
  taskList: ViewStyle;
  taskItem: ViewStyle;
  checkbox: ViewStyle;
  checkboxInner: ViewStyle;
  checkboxChecked: ViewStyle;
  checkmark: TextStyle;
  contentContainer: ViewStyle;
  titleContainer: ViewStyle;
  titleCompleted: TextStyle;
  input: TextStyle;
  deleteButton: ViewStyle;
  deleteButtonPressed: ViewStyle;
  deleteButtonText: TextStyle;
  timeSection: ViewStyle;
  currentTimeSection: ViewStyle;
  timePeriodTitle: TextStyle;
  timeFrame: TextStyle;
  currentIndicator: ViewStyle;
  currentIndicatorText: TextStyle;
  addTaskButton: ViewStyle;
  addTaskButtonText: TextStyle;
  addTaskDescription: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
  },
  header: {
    paddingHorizontal: ACCESSIBILITY.SPACING.XL,
    paddingVertical: ACCESSIBILITY.SPACING.MD,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  subtitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  content: {
    flex: 1,
    padding: ACCESSIBILITY.SPACING.MD,
  },
  taskSection: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.MD,
    padding: ACCESSIBILITY.SPACING.MD,
    marginBottom: ACCESSIBILITY.SPACING.MD,
    shadowColor: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING.SM,
  },
  taskSectionTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  taskSectionDescription: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  taskList: {
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginVertical: ACCESSIBILITY.SPACING.XS,
    shadowColor: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH / 2,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT / 2,
    borderRadius: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH / 4,
    borderWidth: 2,
    borderColor: ACCESSIBILITY.COLORS.STATES.SUCCESS,
    marginRight: ACCESSIBILITY.SPACING.SM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH / 4,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT / 4,
    borderRadius: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH / 8,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: ACCESSIBILITY.COLORS.STATES.SUCCESS,
  },
  checkmark: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    marginLeft: ACCESSIBILITY.SPACING.SM,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: ACCESSIBILITY.COLORS.TEXT.DISABLED,
  },
  input: {
    flex: 1,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  deleteButton: {
    padding: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.XS,
    backgroundColor: `${ACCESSIBILITY.COLORS.STATES.ERROR}20`,
  },
  deleteButtonPressed: {
    backgroundColor: `${ACCESSIBILITY.COLORS.STATES.ERROR}20`,
    opacity: 0.8,
  },
  deleteButtonText: {
    color: ACCESSIBILITY.COLORS.STATES.ERROR,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
  },
  timeSection: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.MD,
    padding: ACCESSIBILITY.SPACING.MD,
    marginBottom: ACCESSIBILITY.SPACING.MD,
    shadowColor: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentTimeSection: {
    borderWidth: 2,
    borderColor: ACCESSIBILITY.COLORS.STATES.SUCCESS,
  },
  timePeriodTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  timeFrame: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  currentIndicator: {
    backgroundColor: ACCESSIBILITY.COLORS.STATES.SUCCESS,
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,
    paddingVertical: ACCESSIBILITY.SPACING.XS,
    borderRadius: ACCESSIBILITY.SPACING.MD,
  },
  currentIndicatorText: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XS,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  addTaskButton: {
    marginTop: ACCESSIBILITY.SPACING.MD,
    padding: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    alignItems: 'center',
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  addTaskButtonText: {
    color: ACCESSIBILITY.COLORS.STATES.SUCCESS,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  addTaskDescription: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    marginTop: ACCESSIBILITY.SPACING.XS,
  },
});
