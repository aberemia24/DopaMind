import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  SafeAreaView,
} from 'react-native';
import { OnboardingSlides } from '../components/Onboarding/OnboardingSlides';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
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
          <Image
            source={require('../assets/icons/email.png')}
            style={styles.buttonIcon}
          />
          <Text style={styles.emailButtonText}>
            Conectați-vă cu adresa de e-mail
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
        >
          <Image
            source={require('../assets/icons/google.png')}
            style={styles.buttonIcon}
          />
          <Text style={styles.googleButtonText}>
            Conectează-te cu Google
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
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    minHeight: 54,
  },
  buttonIcon: {
    width: 24,
    height: 24,
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
