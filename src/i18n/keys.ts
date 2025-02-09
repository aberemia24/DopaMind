/**
 * Chei pentru traduceri legate de autentificare
 */
export const AUTH_TRANSLATIONS = {
  ERRORS: {
    LOGOUT: 'auth.errors.logout',
    GENERIC: 'auth.errors.generic',
    INVALID_EMAIL: 'auth.errors.invalidEmail',
    WRONG_PASSWORD: 'auth.errors.wrongPassword',
    USER_NOT_FOUND: 'auth.errors.userNotFound',
    EMAIL_IN_USE: 'auth.errors.emailInUse',
    WEAK_PASSWORD: 'auth.errors.weakPassword',
    NETWORK_ERROR: 'auth.errors.networkError',
    TOO_MANY_REQUESTS: 'auth.errors.tooManyRequests',
  },
  SUCCESS: {
    LOGIN: 'auth.success.login',
    REGISTER: 'auth.success.register',
    LOGOUT: 'auth.success.logout',
  },
  LOADING: {
    LOGIN: 'auth.loading.login',
    REGISTER: 'auth.loading.register',
    LOGOUT: 'auth.loading.logout',
  },
} as const;
