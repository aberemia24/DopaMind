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
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldFocusEmail, setShouldFocusEmail] = useState(true);
  const { login, error } = useAuth();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

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
        <Text style={styles.title}>Welcome Back</Text>
        
        <TextInput
          ref={emailInputRef}
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={focusPasswordInput}
          blurOnSubmit={false}
          autoFocus
          onFocus={() => {
            console.log('LoginScreen: Email input a primit focus');
            setShouldFocusEmail(false);
          }}
          onBlur={() => console.log('LoginScreen: Email input a pierdut focus')}
        />
        
        <TextInput
          ref={passwordInputRef}
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          onFocus={() => console.log('LoginScreen: Password input a primit focus')}
          onBlur={() => console.log('LoginScreen: Password input a pierdut focus')}
        />
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
