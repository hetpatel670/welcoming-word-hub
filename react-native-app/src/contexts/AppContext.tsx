import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import placeholder hooks
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useStreak } from '../hooks/useStreak';
import { useProfiles } from '../hooks/useProfiles';
import { useBadges } from '../hooks/useBadges';

// Import placeholder types
import { User, Task, Badge, UserProfile } from '../types';

// Define the shape of the context state
interface AppContextState {
  theme: string;
  setTheme: (theme: string) => void;
  user: User | null; // From useAuth
  isLoggedIn: boolean; // From useAuth
  tasks: Task[]; // From useTasks
  currentStreak: number; // From useStreak
  profile: UserProfile | null; // From useProfiles
  badges: Badge[]; // From useBadges
  // Add other states and functions from the original AppContext as needed
  // For example, functions from hooks if they were directly exposed via context
}

// Create the context with a default undefined value
const AppContext = createContext<AppContextState | undefined>(undefined);

// Define the props for the AppProvider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<string>('light'); // Default theme
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Initialize hooks - these are placeholders for now
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { currentStreak, loading: streakLoading } = useStreak();
  const { profile, loading: profileLoading } = useProfiles();
  const { badges, loading: badgesLoading } = useBadges();

  // Load theme from AsyncStorage on initial mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('app-theme');
        if (storedTheme) {
          setThemeState(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from AsyncStorage:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Function to set theme and persist to AsyncStorage
  const setTheme = async (newTheme: string) => {
    try {
      await AsyncStorage.setItem('app-theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme to AsyncStorage:', error);
    }
  };
  
  // Combine all loading states if needed, or handle them individually
  const isLoading = isInitialLoading || authLoading || tasksLoading || streakLoading || profileLoading || badgesLoading;

  // If still loading initial data (like theme), show a loading indicator or null
  // This prevents rendering children with potentially incorrect theme or uninitialized state
  if (isLoading) {
    // In a real app, you might want to render a global loading spinner here
    return null; 
  }

  const contextValue: AppContextState = {
    theme,
    setTheme,
    user,
    isLoggedIn,
    tasks,
    currentStreak,
    profile,
    badges,
    // Expose other values and functions from hooks as needed
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = (): AppContextState => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
