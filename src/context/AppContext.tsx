
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, User, Badge, UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useStreak } from '../hooks/useStreak';
import { useProfiles } from '../hooks/useProfiles';
import { useBadges } from '../hooks/useBadges';

interface AppContextType {
  tasks: Task[];
  user: User | null;
  badges: Badge[];
  isLoggedIn: boolean;
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
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

  // Custom hooks
  const { user, isLoggedIn, login, register, loginWithGoogle, logout, updateUsername, updateProfileVisibility } = useAuth();
  const { tasks, completedTasksPercentage, addTask, completeTask: baseCompleteTask, uncompleteTask, deleteTask, reorderTasks } = useTasks(user, isLoggedIn);
  const { currentStreak, checkAndUpdateStreak, setCurrentStreak } = useStreak(user, isLoggedIn);
  const { badges, updateBadges } = useBadges();
  const { fetchPublicProfiles } = useProfiles(user?.id);

  // Enhanced complete task function that updates streak and badges
  const completeTask = async (id: string) => {
    await baseCompleteTask(id, (newPoints: number, oldStreak: number) => {
      // Update user points in local state
      if (user) {
        const updatedTasks = tasks.map(task => 
          task.id === id ? { ...task, isCompleted: true } : task
        );
        
        // Check and update streak
        checkAndUpdateStreak(updatedTasks).then((newStreak) => {
          if (newStreak) {
            setCurrentStreak(newStreak);
            updateBadges(newStreak);
          }
        });
      }
    });
  };

  // Function to set onboarding as complete
  const setOnboardingComplete = (complete: boolean) => {
    setShowOnboarding(!complete);
    
    if (complete) {
      localStorage.setItem('onboardingComplete', 'true');
    }
  };

  // Check localStorage for onboarding status on initial load
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (onboardingComplete === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  // Add function to set username prompt complete
  const setUsernamePromptComplete = (complete: boolean) => {
    setShowUsernamePrompt(!complete);
  };

  // Add effect to check if username is set
  useEffect(() => {
    if (user && isLoggedIn && !user.username) {
      setShowUsernamePrompt(true);
    }
  }, [user, isLoggedIn]);

  return (
    <AppContext.Provider value={{
      tasks,
      user,
      badges,
      isLoggedIn,
      currentStreak,
      completedTasksPercentage,
      activeTab,
      showOnboarding,
      showUsernamePrompt,
      setActiveTab,
      setOnboardingComplete,
      setUsernamePromptComplete,
      addTask,
      completeTask,
      uncompleteTask,
      deleteTask,
      reorderTasks,
      updateUsername,
      updateProfileVisibility,
      fetchPublicProfiles,
      login,
      register,
      logout,
      loginWithGoogle
    }}>
      {children}
    </AppContext.Provider>
  );
};
