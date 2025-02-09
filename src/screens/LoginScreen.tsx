import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ReturnKeyType,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../constants/accessibility';
import { AUTH_TRANSLATIONS } from '../i18n/keys';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldFocusEmail, setShouldFocusEmail] = useState(true);
  const { login, error } = useAuth();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const { t } = useTranslation();

  const getReturnKeyType = (key: string): ReturnKeyType => {
    const map: { [key: string]: ReturnKeyType } = {
      next: 'next',
      done: 'done',
    };
    return map[key] || 'done';
  };

  useEffect(() => {
    console.log('LoginScreen: Se încearcă focusarea email input-ului');
    emailInputRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    
    Keyboard.dismiss();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      setEmail('');
      setPassword('');
    }
  };

  const focusPasswordInput = () => {
    console.log('LoginScreen: Încercare focusare password input');
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
      console.log('LoginScreen: Focus executat pe password');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.form}>
        <Text style={styles.title}>{t(AUTH_TRANSLATIONS.LOGIN.WELCOME)}</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            ref={emailInputRef}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t(AUTH_TRANSLATIONS.FIELDS.EMAIL)}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType={getReturnKeyType('next')}
            onSubmitEditing={focusPasswordInput}
            blurOnSubmit={false}
            autoFocus
            onFocus={() => {
              console.log('LoginScreen: Email input a primit focus');
              setShouldFocusEmail(false);
            }}
            onBlur={() => console.log('LoginScreen: Email input a pierdut focus')}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t(AUTH_TRANSLATIONS.FIELDS.PASSWORD)}
            secureTextEntry
            returnKeyType={getReturnKeyType('done')}
            onSubmitEditing={handleLogin}
            onFocus={() => console.log('LoginScreen: Password input a primit focus')}
            onBlur={() => console.log('LoginScreen: Password input a pierdut focus')}
          />
        </View>
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t(AUTH_TRANSLATIONS.LOGIN.SUBMIT)}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>{t(AUTH_TRANSLATIONS.LOGIN.NO_ACCOUNT)}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  form: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerText: {
    color: '#7C3AED',
    fontSize: 14,
  },
});
