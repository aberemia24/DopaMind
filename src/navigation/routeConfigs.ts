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
  { name: 'Home', requiresAuth: true },
  { name: 'TaskManagement', requiresAuth: true },
  { name: 'Profile', requiresAuth: true },
  { name: 'Settings', requiresAuth: true },
  { name: 'CrisisButton', requiresAuth: true, allowedPlatforms: ['ios', 'android'] },
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
