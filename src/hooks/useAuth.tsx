
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  browserLocalPersistence
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import { firestoreService } from '../services/firestoreService';
import { analyticsService } from '../services/analyticsService';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    
    const setupAuth = async () => {
      try {
        console.log("Setting up Firebase auth listener");
        const auth = getFirebaseAuth();
        
        try {
          console.log("Setting up Firebase auth persistence");
          await auth.setPersistence(browserLocalPersistence);
          console.log("Firebase auth persistence set successfully");
        } catch (error) {
          console.error("Error setting auth persistence:", error);
        }
        
        console.log("Setting up auth state change listener");
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser ? `User logged in: ${firebaseUser.uid}` : "No user");
          
          if (firebaseUser) {
            try {
              console.log("Fetching user data for:", firebaseUser.uid);
              const userData = await fetchUserDataByEmail(firebaseUser.email || '');
              console.log("User data fetched successfully:", userData ? "User exists" : "New user");
              
              if (userData) {
                setUser(userData);
                setIsLoggedIn(true);
                
                // Set analytics user ID and properties
                analyticsService.setAnalyticsUserId(userData.username || userData.id);
                analyticsService.setUserProperties({
                  user_type: 'returning',
                  has_username: !!userData.username,
                  is_public_profile: userData.isPublicProfile
                });
              } else {
                // User exists in Firebase Auth but not in our Firestore with username
                // This might be a legacy user or new user without username
                const userObj = {
                  id: '', // Will be set when username is chosen
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
                
                // Set analytics properties for new user
                analyticsService.setUserProperties({
                  user_type: 'new',
                  has_username: false,
                  is_public_profile: false
                });
              }
              
              console.log("All user data loaded successfully");
            } catch (error) {
              console.error('Error in auth state listener:', error);
              const userObj = {
                id: '',
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

  const fetchUserDataByEmail = async (email: string): Promise<User | null> => {
    try {
      const db = getFirebaseFirestore();
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return {
          id: userDoc.id, // This is the username
          email: userDoc.data().email,
          username: userDoc.data().username || userDoc.id,
          points: userDoc.data().points || 0,
          currentStreak: userDoc.data().currentStreak || 0,
          isPublicProfile: userDoc.data().isPublicProfile || false,
          displayName: userDoc.data().displayName || '',
          photoURL: userDoc.data().photoURL || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data by email:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Logging in with:', email);
      
      // Track login event
      analyticsService.trackLogin('email');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered successfully. Username will be set later.');
      
      // Track registration event
      analyticsService.trackSignUp('email');
      
      // User document will be created when username is chosen
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };



  const logout = async () => {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateUsername = async (username: string): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    try {
      // Check if username is available
      const isAvailable = await firestoreService.isUsernameAvailable(username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      // Check if user already has a username-based document
      const existingUser = await fetchUserDataByEmail(auth.currentUser.email || '');
      
      if (existingUser && existingUser.username) {
        // User already has a username, just update it
        await firestoreService.updateUser(existingUser.username, { username });
        setUser(prev => prev ? { ...prev, username, id: username } : null);
      } else {
        // Create new user document with username as ID
        const userData = {
          email: auth.currentUser.email || '',
          displayName: auth.currentUser.displayName || '',
          photoURL: auth.currentUser.photoURL || '',
          points: user?.points || 0,
          currentStreak: user?.currentStreak || 0,
          isPublicProfile: user?.isPublicProfile || false
        };

        await firestoreService.createUser(username, userData);
        setUser(prev => prev ? { ...prev, username, id: username } : null);
        
        // Track username set and update analytics
        analyticsService.trackUsernameSet();
        analyticsService.setAnalyticsUserId(username);
        analyticsService.setUserProperties({
          has_username: true
        });
      }
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  };

  const updateProfileVisibility = async (isPublic: boolean): Promise<void> => {
    if (!user || !user.username) throw new Error('User not authenticated or username not set');
    
    try {
      await firestoreService.updateUser(user.username, { isPublicProfile: isPublic });
      setUser(prev => prev ? { ...prev, isPublicProfile: isPublic } : null);
      
      // Track profile visibility change
      analyticsService.trackProfileVisibilityChange(isPublic);
      analyticsService.setUserProperties({
        is_public_profile: isPublic
      });
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      throw error;
    }
  };

  return {
    user,
    isLoggedIn,
    login,
    register,
    logout,
    updateUsername,
    updateProfileVisibility
  };
};
