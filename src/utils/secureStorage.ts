import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Helper pentru stocarea securizată a datelor sensibile.
 * Folosește SecureStore pe iOS/Android și AsyncStorage (cu avertisment) pe web.
 */
class SecureStorage {
  private static instance: SecureStorage;
  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        console.warn('SecureStore nu este disponibil pe web. Se folosește AsyncStorage.');
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('SecureStorage.setItem error:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStorage.getItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('SecureStorage.removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.clear();
      } else {
        // SecureStore nu are metodă clear(), trebuie să ștergem manual cheile cunoscute
        const keysToDelete = [
          'AUTH_CREDENTIALS_KEY',
          'USER_SESSION_KEY',
          'REFRESH_TOKEN_KEY'
        ];
        await Promise.all(keysToDelete.map(key => SecureStore.deleteItemAsync(key)));
      }
    } catch (error) {
      console.error('SecureStorage.clear error:', error);
      throw error;
    }
  }
}

export const secureStorage = SecureStorage.getInstance();
