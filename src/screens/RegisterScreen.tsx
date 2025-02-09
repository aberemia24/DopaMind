import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../constants/accessibility';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, error: authError } = useAuth();
  const { t } = useTranslation();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setLocalError(t('auth.register.errors.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.register.errors.passwordsDoNotMatch'));
      return;
    }

    setLocalError(null);
    setIsLoading(true);
    try {
      const success = await register(email, password);
      setIsLoading(false);

      if (success) {
        navigation.navigate('Login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setIsLoading(false);
      setLocalError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const error = localError || authError;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View 
          style={styles.form}
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel={t('auth.register.accessibility.form')}
        >
          <Text 
            style={styles.title}
            accessibilityRole="header"
          >
            {t('auth.register.createAccount')}
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('inputs.placeholders.email')}
              autoCapitalize="none"
              keyboardType="email-address"
              accessibilityRole="none"
              accessibilityLabel={t('auth.register.accessibility.emailInput')}
              accessibilityHint={t('auth.register.accessibility.emailHint')}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('inputs.placeholders.password')}
              secureTextEntry
              accessibilityRole="none"
              accessibilityLabel={t('auth.register.accessibility.passwordInput')}
              accessibilityHint={t('auth.register.accessibility.passwordHint')}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('inputs.placeholders.confirmPassword')}
              secureTextEntry
              accessibilityRole="none"
              accessibilityLabel={t('auth.register.accessibility.confirmPasswordInput')}
              accessibilityHint={t('auth.register.accessibility.confirmPasswordHint')}
            />
          </View>
          
          {error && (
            <Text 
              style={styles.error}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              {error}
            </Text>
          )}
          
          <TouchableOpacity 
            style={[
              styles.button,
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={t('auth.register.accessibility.registerButton')}
            accessibilityState={{ 
              disabled: isLoading,
              busy: isLoading
            }}
          >
            {isLoading ? (
              <ActivityIndicator color={ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY} />
            ) : (
              <Text style={styles.buttonText}>
                {t('auth.register.createAccount')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="link"
            accessibilityLabel={t('auth.register.accessibility.loginLink')}
          >
            <Text style={styles.loginLinkText}>
              {t('auth.register.haveAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  form: {
    padding: ACCESSIBILITY.SPACING.XL,
    alignItems: 'stretch',
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    textAlign: 'center',
    marginBottom: ACCESSIBILITY.SPACING.XL,
  },
  inputContainer: {
    marginBottom: ACCESSIBILITY.SPACING.LG,
  },
  input: {
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  error: {
    color: ACCESSIBILITY.COLORS.STATES.ERROR,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    textAlign: 'center',
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  button: {
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ACCESSIBILITY.SPACING.MD,
  },
  buttonDisabled: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.DISABLED,
  },
  buttonText: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  loginLink: {
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ACCESSIBILITY.SPACING.MD,
  },
  loginLinkText: {
    color: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
});
