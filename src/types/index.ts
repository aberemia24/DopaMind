export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
}

export interface Task {
  id: string;
  title: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  createdAt: Date;
}
