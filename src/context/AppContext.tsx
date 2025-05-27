
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, User, Badge, UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useStreak } from '../hooks/useStreak';
import { useProfiles } from '../hooks/useProfiles';
import { useBadges } from '../hooks/useBadges';
import { useToast } from '@/hooks/use-toast';
import { analyticsService } from '../services/analyticsService';

interface AppContextType {
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
  const { toast } = useToast();

  // Custom hooks
  const { user, isLoggedIn, login, register, logout, updateUsername, updateProfileVisibility } = useAuth();
  const { tasks, completedTasksPercentage, addTask: baseAddTask, completeTask: baseCompleteTask, uncompleteTask, deleteTask, reorderTasks } = useTasks(user, isLoggedIn);
  const { currentStreak, checkAndUpdateStreak, setCurrentStreak } = useStreak(user, isLoggedIn);
  const { badges, updateBadges, evaluateAndAwardSpecialBadge } = useBadges();
  const { fetchPublicProfiles } = useProfiles(user?.username);

  console.log('AppContext - Current state:', { user, isLoggedIn, tasks: tasks.length });

  // Enhanced add task function
  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      await baseAddTask(task);
      
      // Track task creation
      if (typeof analyticsService?.trackTaskCreated === 'function') {
        analyticsService.trackTaskCreated(task.category || 'general');
      }
      
      toast({
        title: "Task added successfully",
        description: `"${task.name}" has been added to your tasks`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error adding task",
        description: "Failed to add task. Please try again.",
      });
    }
  };

  // Enhanced complete task function
  const completeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    
    try {
      await baseCompleteTask(id, async (newPoints: number, oldStreak: number) => {
        if (user && task) {
          const updatedTasks = tasks.map(task => 
            task.id === id ? { ...task, isCompleted: true } : task
          );
          
          // Check and update streak
          const newStreak = await checkAndUpdateStreak(updatedTasks);
          if (newStreak) {
            setCurrentStreak(newStreak);
            updateBadges(newStreak);
            
            // Award badge for completing task
            const badge = await evaluateAndAwardSpecialBadge(task.name, {
              completedTasks: updatedTasks.filter(t => t.isCompleted).length,
              currentStreak: newStreak,
              points: newPoints
            });
            
            if (badge) {
              toast({
                title: "🏆 New Badge Earned!",
                description: `You've earned the "${badge.name}" badge!`,
              });
            }
          }
        }
      });

      toast({
        title: "Task completed!",
        description: task ? `Great job completing "${task.name}"!` : "Task completed successfully!",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error completing task",
        description: "Failed to complete task. Please try again.",
      });
    }
  };

  // Function to set onboarding as complete
  const setOnboardingComplete = (complete: boolean) => {
    setShowOnboarding(!complete);
    
    if (complete) {
      localStorage.setItem('onboardingComplete', 'true');
      if (typeof analyticsService?.trackOnboardingCompleted === 'function') {
        analyticsService.trackOnboardingCompleted();
      }
    }
  };

  // Check localStorage for onboarding status on initial load
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (onboardingComplete === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  // Function to set username prompt complete
  const setUsernamePromptComplete = (complete: boolean) => {
    setShowUsernamePrompt(!complete);
  };

  // Check if username is set
  useEffect(() => {
    if (user && isLoggedIn && !user.username) {
      setShowUsernamePrompt(true);
    } else if (user && user.username) {
      setShowUsernamePrompt(false);
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
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};
