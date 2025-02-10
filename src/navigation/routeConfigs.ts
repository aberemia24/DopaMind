import { Platform } from 'react-native';

export type RouteConfig = {
  name: string;
  requiresAuth: boolean;
  allowedPlatforms?: ('web' | 'ios' | 'android')[];
};

/**
 * Configurare rute cu reguli de acces
 */
export const routeConfigs: RouteConfig[] = [
  // Tab Routes
  { name: 'Tasks', requiresAuth: true },
  { name: 'Calendar', requiresAuth: true },
  { name: 'Focus', requiresAuth: true },
  { name: 'Stats', requiresAuth: true },
  { name: 'Settings', requiresAuth: true },
  
  // Stack Routes
  { name: 'MainTabs', requiresAuth: true },
  { name: 'TaskManagement', requiresAuth: true }, // Pentru backwards compatibility
  { name: 'CrisisButton', requiresAuth: true, allowedPlatforms: ['ios', 'android'] },
  
  // Auth Routes
  { name: 'Welcome', requiresAuth: false },
  { name: 'Login', requiresAuth: false },
  { name: 'Register', requiresAuth: false }
];

/**
 * Verifică dacă ruta este permisă pe platforma curentă
 */
export function isPlatformAllowed(config: RouteConfig): boolean {
  if (!config.allowedPlatforms) return true;
  return config.allowedPlatforms.includes(Platform.OS as 'web' | 'ios' | 'android');
}
