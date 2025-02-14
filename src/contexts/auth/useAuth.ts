import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Hook pentru accesarea AuthContext
 * Expune aceeași interfață ca vechiul useAuth pentru compatibilitate
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
