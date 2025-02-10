import { merge } from 'lodash';

// Common
import commonActions from './common/actions.json';
import commonFields from './common/fields.json';
import commonValidation from './common/validation.json';
import commonStatus from './common/status.json';

// Features
import auth from './features/auth/index.json';
import errors from './features/errors/index.json';
import taskManagement from './features/taskManagement/index.json';
import datetime from './features/datetime/index.json';

// Combinăm toate traducerile într-un singur obiect
export const ro = merge(
  {
    common: {
      actions: commonActions,
      fields: commonFields,
      validation: commonValidation,
      status: commonStatus,
    }
  },
  {
    auth,
    errors,
    taskManagement,
    datetime
  }
);

// Exportăm și tipurile pentru type safety
export type TranslationKeys = typeof ro;

// Funcție helper pentru a verifica dacă o cheie există în traduceri
export const hasTranslationKey = (key: string): boolean => {
  const parts = key.split('.');
  let current: any = ro;
  
  for (const part of parts) {
    if (current[part] === undefined) {
      return false;
    }
    current = current[part];
  }
  
  return true;
};

// Funcție helper pentru a obține o traducere după cale
export const getTranslation = (key: string): string | undefined => {
  const parts = key.split('.');
  let current: any = ro;
  
  for (const part of parts) {
    if (current[part] === undefined) {
      return undefined;
    }
    current = current[part];
  }
  
  return typeof current === 'string' ? current : undefined;
};

// Funcție pentru a verifica referințele la alte chei de traducere
export const validateTranslationReferences = (): string[] => {
  const errors: string[] = [];
  const checkValue = (value: any, path: string) => {
    if (typeof value === 'string') {
      const matches = value.match(/@:([a-zA-Z0-9.]+)/g);
      if (matches) {
        matches.forEach(match => {
          const key = match.substring(2); // Remove @: prefix
          if (!hasTranslationKey(key)) {
            errors.push(`Invalid reference in ${path}: ${key} does not exist`);
          }
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([k, v]) => {
        checkValue(v, path ? `${path}.${k}` : k);
      });
    }
  };
  
  checkValue(ro, '');
  return errors;
};
