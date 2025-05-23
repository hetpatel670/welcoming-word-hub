
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, User, Badge, UserProfile } from '../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  Auth,
  User as FirebaseUser,
  browserLocalPersistence
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Firestore
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [completedTasksPercentage, setCompletedTasksPercentage] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  
  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', name: 'Hydration Hero', icon: '💧', description: 'Complete water drinking tasks 7 days in a row', earned: false },
    { id: '2', name: 'Early Reader', icon: '📚', description: 'Read in the morning for 5 days', earned: false },
    { id: '3', name: 'Productive Week', icon: '🎯', description: 'Complete all tasks for a full week', earned: false },
  ]);

  // Firebase auth state listener
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    
    const setupAuth = async () => {
      try {
        console.log("Setting up Firebase auth listener");
        const auth = getFirebaseAuth();
        
        // Initialize Firebase auth with persistence first
        try {
          console.log("Setting up Firebase auth persistence");
          await auth.setPersistence(browserLocalPersistence);
          console.log("Firebase auth persistence set successfully");
        } catch (error) {
          console.error("Error setting auth persistence:", error);
        }
        
        // Then set up the auth state listener
        console.log("Setting up auth state change listener");
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser ? `User logged in: ${firebaseUser.uid}` : "No user");
          
          if (firebaseUser) {
            try {
              console.log("Fetching user data for:", firebaseUser.uid);
              const userData = await fetchUserData(firebaseUser.uid);
              console.log("User data fetched successfully:", userData ? "User exists" : "New user");
              
              // Create a basic user object with the Firebase user info
              const userObj = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                points: userData?.points || 0,
                currentStreak: userData?.currentStreak || 0,
                username: userData?.username || '',
                isPublicProfile: userData?.isPublicProfile || false
              };
              
              setUser(userObj);
              setIsLoggedIn(true);
              
              console.log("Fetching user tasks");
              await fetchUserTasks(firebaseUser.uid);
              
              console.log("Fetching user streak");
              await fetchUserStreak(firebaseUser.uid);
              
              console.log("All user data loaded successfully");
            } catch (error) {
              console.error('Error in auth state listener:', error);
              // Don't reset login state on error fetching user data
              // Just create a basic user object with the Firebase user info
              const userObj = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                points: 0,
                currentStreak: 0,
                username: '',
                isPublicProfile: false
              };
              setUser(userObj);
              setIsLoggedIn(true);
            }
          } else {
            console.log("No user logged in, resetting state");
            setUser(null);
            setIsLoggedIn(false);
            setTasks([]);
            setCurrentStreak(0);
          }
        });
        
        console.log("Auth state listener setup complete");
      } catch (error) {
        console.error('Error setting up auth listener:', error);
      }
    };
    
    setupAuth();
    
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<User> => {
    try {
      const db = getFirebaseFirestore();
      const auth = getFirebaseAuth();
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          id: uid,
          email: userDoc.data().email,
          username: userDoc.data().username || '',
          points: userDoc.data().points || 0,
          currentStreak: userDoc.data().currentStreak || 0,
          isPublicProfile: userDoc.data().isPublicProfile || false
        };
      } else {
        // Create user document if it doesn't exist
        const newUser = {
          id: uid,
          email: auth.currentUser?.email || '',
          points: 0,
          currentStreak: 0,
          isPublicProfile: false
        };
        await setDoc(userDocRef, newUser);
        return newUser;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      const auth = getFirebaseAuth();
      return {
        id: uid,
        email: auth.currentUser?.email || '',
        points: 0,
        currentStreak: 0,
        isPublicProfile: false
      };
    }
  };

  // Fetch user tasks from Firestore
  const fetchUserTasks = async (uid: string) => {
    try {
      const db = getFirebaseFirestore();
      const tasksCollectionRef = collection(db, 'users', uid, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollectionRef);
      const tasksList: Task[] = [];
      
      tasksSnapshot.forEach((doc) => {
        tasksList.push({ id: doc.id, ...doc.data() } as Task);
      });
      
      setTasks(tasksList);
      
      // Calculate completed tasks percentage
      if (tasksList.length > 0) {
        const completedCount = tasksList.filter(task => task.isCompleted).length;
        const percentage = (completedCount / tasksList.length) * 100;
        setCompletedTasksPercentage(Math.round(percentage));
      } else {
        setCompletedTasksPercentage(0);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  // Fetch user streak from Firestore
  const fetchUserStreak = async (uid: string) => {
    try {
      const db = getFirebaseFirestore();
      const streakDocRef = doc(db, 'users', uid, 'streaks', 'current');
      const streakDoc = await getDoc(streakDocRef);
      
      if (streakDoc.exists()) {
        setCurrentStreak(streakDoc.data().currentStreak || 0);
      } else {
        // Create streak document if it doesn't exist
        await setDoc(streakDocRef, { currentStreak: 0, lastCompletedDate: new Date() });
        setCurrentStreak(0);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
      setCurrentStreak(0);
    }
  };

  // Add a new task
  const addTask = async (task: Omit<Task, 'id'>) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return;
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const tasksCollectionRef = collection(db, 'users', uid, 'tasks');
      const newTaskRef = doc(tasksCollectionRef);
      
      const newTask = {
        ...task,
        id: newTaskRef.id,
      };
      
      await setDoc(newTaskRef, newTask);
      setTasks(prev => [...prev, newTask as Task]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Complete a task
  const completeTask = async (id: string) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return;
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const taskDocRef = doc(db, 'users', uid, 'tasks', id);
      
      await updateDoc(taskDocRef, { isCompleted: true });
      
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, isCompleted: true } : task
        )
      );
      
      // Add points for completing task
      if (user) {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
          points: (user.points || 0) + 10
        });
        setUser(prev => prev ? { ...prev, points: prev.points + 10 } : null);
      }

      // Update the completed tasks percentage
      const updatedTasks = tasks.map(task => task.id === id ? { ...task, isCompleted: true } : task);
      const completedCount = updatedTasks.filter(task => task.isCompleted).length;
      const percentage = (completedCount / updatedTasks.length) * 100;
      setCompletedTasksPercentage(Math.round(percentage));
      
      // Check and update streak if all tasks are completed
      checkAndUpdateStreak(updatedTasks);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Uncomplete a task
  const uncompleteTask = async (id: string) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return;
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const taskDocRef = doc(db, 'users', uid, 'tasks', id);
      
      await updateDoc(taskDocRef, { isCompleted: false });
      
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, isCompleted: false } : task
        )
      );
      
      // Update completed tasks percentage
      const updatedTasks = tasks.map(task => task.id === id ? { ...task, isCompleted: false } : task);
      if (updatedTasks.length === 0) {
        setCompletedTasksPercentage(0);
      } else {
        const completedCount = updatedTasks.filter(task => task.isCompleted).length;
        const percentage = (completedCount / updatedTasks.length) * 100;
        setCompletedTasksPercentage(Math.round(percentage));
      }
    } catch (error) {
      console.error('Error uncompleting task:', error);
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return;
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const taskDocRef = doc(db, 'users', uid, 'tasks', id);
      
      await deleteDoc(taskDocRef);
      
      setTasks(prev => prev.filter(task => task.id !== id));
      
      // Update completed tasks percentage
      const updatedTasks = tasks.filter(task => task.id !== id);
      if (updatedTasks.length === 0) {
        setCompletedTasksPercentage(0);
      } else {
        const completedCount = updatedTasks.filter(task => task.isCompleted).length;
        const percentage = (completedCount / updatedTasks.length) * 100;
        setCompletedTasksPercentage(Math.round(percentage));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Check and update streak
  const checkAndUpdateStreak = async (currentTasks: Task[]) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser || currentTasks.length === 0) return;
    
    try {
      const allCompleted = currentTasks.every(task => task.isCompleted);
      
      if (allCompleted) {
        const db = getFirebaseFirestore();
        const uid = auth.currentUser.uid;
        const streakDocRef = doc(db, 'users', uid, 'streaks', 'current');
        const streakDoc = await getDoc(streakDocRef);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (streakDoc.exists()) {
          const lastCompletedDate = streakDoc.data().lastCompletedDate?.toDate() || new Date(0);
          lastCompletedDate.setHours(0, 0, 0, 0);
          
          const timeDiff = today.getTime() - lastCompletedDate.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24);
          
          let newStreak = streakDoc.data().currentStreak || 0;
          
          if (daysDiff === 1) {
            // Consecutive day, increment streak
            newStreak += 1;
          } else if (daysDiff === 0) {
            // Same day, don't change streak
          } else {
            // Streak broken
            newStreak = 1;
          }
          
          await updateDoc(streakDocRef, {
            currentStreak: newStreak,
            lastCompletedDate: today
          });
          
          setCurrentStreak(newStreak);
          
          // Update user streak in user document
          const userDocRef = doc(db, 'users', uid);
          await updateDoc(userDocRef, {
            currentStreak: newStreak
          });
          
          setUser(prev => prev ? { ...prev, currentStreak: newStreak } : null);
          
          // Check for badge unlocks based on streak
          const updatedBadges = [...badges];
          if (newStreak >= 7 && !badges[0].earned) {
            updatedBadges[0] = { ...updatedBadges[0], earned: true };
          }
          setBadges(updatedBadges);
        } else {
          // Create streak document if it doesn't exist
          await setDoc(streakDocRef, {
            currentStreak: 1,
            lastCompletedDate: today
          });
          
          setCurrentStreak(1);
          
          // Update user streak in user document
          const userDocRef = doc(db, 'users', uid);
          await updateDoc(userDocRef, {
            currentStreak: 1
          });
          
          setUser(prev => prev ? { ...prev, currentStreak: 1 } : null);
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logging in with:', email);
      
      // User data will be fetched by the auth state listener
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Register new user
  const register = async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Create user document
      const db = getFirebaseFirestore();
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        email,
        points: 0,
        currentStreak: 0,
        username: '',
        isPublicProfile: false
      });
      
      // Create streak document
      const streakDocRef = doc(db, 'users', uid, 'streaks', 'current');
      await setDoc(streakDocRef, {
        currentStreak: 0,
        lastCompletedDate: new Date()
      });
      
      // User data will be fetched by the auth state listener
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Logging in with Google');
      
      const uid = userCredential.user.uid;
      const email = userCredential.user.email || '';
      
      // Check if user document exists
      const db = getFirebaseFirestore();
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document
        await setDoc(userDocRef, {
          email,
          points: 0,
          currentStreak: 0,
          username: '',
          isPublicProfile: false
        });
        
        // Create streak document
        const streakDocRef = doc(db, 'users', uid, 'streaks', 'current');
        await setDoc(streakDocRef, {
          currentStreak: 0,
          lastCompletedDate: new Date()
        });
      }
      
      // User data will be fetched by the auth state listener
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      // Reset states
      setUser(null);
      setIsLoggedIn(false);
      setTasks([]);
      setCurrentStreak(0);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // Function to set onboarding as complete
  const setOnboardingComplete = (complete: boolean) => {
    setShowOnboarding(!complete);
    
    // Store onboarding status in localStorage to persist across sessions
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

  // Add function to update username
  const updateUsername = async (username: string): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);
      
      await updateDoc(userDocRef, { username });
      
      // Update local state
      setUser(prev => prev ? { ...prev, username } : null);
      setShowUsernamePrompt(false);
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  };

  // Add function to update profile visibility
  const updateProfileVisibility = async (isPublic: boolean): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);
      
      await updateDoc(userDocRef, { isPublicProfile: isPublic });
      
      // Update local state
      setUser(prev => prev ? { ...prev, isPublicProfile: isPublic } : null);
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      throw error;
    }
  };

  // Add function to fetch public profiles
  const fetchPublicProfiles = async (): Promise<UserProfile[]> => {
    try {
      const db = getFirebaseFirestore();
      const usersQuery = query(
        collection(db, 'users'),
        where('isPublicProfile', '==', true)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const profiles: UserProfile[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        // Skip current user
        if (userDoc.id === user?.id) continue;
        
        const userData = userDoc.data();
        
        // Skip users without username
        if (!userData.username) continue;
        
        // Get user badges
        const badgesSnapshot = await getDocs(collection(db, 'users', userDoc.id, 'badges'));
        const userBadges: Badge[] = badgesSnapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data()
        } as Badge));
        
        profiles.push({
          id: userDoc.id,
          username: userData.username,
          points: userData.points || 0,
          currentStreak: userData.currentStreak || 0,
          badges: userBadges,
          isPublicProfile: true
        });
      }
      
      return profiles;
    } catch (error) {
      console.error('Error fetching public profiles:', error);
      return [];
    }
  };

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
