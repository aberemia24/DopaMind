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
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../constants/accessibility';
import { WELCOME_TRANSLATIONS } from '../i18n/keys';

export function WelcomeScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
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
          accessibilityRole="button"
          accessibilityLabel={t(WELCOME_TRANSLATIONS.BUTTONS.EMAIL_LOGIN)}
        >
          <MaterialIcons 
            name="email" 
            size={24} 
            color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} 
            style={styles.buttonIcon} 
          />
          <Text style={styles.emailButtonText}>
            {t(WELCOME_TRANSLATIONS.BUTTONS.EMAIL_LOGIN)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleButton]}
          onPress={handleGoogleLogin}
          accessibilityRole="button"
          accessibilityLabel={t(WELCOME_TRANSLATIONS.BUTTONS.GOOGLE_LOGIN)}
        >
          <FontAwesome 
            name="google" 
            size={24} 
            color={ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY} 
            style={styles.buttonIcon} 
          />
          <Text style={styles.googleButtonText}>
            {t(WELCOME_TRANSLATIONS.BUTTONS.GOOGLE_LOGIN)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  slidesContainer: {
    flex: 1,
  },
  buttonsContainer: {
    padding: ACCESSIBILITY.SPACING.XL,
    paddingBottom: ACCESSIBILITY.SPACING.XXL,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.MD,
    marginBottom: ACCESSIBILITY.SPACING.SM,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT + ACCESSIBILITY.SPACING.MD,
    elevation: 2,
    shadowColor: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
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
    backgroundColor: '#4285F4', // Culoarea oficială Google
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.MD,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT + ACCESSIBILITY.SPACING.MD,
    elevation: 2,
    shadowColor: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonIcon: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  emailButtonText: {
    flex: 1,
    fontSize: 16,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  googleButtonText: {
    flex: 1,
    fontSize: 16,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
});
