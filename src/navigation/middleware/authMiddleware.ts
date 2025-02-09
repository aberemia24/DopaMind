import { NavigationState } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { routeConfigs } from '../routeConfigs';

interface AuthMiddlewareProps {
  onDeny: () => void;
}

interface AuthMiddlewareReturn {
  checkAccess: (state: NavigationState) => boolean;
}

/**
 * Hook pentru verificarea accesului la rute protejate
 */
export function useAuthMiddleware({ onDeny }: AuthMiddlewareProps): AuthMiddlewareReturn {
  const { isAuthenticated, sessionExpired } = useAuth();
  
  // Verifică accesul la rută
  const checkAccess = (state: NavigationState): boolean => {
    const currentRoute = state.routes[state.index];
    const routeConfig = routeConfigs.find(r => r.name === currentRoute.name);

    if (!routeConfig) {
      console.warn(`No route config found for: ${currentRoute.name}`);
      return true;
    }

    // Verifică autentificare
    if (routeConfig.requiresAuth && (!isAuthenticated || sessionExpired)) {
      console.warn(`Access denied to protected route: ${currentRoute.name}`);
      onDeny();
      return false;
    }

    return true;
  };

  return {
    checkAccess
  };
}
