import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_RATE_LIMIT } from '../config/environment';
import { formatLogTimestamp } from '../utils/dateTimeFormat';

interface RateLimitData {
  attempts: number;
  timestamp: number;
}

const RATE_LIMIT_PREFIX = '@rate_limit:';

export class RateLimiter {
  private static instance: RateLimiter;
  private cache: Map<string, RateLimitData>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private getStorageKey(key: string): string {
    return `${RATE_LIMIT_PREFIX}${key}`;
  }

  private async loadFromStorage(key: string): Promise<RateLimitData | undefined> {
    try {
      const storedData = await AsyncStorage.getItem(this.getStorageKey(key));
      if (storedData) {
        const data = JSON.parse(storedData) as RateLimitData;
        console.log(`RateLimiter: Loaded data for ${key}, last attempt at ${formatLogTimestamp(data.timestamp)}, attempts: ${data.attempts}`);
        return data;
      }
    } catch (error) {
      console.error('RateLimiter: Error loading from storage:', error);
    }
    return undefined;
  }

  private async saveToStorage(key: string, data: RateLimitData): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.getStorageKey(key),
        JSON.stringify(data)
      );
      console.log(`RateLimiter: Saved data for ${key}, timestamp: ${formatLogTimestamp(data.timestamp)}, attempts: ${data.attempts}`);
    } catch (error) {
      console.error('RateLimiter: Error saving to storage:', error);
    }
  }

  public async checkRateLimit(key: string): Promise<boolean> {
    const now = Date.now();
    
    // Încercăm să încărcăm din cache
    let data = this.cache.get(key);
    
    // Dacă nu există în cache, încărcăm din storage
    if (!data) {
      data = await this.loadFromStorage(key);
    }

    // Dacă nu există deloc, creăm prima încercare
    if (!data) {
      const newData: RateLimitData = { attempts: 1, timestamp: now };
      this.cache.set(key, newData);
      await this.saveToStorage(key, newData);
      console.log(`RateLimiter: First attempt for ${key} at ${formatLogTimestamp(now)}`);
      return true;
    }

    // Verificăm dacă a trecut perioada de rate limit
    const timeSinceLastAttempt = now - data.timestamp;
    if (timeSinceLastAttempt > AUTH_RATE_LIMIT.WINDOW_MS) {
      const newData: RateLimitData = { attempts: 1, timestamp: now };
      this.cache.set(key, newData);
      await this.saveToStorage(key, newData);
      console.log(`RateLimiter: Window expired for ${key}, resetting at ${formatLogTimestamp(now)}`);
      return true;
    }

    // Verificăm dacă s-a depășit numărul maxim de încercări
    if (data.attempts >= AUTH_RATE_LIMIT.MAX_ATTEMPTS) {
      const remainingBlockTime = AUTH_RATE_LIMIT.WINDOW_MS - timeSinceLastAttempt;
      const blockEndTime = new Date(now + remainingBlockTime);
      console.log(`RateLimiter: Rate limit exceeded for ${key}, blocked until ${formatLogTimestamp(blockEndTime.getTime())}`);
      return false;
    }

    // Incrementăm numărul de încercări
    const newData: RateLimitData = {
      attempts: data.attempts + 1,
      timestamp: data.timestamp
    };
    this.cache.set(key, newData);
    await this.saveToStorage(key, newData);
    console.log(`RateLimiter: Attempt ${newData.attempts}/${AUTH_RATE_LIMIT.MAX_ATTEMPTS} for ${key}`);
    return true;
  }

  public async resetLimit(key: string): Promise<void> {
    this.cache.delete(key);
    try {
      await AsyncStorage.removeItem(this.getStorageKey(key));
      console.log(`RateLimiter: Reset limit for ${key} at ${formatLogTimestamp(Date.now())}`);
    } catch (error) {
      console.error('RateLimiter: Error resetting limit:', error);
    }
  }

  public async clearAllLimits(): Promise<void> {
    this.cache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const rateLimitKeys = keys.filter(key => key.startsWith(RATE_LIMIT_PREFIX));
      if (rateLimitKeys.length > 0) {
        await AsyncStorage.multiRemove(rateLimitKeys);
        console.log(`RateLimiter: Cleared all limits (${rateLimitKeys.length} entries) at ${formatLogTimestamp(Date.now())}`);
      }
    } catch (error) {
      console.error('RateLimiter: Error clearing all limits:', error);
    }
  }
}
