/**
 * Chei pentru erori comune
 */
export const ERROR_TRANSLATIONS = {
  TITLE: 'errors.title',
  GENERIC: 'errors.generic',
  OOPS: 'errors.oops',
  TRY_AGAIN: 'errors.tryAgain',
  OK: 'common.ok',
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

/**
 * Chei pentru ecranul Welcome
 */
export const WELCOME_TRANSLATIONS = {
  BUTTONS: {
    EMAIL_LOGIN: 'welcome.buttons.emailLogin',
    GOOGLE_LOGIN: 'welcome.buttons.googleLogin',
  },
} as const;

/**
 * Chei pentru ecranul Home
 */
export const HOME_TRANSLATIONS = {
  WELCOME: 'home.welcome',
} as const;

/**
 * Chei pentru Onboarding
 */
export const ONBOARDING_TRANSLATIONS = {
  SLIDES: {
    SLIDE1: {
      TITLE: 'onboarding.slides.slide1.title',
      DESCRIPTION: 'onboarding.slides.slide1.description',
    },
    SLIDE2: {
      TITLE: 'onboarding.slides.slide2.title',
      DESCRIPTION: 'onboarding.slides.slide2.description',
    },
    SLIDE3: {
      TITLE: 'onboarding.slides.slide3.title',
      DESCRIPTION: 'onboarding.slides.slide3.description',
    },
  },
  ACCESSIBILITY: {
    SLIDESHOW: 'onboarding.accessibility.slideshow',
    PAGINATION: 'onboarding.accessibility.pagination',
    SLIDE: 'onboarding.accessibility.slide',
    NEXT: 'onboarding.accessibility.next',
    PREVIOUS: 'onboarding.accessibility.previous',
  },
} as const;

/**
 * Chei pentru Task Management
 */
export const TASK_TRANSLATIONS = {
  ITEM: {
    ACCESSIBILITY: {
      TASK_STATUS: 'taskItem.accessibility.taskStatus',
      TOGGLE_COMPLETE: 'taskItem.accessibility.toggleComplete',
      EDIT: 'taskItem.accessibility.edit',
      DELETE: 'taskItem.accessibility.delete',
      EDIT_MODE: 'taskItem.accessibility.editMode',
      EDIT_TITLE: 'taskItem.accessibility.editTitle',
      EDIT_TITLE_HINT: 'taskItem.accessibility.editTitleHint',
      VALIDATION: {
        TITLE_TOO_SHORT: 'taskItem.accessibility.validation.titleTooShort',
        TITLE_REQUIRED: 'taskItem.accessibility.validation.titleRequired',
      },
      PRIORITY: 'taskItem.accessibility.priority',
    },
    PLACEHOLDER: {
      TITLE: 'taskItem.placeholder.title',
    },
    METADATA: {
      CREATED: 'taskItem.metadata.created',
      UPDATED: 'taskItem.metadata.updated',
    },
    VALIDATION: {
      TITLE_MIN_LENGTH: 'taskItem.validation.titleMinLength',
      TITLE_REQUIRED: 'taskItem.validation.titleRequired',
    },
  },
  FILTER: {
    ACCESSIBILITY: {
      FILTER_BUTTON: 'taskFilter.accessibility.filterButton',
      FILTER_OPTIONS: 'taskFilter.accessibility.filterOptions',
      SELECTED_FILTER: 'taskFilter.accessibility.selectedFilter',
    },
    OPTIONS: {
      ALL: 'taskFilter.options.all',
      ACTIVE: 'taskFilter.options.active',
      COMPLETED: 'taskFilter.options.completed',
      PRIORITY: 'taskFilter.options.priority',
    },
  },
  TIME: {
    ACCESSIBILITY: {
      TIME_SECTION: 'timeSection.accessibility.timeSection',
      TIME_REMAINING: 'timeSection.accessibility.timeRemaining',
      ADD_TASK: 'timeSection.accessibility.addTask',
    },
    LABELS: {
      HOURS: 'timeSection.labels.hours',
      MINUTES: 'timeSection.labels.minutes',
      SECONDS: 'timeSection.labels.seconds',
      PROGRESS: 'timeSection.labels.progress',
      TIME_FRAME: 'timeSection.labels.timeFrame',
      DESCRIPTION: 'timeSection.labels.description',
    },
    PERIODS: {
      MORNING: 'timeSection.periods.morning',
      AFTERNOON: 'timeSection.periods.afternoon',
      EVENING: 'timeSection.periods.evening',
    },
  },
  TAG: {
    ACCESSIBILITY: {
      TAG_SELECTOR: 'tagSelector.accessibility.tagSelector',
      TAG_OPTION: 'tagSelector.accessibility.tagOption',
      SELECTED_TAGS: 'tagSelector.accessibility.selectedTags',
    },
    LABELS: {
      ADD_TAG: 'tagSelector.labels.addTag',
      REMOVE_TAG: 'tagSelector.labels.removeTag',
    },
  },
} as const;

/**
 * Chei pentru formatarea datei și timpului
 */
export const DATE_TIME_TRANSLATIONS = {
  TIME: {
    HOURS_24: 'dateTime.time.hours24',
    HOURS_12: 'dateTime.time.hours12',
    MINUTES: 'dateTime.time.minutes',
    PERIOD: {
      AM: 'dateTime.time.period.am',
      PM: 'dateTime.time.period.pm'
    },
    RANGES: {
      MORNING: 'dateTime.time.ranges.morning',
      AFTERNOON: 'dateTime.time.ranges.afternoon',
      EVENING: 'dateTime.time.ranges.evening'
    },
    FORMAT: {
      SHORT: 'dateTime.time.format.short',
      LONG: 'dateTime.time.format.long',
      RANGE: 'dateTime.time.format.range'
    }
  },
  DATE: {
    WEEKDAY: {
      SHORT: {
        MON: 'dateTime.date.weekday.short.mon',
        TUE: 'dateTime.date.weekday.short.tue',
        WED: 'dateTime.date.weekday.short.wed',
        THU: 'dateTime.date.weekday.short.thu',
        FRI: 'dateTime.date.weekday.short.fri',
        SAT: 'dateTime.date.weekday.short.sat',
        SUN: 'dateTime.date.weekday.short.sun'
      },
      LONG: {
        MON: 'dateTime.date.weekday.long.mon',
        TUE: 'dateTime.date.weekday.long.tue',
        WED: 'dateTime.date.weekday.long.wed',
        THU: 'dateTime.date.weekday.long.thu',
        FRI: 'dateTime.date.weekday.long.fri',
        SAT: 'dateTime.date.weekday.long.sat',
        SUN: 'dateTime.date.weekday.long.sun'
      }
    },
    MONTH: {
      SHORT: {
        JAN: 'dateTime.date.month.short.jan',
        FEB: 'dateTime.date.month.short.feb',
        MAR: 'dateTime.date.month.short.mar',
        APR: 'dateTime.date.month.short.apr',
        MAY: 'dateTime.date.month.short.may',
        JUN: 'dateTime.date.month.short.jun',
        JUL: 'dateTime.date.month.short.jul',
        AUG: 'dateTime.date.month.short.aug',
        SEP: 'dateTime.date.month.short.sep',
        OCT: 'dateTime.date.month.short.oct',
        NOV: 'dateTime.date.month.short.nov',
        DEC: 'dateTime.date.month.short.dec'
      },
      LONG: {
        JAN: 'dateTime.date.month.long.jan',
        FEB: 'dateTime.date.month.long.feb',
        MAR: 'dateTime.date.month.long.mar',
        APR: 'dateTime.date.month.long.apr',
        MAY: 'dateTime.date.month.long.may',
        JUN: 'dateTime.date.month.long.jun',
        JUL: 'dateTime.date.month.long.jul',
        AUG: 'dateTime.date.month.long.aug',
        SEP: 'dateTime.date.month.long.sep',
        OCT: 'dateTime.date.month.long.oct',
        NOV: 'dateTime.date.month.long.nov',
        DEC: 'dateTime.date.month.long.dec'
      }
    },
    FORMAT: {
      SHORT: 'dateTime.date.format.short',
      LONG: 'dateTime.date.format.long',
      RELATIVE: {
        TODAY: 'dateTime.date.format.relative.today',
        YESTERDAY: 'dateTime.date.format.relative.yesterday',
        TOMORROW: 'dateTime.date.format.relative.tomorrow',
        DAYS: {
          PAST: 'dateTime.date.format.relative.days.past',
          FUTURE: 'dateTime.date.format.relative.days.future'
        }
      }
    }
  }
} as const;

/**
 * Chei comune pentru toate componentele
 */
export const COMMON_TRANSLATIONS = {
  ACTIONS: {
    SAVE: 'common.save',
    CANCEL: 'common.cancel',
    DELETE: 'common.delete',
    EDIT: 'common.edit',
  },
  STATUS: {
    COMPLETED: 'common.completed',
    INCOMPLETE: 'common.incomplete',
    MARK_COMPLETE: 'common.markComplete',
    MARK_INCOMPLETE: 'common.markIncomplete',
  },
} as const;

/**
 * Chei pentru navigare
 */
export const NAVIGATION_TRANSLATIONS = {
  TABS: {
    TASKS: 'navigation.tabs.tasks',
    CALENDAR: 'navigation.tabs.calendar',
    FOCUS: 'navigation.tabs.focus',
    STATS: 'navigation.tabs.stats',
    SETTINGS: 'navigation.tabs.settings',
  },
  TITLES: {
    TASK_MANAGEMENT: 'navigation.titles.taskManagement',
    LOGIN: 'navigation.titles.login',
    REGISTER: 'navigation.titles.register',
  },
} as const;

/**
 * Chei pentru task management
 */
export const TASK_MANAGEMENT_TRANSLATIONS = {
  TITLE: 'taskManagement.title',
  FILTERS: {
    ALL: 'taskManagement.filters.all',
    ACTIVE: 'taskManagement.filters.active',
    COMPLETED: 'taskManagement.filters.completed',
    PRIORITY: 'taskManagement.filters.priority',
  },
  BUTTONS: {
    ADD_TASK: 'taskManagement.buttons.addTask',
    DELETE_TASK: 'taskManagement.buttons.deleteTask',
    ADD_PRIORITY: 'taskManagement.buttons.addPriority',
    REMOVE_PRIORITY: 'taskManagement.buttons.removePriority',
  },
  LABELS: {
    UNTITLED_TASK: 'taskManagement.labels.untitledTask',
    EDIT_TASK: 'taskManagement.labels.editTask',
  },
  ALERTS: {
    SOFT_LIMIT: {
      TITLE: 'taskManagement.alerts.softLimit.title',
      MESSAGE: 'taskManagement.alerts.softLimit.message',
      CONFIRM: 'taskManagement.alerts.softLimit.confirm',
    },
  },
  ERRORS: {
    NOT_AUTHENTICATED: 'taskManagement.errors.notAuthenticated',
    ADD_TASK: 'taskManagement.errors.addTask',
  },
  PERIODS: {
    MORNING: {
      TITLE: 'taskManagement.periods.morning.title',
      DESCRIPTION: 'taskManagement.periods.morning.description',
    },
    AFTERNOON: {
      TITLE: 'taskManagement.periods.afternoon.title',
      DESCRIPTION: 'taskManagement.periods.afternoon.description',
    },
    EVENING: {
      TITLE: 'taskManagement.periods.evening.title',
      DESCRIPTION: 'taskManagement.periods.evening.description',
    },
  },
} as const;
