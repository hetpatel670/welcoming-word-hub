// Define the Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Define the User interface
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  points: number;
  currentStreak: number;
  onboardingComplete?: boolean;
}

// Define the Badge interface
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}