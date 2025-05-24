import { useState, useEffect, useCallback } from 'react';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase'; // Correct path
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import type { User as FirebaseUser } from '@react-native-firebase/auth'; // Firebase's User type
import type { User } from '../types'; // Your app's User type

// Placeholder for WEB_CLIENT_ID - THIS MUST BE REPLACED BY THE USER
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID, // From Google Cloud Console, for the web app
  offlineAccess: false, // Set to true if you need offline access
});

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<any | null>(null);

  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();

  const mapFirebaseUserToAppUser = (firebaseUser: FirebaseUser, additionalData?: Record<string, any>): User => {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      username: firebaseUser.displayName || additionalData?.username || undefined, // Use displayName or Firestore username
      // photoURL: firebaseUser.photoURL || undefined, // If you use photoURL
      // Add any other fields your User type has, potentially from Firestore
      ...additionalData,
    };
  };

  const onAuthStateChanged = useCallback(async (firebaseUser: FirebaseUser | null) => {
    setLoading(true);
    if (firebaseUser) {
      try {
        const userDocRef = firestore.collection('users').doc(firebaseUser.uid);
        const userDoc = await userDoc.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          setUser(mapFirebaseUserToAppUser(firebaseUser, userData));
        } else {
          // If user exists in Auth but not Firestore, create a basic profile
          // This might happen if Firestore profile creation failed during sign-up
          const newUserProfile = {
            email: firebaseUser.email,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          };
          await userDocRef.set(newUserProfile, { merge: true });
          setUser(mapFirebaseUserToAppUser(firebaseUser, newUserProfile));
        }
        setIsLoggedIn(true);
        setAuthError(null);
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        // Fallback to basic user info if Firestore fails
        setUser(mapFirebaseUserToAppUser(firebaseUser));
        setIsLoggedIn(true);
        setAuthError(error); // Store Firestore error
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, [auth, firestore]);

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Unsubscribe on unmount
  }, [auth, onAuthStateChanged]);

  const googleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth.signInWithCredential(googleCredential);
      
      if (userCredential.user) {
        const firebaseUser = userCredential.user;
        // Check if user is new to create Firestore document
        if (userCredential.additionalUserInfo?.isNewUser) {
          const userDocRef = firestore.collection('users').doc(firebaseUser.uid);
          await userDocRef.set({
            email: firebaseUser.email,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            // any other default fields
          }, { merge: true });
        }
        // onAuthStateChanged will handle setting user state
        return { success: true, user: mapFirebaseUserToAppUser(firebaseUser) };
      }
      return { success: false, error: 'No user found after sign in.' };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google Sign-In cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google Sign-In in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
        setAuthError('Play services not available or outdated.');
      } else {
        console.error('Google Sign-In Error:', error);
        setAuthError(error.message || 'An unknown error occurred during Google Sign-In.');
      }
      // Ensure user is signed out from Google if Firebase sign-in fails partway
      const isSignedInWithGoogle = await GoogleSignin.isSignedIn();
      if (isSignedInWithGoogle) {
          await GoogleSignin.signOut();
      }
      return { success: false, error: authError || error.message };
    } finally {
      setLoading(false);
    }
  };
  
  const emailSignUp = async (emailP: string, passwordP: string, usernameP?: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(emailP, passwordP);
      if (userCredential.user) {
        const firebaseUser = userCredential.user;
        // Update Firebase Auth profile (optional, displayName mainly)
        if (usernameP) {
          await firebaseUser.updateProfile({ displayName: usernameP });
        }
        // Create user document in Firestore
        const userDocRef = firestore.collection('users').doc(firebaseUser.uid);
        await userDocRef.set({
          email: firebaseUser.email,
          username: usernameP || firebaseUser.email?.split('@')[0],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          // any other default fields
        });
        // onAuthStateChanged will handle setting user state
        return { success: true, user: mapFirebaseUserToAppUser(firebaseUser, { username: usernameP }) };
      }
      return { success: false, error: 'User creation failed somehow.' };
    } catch (error: any) {
      console.error("Email Sign Up Error: ", error);
      setAuthError(error.message || 'An unknown error occurred during sign up.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const emailSignIn = async (emailP: string, passwordP: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await auth.signInWithEmailAndPassword(emailP, passwordP);
      // onAuthStateChanged will handle setting user state
      return { success: true };
    } catch (error: any) {
      console.error("Email Sign In Error: ", error);
      setAuthError(error.message || 'An unknown error occurred during sign in.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      // Check if signed in with Google to sign out from there too
      const isSignedInWithGoogle = await GoogleSignin.isSignedIn();
      if (isSignedInWithGoogle) {
        await GoogleSignin.signOut();
      }
      await auth.signOut();
      // onAuthStateChanged will handle setting user state to null
      return { success: true };
    } catch (error: any) {
      console.error("Logout Error: ", error);
      setAuthError(error.message || 'An unknown error occurred during logout.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Function to check if a username is unique (example)
  const isUsernameUnique = async (username: string): Promise<boolean> => {
    try {
      const usersRef = firestore.collection('users');
      const snapshot = await usersRef.where('username', '==', username).limit(1).get();
      return snapshot.empty;
    } catch (error) {
      console.error("Error checking username uniqueness:", error);
      // Default to false or handle error appropriately
      return false;
    }
  };
  
  // Function to update user profile data in Firestore
  const updateUserProfileData = async (userId: string, dataToUpdate: Partial<User>): Promise<{success: boolean, error?: string}> => {
    setLoading(true);
    try {
        const userDocRef = firestore.collection('users').doc(userId);
        await userDocRef.update(dataToUpdate);
        // Re-fetch or update local user state
        const updatedDoc = await userDocRef.get();
        if(updatedDoc.exists && auth.currentUser){
            setUser(mapFirebaseUserToAppUser(auth.currentUser, updatedDoc.data()));
        }
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return { success: false, error: error.message };
    } finally {
        setLoading(false);
    }
  };


  return {
    user,
    loading,
    isLoggedIn,
    authError,
    googleSignIn,
    emailSignUp,
    emailSignIn,
    logout,
    isUsernameUnique, // Expose new functions
    updateUserProfileData, // Expose new functions
  };
};
