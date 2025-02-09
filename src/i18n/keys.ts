/**
 * Chei pentru erori comune
 */
export const ERROR_TRANSLATIONS = {
  NETWORK: {
    CONNECTION: 'errors.network.connection',
    TIMEOUT: 'errors.network.timeout',
    SERVER: 'errors.network.server',
  },
  VALIDATION: {
    REQUIRED: 'errors.validation.required',
    EMAIL: 'errors.validation.email',
    PASSWORD: {
      LENGTH: 'errors.validation.password.length',
      MATCH: 'errors.validation.password.match',
      REQUIREMENTS: 'errors.validation.password.requirements',
    },
  },
  AUTH: {
    INVALID_EMAIL: 'errors.auth.invalidEmail',
    WRONG_PASSWORD: 'errors.auth.wrongPassword',
    USER_NOT_FOUND: 'errors.auth.userNotFound',
    EMAIL_IN_USE: 'errors.auth.emailInUse',
    WEAK_PASSWORD: 'errors.auth.weakPassword',
    TOO_MANY_REQUESTS: 'errors.auth.tooManyRequests',
    DEFAULT: 'errors.auth.default',
  },
  DATA: {
    NOT_FOUND: 'errors.data.notFound',
    INVALID_FORMAT: 'errors.data.invalidFormat',
    SAVE_FAILED: 'errors.data.saveFailed',
  },
  GENERIC: 'errors.generic',
} as const;

/**
 * Chei pentru autentificare
 */
export const AUTH_TRANSLATIONS = {
  SIGN_IN: 'auth.signIn',
  SIGN_UP: 'auth.signUp',
  SIGN_OUT: 'auth.signOut',
  EMAIL: 'auth.email',
  PASSWORD: 'auth.password',
  FORGOT_PASSWORD: 'auth.forgotPassword',
  FIELDS: {
    EMAIL: 'auth.fields.email',
    PASSWORD: 'auth.fields.password',
    CONFIRM_PASSWORD: 'auth.fields.confirmPassword',
  },
  LOGIN: {
    WELCOME: 'auth.login.welcome',
    SUBMIT: 'auth.login.submit',
    NO_ACCOUNT: 'auth.login.noAccount',
    TITLE: 'auth.login.title',
  },
  SUCCESS: {
    LOGIN: 'auth.success.login',
    REGISTER: 'auth.success.register',
    LOGOUT: 'auth.success.logout',
  },
} as const;
