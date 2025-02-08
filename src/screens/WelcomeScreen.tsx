import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { OnboardingSlides } from '../components/Onboarding/OnboardingSlides';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  
  const handleEmailLogin = () => {
    navigation.navigate('Login');
  };

  const handleGoogleLogin = () => {
    // Va fi implementat în pasul următor
    console.log('Google login to be implemented');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.slidesContainer}>
        <OnboardingSlides />
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.emailButton}
          onPress={handleEmailLogin}
        >
          <MaterialIcons name="email" size={24} color="#2E2E2E" style={styles.buttonIcon} />
          <Text style={styles.emailButtonText}>
            {t('welcome.buttons.emailLogin')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: '#4285F4' }]}
          onPress={handleGoogleLogin}
        >
          <FontAwesome name="google" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={[styles.googleButtonText, { color: '#fff' }]}>
            {t('welcome.buttons.googleLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slidesContainer: {
    flex: 1,
  },
  buttonsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    minHeight: 54,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 16,
    minHeight: 54,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonIcon: {
    marginRight: 12,
  },
  emailButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#2E2E2E',
  },
  googleButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#2E2E2E',
  },
});
