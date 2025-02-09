import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../constants/accessibility';
import { ErrorScreenProps } from './types';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // În development, logăm detaliat
    if (__DEV__) {
      console.group('🔴 App Error');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Componenta simplă de afișare erori
function ErrorScreen({ error, resetError }: ErrorScreenProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('errors.oops')}</Text>
      {__DEV__ && (
        <Text style={styles.errorText}>{error?.message}</Text>
      )}
      <TouchableOpacity 
        style={styles.button}
        onPress={resetError}
      >
        <Text style={styles.buttonText}>
          {t('errors.tryAgain')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.XL,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  errorText: {
    color: ACCESSIBILITY.COLORS.STATES.ERROR,
    marginBottom: ACCESSIBILITY.SPACING.LG,
  },
  button: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    padding: ACCESSIBILITY.SPACING.MD,
    borderRadius: ACCESSIBILITY.SPACING.SM,
  },
  buttonText: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
});
