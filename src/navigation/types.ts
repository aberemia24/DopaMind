import { AuthStackParamList } from './AuthStack';
import { AppStackParamList } from './AppStack';

// Tipuri pentru întregul sistem de navigare
export type RootStackParamList = AuthStackParamList & AppStackParamList;

// Re-exportăm tipurile specifice pentru stive
export type { AuthStackParamList } from './AuthStack';
export type { AppStackParamList } from './AppStack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
