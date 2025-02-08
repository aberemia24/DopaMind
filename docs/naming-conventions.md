# DopaMind Naming Conventions

## Fișiere și Directoare

### Componente React
- PascalCase pentru numele fișierelor: `LoginScreen.tsx`, `OnboardingSlides.tsx`
- Extensia `.tsx` pentru fișiere cu JSX/TSX
- Extensia `.ts` pentru fișiere doar cu TypeScript
- Fișiere index pentru export: `index.ts`, `index.tsx`

```typescript
// ✅ Corect
/components/
  /Auth/
    LoginForm.tsx
    RegisterForm.tsx
    index.ts
  /Onboarding/
    OnboardingSlides.tsx
    OnboardingProgress.tsx
    index.ts

// ❌ Incorect
/components/
  /auth/
    login-form.tsx
    registerForm.tsx
```

### Directoare
- PascalCase pentru componente: `/Components`, `/Screens`
- camelCase pentru utilități: `/hooks`, `/utils`, `/contexts`
- Grupare logică în subdirectoare: `/Components/Auth`, `/Components/Onboarding`

## Componente React

### Nume Componente
- PascalCase pentru componente: `LoginScreen`, `TaskList`
- Sufixul `Screen` pentru ecrane complete
- Sufixul `List` pentru liste
- Sufixul `Item` pentru elemente din liste
- Sufixul `Form` pentru formulare

```typescript
// ✅ Corect
export function LoginScreen() { }
export function TaskList() { }
export function TaskItem() { }
export function CreateTaskForm() { }

// ❌ Incorect
export function loginScreen() { }
export function Tasks() { }
export function task() { }
```

### Props
- camelCase pentru nume de props
- Prefix `on` pentru event handlers
- Suffix `Ref` pentru referințe
- Prefix `is`/`has` pentru booleeni

```typescript
// ✅ Corect
interface TaskItemProps {
  taskId: string;
  isCompleted: boolean;
  hasAttachments: boolean;
  onTaskComplete: (id: string) => void;
  containerRef: React.RefObject<View>;
}

// ❌ Incorect
interface TaskItemProps {
  TaskId: string;
  completed: boolean;
  taskComplete: (id: string) => void;
}
```

## Hooks

### Nume Hooks
- Prefix `use` pentru toate hooks
- camelCase după prefix
- Nume descriptiv pentru funcționalitate

```typescript
// ✅ Corect
function useTaskManager() { }
function useAuthState() { }
function useLocalStorage() { }

// ❌ Incorect
function TaskManager() { }
function UseAuthState() { }
```

## Funcții și Variabile

### Funcții
- camelCase pentru funcții
- Verbe pentru acțiuni
- Nume descriptive și clare

```typescript
// ✅ Corect
function handleSubmit() { }
function validateEmail() { }
function fetchTaskList() { }

// ❌ Incorect
function Handle_Submit() { }
function emailvalidation() { }
```

### Event Handlers
- Prefix `handle` pentru event handlers
- Urmat de acțiunea specifică

```typescript
// ✅ Corect
const handleSubmit = () => { }
const handleTaskComplete = () => { }
const handleInputChange = () => { }

// ❌ Incorect
const submitForm = () => { }
const taskDone = () => { }
```

### Variabile
- camelCase pentru variabile
- Nume descriptive
- Constante în UPPERCASE_SNAKE_CASE

```typescript
// ✅ Corect
const userName = 'John';
const isLoading = true;
const MAX_RETRY_ATTEMPTS = 3;
const API_ENDPOINTS = {
  AUTH: '/auth',
  TASKS: '/tasks'
};

// ❌ Incorect
const UserName = 'John';
const loading = true;
const maxRetryAttempts = 3;
```

## Tipuri și Interfețe

### Tipuri
- PascalCase pentru tipuri
- Suffix `Type` pentru type aliases
- Suffix `Props` pentru props types

```typescript
// ✅ Corect
type TaskType = {
  id: string;
  title: string;
};

type TaskListProps = {
  tasks: TaskType[];
};

// ❌ Incorect
type taskType = {
  id: string;
};
```

### Interfețe
- Prefix `I` pentru interfețe (opțional, dar consistent)
- PascalCase

```typescript
// ✅ Corect
interface ITask {
  id: string;
  title: string;
}

interface ITaskService {
  fetchTasks(): Promise<ITask[]>;
}

// ❌ Incorect
interface task {
  id: string;
}
```

## Enums
- PascalCase pentru nume enum
- UPPERCASE pentru valori

```typescript
// ✅ Corect
enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

// ❌ Incorect
enum taskStatus {
  pending = 'pending',
  inProgress = 'in_progress'
}
```

## Chei de Traducere
- camelCase pentru chei
- Structură ierarhică cu puncte
- Grupare logică pe funcționalități

```typescript
// ✅ Corect
{
  "auth": {
    "login": {
      "title": "Conectare",
      "submitButton": "Conectează-te"
    }
  },
  "tasks": {
    "list": {
      "emptyState": "Nu există task-uri"
    }
  }
}

// ❌ Incorect
{
  "LOGIN_TITLE": "Conectare",
  "login-button": "Conectează-te",
  "TasksEmptyState": "Nu există task-uri"
}
```

## TypeScript vs JavaScript

### Reguli de Utilizare
- Tot codul nou **TREBUIE** scris în TypeScript
- Codul existent în JavaScript poate rămâne așa până la modificări majore
- La modificări majore ale unui fișier JavaScript, acesta **TREBUIE** convertit la TypeScript
- Fișierele JavaScript existente **TREBUIE** să folosească PropTypes pentru validarea tipurilor

```typescript
// ✅ Corect - Cod nou în TypeScript
interface TaskProps {
  id: string;
  title: string;
  completed: boolean;
}

// ✅ Acceptabil - Cod existent în JavaScript cu PropTypes
TaskItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired
};

// ❌ Incorect - Cod nou în JavaScript
export function NewComponent(props) {
  // ...
}
