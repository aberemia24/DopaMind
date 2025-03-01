import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/auth';
import { ACCESSIBILITY } from '../constants/accessibility';
import { AuthNavigationProp } from '../navigation/types';
import * as WebBrowser from 'expo-web-browser';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const { t } = useTranslation();
  const { login } = useAuth();
  const { signInWithGoogle, isLoading: googleLoading, error: googleError, isReady } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        t('common.error'),
        t('auth.errors.emptyFields')
      );
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        Alert.alert(
          t('common.error'),
          t('auth.errors.invalidCredentials')
        );
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('auth.errors.invalidCredentials')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('auth.errors.googleSignInFailed')
      );
      console.error('Google Sign-In Error:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('auth.login.title')}</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.fields.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t('auth.fields.email')}
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('auth.fields.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel={t('auth.fields.password')}
          />
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t('auth.buttons.login')}
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.buttonText}>
              {loading ? t('common.loading') : t('auth.buttons.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleButton, (googleLoading || !isReady) && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={googleLoading || !isReady}
            accessibilityRole="button"
            accessibilityLabel={t('auth.buttons.googleLogin')}
            accessibilityState={{ disabled: googleLoading || !isReady }}
          >
            <Text style={styles.buttonText}>
              {googleLoading ? t('common.loading') : t('auth.buttons.googleLogin')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          accessibilityRole="button"
          accessibilityLabel={t('auth.buttons.createAccount')}
        >
          <Text style={styles.registerText}>
            {t('auth.login.noAccount')}
          </Text>
        </TouchableOpacity>
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
    padding: ACCESSIBILITY.SPACING.XL,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    textAlign: 'center',
    marginBottom: ACCESSIBILITY.SPACING.XL,
  },
  form: {
    gap: ACCESSIBILITY.SPACING.BASE,
  },
  input: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    padding: ACCESSIBILITY.SPACING.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  button: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    padding: ACCESSIBILITY.SPACING.BASE,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: ACCESSIBILITY.SPACING.BASE,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
  },
  registerText: {
    color: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    textAlign: 'center',
    marginTop: ACCESSIBILITY.SPACING.XL,
  },
});
