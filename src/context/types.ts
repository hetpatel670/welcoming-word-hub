
import { Task, User, Badge, UserProfile } from '../types';

export interface AppContextType {
  tasks: Task[];
  user: User | null | undefined;
  badges: Badge[];
  isLoggedIn: boolean | undefined;
  currentStreak: number;
  completedTasksPercentage: number;
  activeTab: string;
  showOnboarding: boolean;
  showUsernamePrompt: boolean;
  setActiveTab: (tab: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setUsernamePromptComplete: (complete: boolean) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (sourceIndex: number, destinationIndex: number) => void;
  updateUsername: (username: string) => Promise<void>;
  updateProfileVisibility: (isPublic: boolean) => Promise<void>;
  fetchPublicProfiles: () => Promise<UserProfile[]>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}
