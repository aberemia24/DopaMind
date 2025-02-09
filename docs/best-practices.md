# DopaMind Best Practices

## Priorități Critice [HIGH PRIORITY]

### 1. Securitate
- Nu expune variabile de mediu sensibile în bundle
  ```typescript
  // ❌ Evită
  const apiKey = "1234567890";
  
  // ✅ Folosește
  const apiKey = process.env.EXPO_PUBLIC_API_KEY;
  ```

### 2. Type Safety
- Evită `any` și folosește type guards
  ```typescript
  // ❌ Evită
  const handleData = (data: any) => { ... }
  
  // ✅ Folosește
  interface TaskData {
    id: string;
    title: string;
  }
  const handleData = (data: TaskData) => { ... }
  ```

### 3. Error Handling
- Implementează error boundaries și logging
  ```typescript
  // ✅ Error Boundary de bază
  class ErrorBoundary extends React.Component {
    componentDidCatch(error: Error) {
      // Log error
      console.error(error);
    }
  }
  ```

## Arhitectură și Organizare

### Structura Proiectului
- Organizează codul în directoare logice
- Păstrează o structură plată pentru componente reutilizabile
- Grupează componentele specifice feature-urilor în subdirectoare
  ```typescript
  // ✅ Exemplu de barrel export
  // features/tasks/index.ts
  export * from './components';
  export * from './hooks';
  ```

### Navigare [HIGH PRIORITY]
- Folosește navigatoare separate pentru stări diferite
- Gestionează starea de autentificare la nivel de RootNavigator
  ```typescript
  // ✅ Exemplu de type safety în navigare
  type RootStackParamList = {
    Home: undefined;
    Task: { taskId: string };
  };
  ```

### State Management
- Folosește Context pentru state global
  ```typescript
  // ✅ Exemplu de context
  const TaskContext = createContext<TaskContextType | null>(null);
  ```
- Preferă state local pentru componente izolate

## Performanță și Optimizare

### 1. Liste și Scroll Views
- Folosește FlashList în loc de FlatList pentru liste lungi
  ```typescript
  // ❌ Evită pentru liste lungi
  <FlatList
    data={items}
    renderItem={renderItem}
  />

  // ✅ Folosește
  <FlashList
    data={items}
    renderItem={renderItem}
    estimatedItemSize={88} // Specifică întotdeauna o dimensiune estimată
  />
  ```

### 2. Memoizare și Prevenirea Re-renderurilor
- Folosește React.memo pentru componente pure
- Memoizează callback-urile cu useCallback
- Specifică funcții de comparare personalizate când e necesar
  ```typescript
  // ✅ Exemplu complet de optimizare
  const TaskItem = React.memo(({ task, onToggle }) => {
    const handleToggle = useCallback(() => {
      onToggle(task.id);
    }, [task.id, onToggle]);

    return <Component onPress={handleToggle} />;
  }, (prev, next) => {
    return prev.task.id === next.task.id &&
           prev.task.completed === next.task.completed;
  });
  ```

## Navigare și Autentificare

### 1. Protejarea Rutelor
- Implementează middleware pentru verificarea accesului
- Gestionează corect tranziția între stacks de navigare
  ```typescript
  // ✅ Gestionare corectă a accesului refuzat
  const handleAccessDenied = useCallback(() => {
    setIsAuthenticated(false); // Forțează rerender la AuthStack
  }, [setIsAuthenticated]);
  ```

### 2. Starea de Autentificare
- Menține o singură sursă de adevăr pentru starea de autentificare
- Expune doar metodele necesare prin hook-uri
  ```typescript
  // ✅ Interfață clară pentru autentificare
  interface UseAuthReturn {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    login: (credentials: Credentials) => Promise<boolean>;
    logout: () => Promise<boolean>;
  }
  ```

## Package Management și Dependențe

### 1. Consistență în Package Management
- Folosește un singur package manager (npm sau yarn)
- Menține un singur fișier de lock
- Verifică compatibilitatea înainte de a adăuga dependențe noi

### 2. Versiuni și Compatibilitate
- Specifică versiuni exacte pentru dependențe critice
- Verifică compatibilitatea cu Expo SDK
- Rezolvă proactiv conflictele de dependențe
  ```json
  // ✅ Exemplu package.json
  {
    "dependencies": {
      "@shopify/flash-list": "1.7.3",
      "expo": "^52.0.0"
    }
  }
  ```

## Procese de Development

### Code Review Process
1. **Self-Review Checklist**
   - Verifică type safety
   - Testează pe iOS și Android
   - Verifică accesibilitate
   - Confirmă că toate textele sunt localizate
   - Rulează suite-ul de teste

2. **Pull Request Template**
   ```markdown
   ## Descriere
   - Ce modificări introduce acest PR?
   
   ## Checklist
   - [ ] Teste adăugate/actualizate
   - [ ] Documentație actualizată
   - [ ] Self-review completat
   ```

### Development Workflow

1. **Feature Development**
   - Dezvoltă un singur feature complet înainte de a trece la următorul
   - Testează pe ambele platforme (iOS & Android)
   - Păstrează branch-ul principal (main) funcțional
   - Fă commit-uri mici și focusate

2. **Code Review (Self)**
   ```markdown
   [ ] Type safety verificată
   [ ] Texte localizate
   [ ] Testat pe iOS
   [ ] Testat pe Android
   [ ] Verificată accesibilitatea de bază
   [ ] Codul rulează în development
   [ ] Console.log-uri curățate
   ```

3. **Commit Guidelines**
   ```bash
   # Format: <tip>: <descriere scurtă>
   
   # Features noi
   feat: adaugă login screen
   feat: implementează task creation
   
   # Bugfix-uri
   fix: repară crash la task creation
   fix: corectează afișare task list
   
   # Refactoring
   refactor: reorganizează folder structure
   refactor: mută logica în custom hook
   ```

4. **Development Best Practices**
   - Rulează aplicația frecvent în development
   - Testează schimbările imediat
   - Menține consola curată de warning-uri
   - Verifică performanța de bază
   - Folosește git pentru tracking schimbări
