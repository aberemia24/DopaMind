import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { OnboardingSlides } from '../components/Onboarding/OnboardingSlides';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../constants/accessibility';
import { WELCOME_TRANSLATIONS } from '../i18n/keys';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export function WelcomeScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const { t } = useTranslation();
  const { signInWithGoogle, isLoading: googleLoading, error: googleError, isReady } = useGoogleAuth();
  
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

  const handleEmailLogin = () => {
    navigation.navigate('Login');
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
          style={[styles.googleButton, (googleLoading || !isReady) && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={googleLoading || !isReady}
          accessibilityRole="button"
          accessibilityLabel={t(WELCOME_TRANSLATIONS.BUTTONS.GOOGLE_LOGIN)}
          accessibilityState={{ disabled: googleLoading || !isReady }}
        >
          <FontAwesome 
            name="google" 
            size={24} 
            color={ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY} 
            style={styles.buttonIcon} 
          />
          <Text style={styles.googleButtonText}>
            {googleLoading 
              ? t('common.loading')
              : t(WELCOME_TRANSLATIONS.BUTTONS.GOOGLE_LOGIN)}
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
  emailButtonText: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4', // Google Blue
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
  googleButtonText: {
    color: 'white',
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
});
