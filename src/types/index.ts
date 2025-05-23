
export interface Task {
  id: string;
  name: string;
  frequency: 'daily' | 'mon-wed-fri' | 'every-3-hours' | string;
  reminderTime?: string;
  isCompleted: boolean;
}

export interface User {
  id: string;
  email: string;
  points: number;
  currentStreak: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}
