import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  taskSectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  taskList: {
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#111827',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  deleteButtonPressed: {
    backgroundColor: '#FEE2E2',
    opacity: 0.8,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 14,
  },
  timeSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentTimeSection: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  timePeriodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  timeFrame: {
    fontSize: 14,
    color: '#6B7280',
  },
  currentIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  addTaskButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  addTaskDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
});
