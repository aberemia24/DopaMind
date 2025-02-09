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
});

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
});

/**
 * Validează și returnează variabilele de mediu tipizate
 */
export function getValidatedEnv() {
  const env = {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errorMessage = result.error.errors
      .map(error => `${error.path.join('.')}: ${error.message}`)
      .join('\n');
    
    throw new Error(`Validare variabile de mediu eșuată:\n${errorMessage}`);
  }

  try {
    return firebaseEnvSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error('Eroare de validare pentru variabilele de mediu:', error.errors);
    } else {
      console.error('Eroare neașteptată la validarea variabilelor de mediu:', error);
    }
    throw new Error('Configurare invalidă pentru variabilele de mediu Firebase');
  }
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
 * Configurație pentru sesiune
 */
export const SESSION_CONFIG = {
  TIMEOUT_MS: 30 * 60 * 1000, // 30 minute
  REFRESH_THRESHOLD_MS: 25 * 60 * 1000, // 25 minute
} as const;
