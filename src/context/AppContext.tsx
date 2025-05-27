
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Badge, UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useStreak } from '../hooks/useStreak';
import { useProfiles } from '../hooks/useProfiles';
import { useBadges } from '../hooks/useBadges';
import { useOnboarding } from '../hooks/useOnboarding';
import { useUsernamePrompt } from '../hooks/useUsernamePrompt';
import { useEnhancedTasks } from '../hooks/useEnhancedTasks';
import { AppContextType } from './types';

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

  // Custom hooks
  const { user, isLoggedIn, login, register, logout, updateUsername, updateProfileVisibility } = useAuth();
  const { tasks, completedTasksPercentage, addTask: baseAddTask, completeTask: baseCompleteTask, uncompleteTask, deleteTask, reorderTasks } = useTasks(user, isLoggedIn);
  const { currentStreak, checkAndUpdateStreak, setCurrentStreak } = useStreak(user, isLoggedIn);
  const { badges, updateBadges, evaluateAndAwardSpecialBadge } = useBadges();
  const { fetchPublicProfiles } = useProfiles(user?.username);
  const { showOnboarding, setOnboardingComplete } = useOnboarding();
  const { showUsernamePrompt, setUsernamePromptComplete } = useUsernamePrompt(user, isLoggedIn);

  // Enhanced task operations
  const { addTask, completeTask } = useEnhancedTasks({
    tasks,
    user,
    baseAddTask,
    baseCompleteTask,
    checkAndUpdateStreak,
    setCurrentStreak,
    updateBadges,
    evaluateAndAwardSpecialBadge
  });

  console.log('AppContext - Current state:', { user, isLoggedIn, tasks: tasks.length });

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
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};
