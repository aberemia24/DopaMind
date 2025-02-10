import { NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from './AppStack';
import { AuthStackParamList } from './AuthStack';
import { TabParamList } from './TabNavigator';

// Tipul pentru navigarea în întreaga aplicație
export type RootStackParamList = {
  App: AppStackParamList;
  Auth: AuthStackParamList;
};

// Tipul pentru navigarea în stack-ul autentificat
export type AppNavigationProp = NavigationProp<AppStackParamList>;

// Tipul pentru navigarea în stack-ul de autentificare
export type AuthNavigationProp = NavigationProp<AuthStackParamList>;

// Tipul pentru navigarea în tab-uri
export type TabNavigationProp = NavigationProp<TabParamList>;

// Declarații globale pentru TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {
      App: undefined;
      Auth: undefined;
    }
  }
}
