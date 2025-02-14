import { z } from 'zod';

/**
 * Schema pentru validarea variabilelor de mediu
 */
const envSchema = z.object({
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().min(1),
  EXPO_PUBLIC_ENV: z.enum(['development', 'production']).default('development'),
  // Facem cheia opțională în development
  EXPO_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Schema pentru variabilele de mediu Firebase
 */
const firebaseEnvSchema = z.object({
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string(),
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  EXPO_PUBLIC_FIREBASE_APP_ID: z.string(),
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string(),
  EXPO_PUBLIC_ENV: z.enum(['development', 'production']).default('development'),
  EXPO_PUBLIC_RECAPTCHA_SITE_KEY: z.string(),
});

/**
 * Validează și returnează variabilele de mediu tipizate
 */
export function getValidatedEnv(): Env {
  const env = {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV || 'development',
    EXPO_PUBLIC_RECAPTCHA_SITE_KEY: process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || '',
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errorMessage = result.error.errors
      .map(error => `${error.path.join('.')}: ${error.message}`)
      .join('\n');
    
    throw new Error(`Validare variabile de mediu eșuată:\n${errorMessage}`);
  }

  return result.data;
}

/**
 * Verifică dacă aplicația rulează în producție
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Configurație pentru rate limiting
 */
export const AUTH_RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * 60 * 1000, // 15 minute
  BLOCK_DURATION_MS: 30 * 60 * 1000, // 30 minute
} as const;

/**
 * Configurație pentru sesiune și timeout
 */
export const SESSION_CONFIG = {
  TIMEOUT_MS: 30 * 60 * 1000, // 30 minute
  REFRESH_THRESHOLD_MS: 25 * 60 * 1000, // 25 minute
} as const;

/**
 * Configurație pentru autentificare
 */
export const AUTH_CONFIG = {
  CREDENTIALS_MAX_AGE_MS: 30 * 24 * 60 * 60 * 1000, // 30 zile
  TOKEN_REFRESH_INTERVAL_MS: 60 * 60 * 1000, // 1 oră
  AUTH_SALT: 'DopaMind_v1', // Salt pentru criptare
} as const;

/**
 * Returnează configurația Firebase validată
 */
export function getFirebaseConfig() {
  const env = getValidatedEnv();
  return {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}
