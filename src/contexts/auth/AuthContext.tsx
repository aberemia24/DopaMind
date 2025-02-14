import { createContext } from 'react';
import type { AuthContextValue } from './types';

/**
 * Context pentru autentificare
 * Folosit pentru a partaja starea de autentificare în aplicație
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
