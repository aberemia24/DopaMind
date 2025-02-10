import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { ACCESSIBILITY } from '../constants/accessibility';
import { AuthNavigationProp } from '../navigation/types';

export function LoginScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const { t } = useTranslation();
  const { login } = useAuth();
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
      await login(email, password);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('auth.errors.invalidCredentials')
      );
    } finally {
      setLoading(false);
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
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XXL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginBottom: ACCESSIBILITY.SPACING.XL,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: 8,
    padding: ACCESSIBILITY.SPACING.MD,
    marginBottom: ACCESSIBILITY.SPACING.MD,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
  },
  button: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    padding: ACCESSIBILITY.SPACING.MD,
    borderRadius: 8,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ACCESSIBILITY.SPACING.MD,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  registerText: {
    color: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    textAlign: 'center',
    marginTop: ACCESSIBILITY.SPACING.XL,
  },
});
