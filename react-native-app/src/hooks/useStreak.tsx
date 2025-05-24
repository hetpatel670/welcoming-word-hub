import { useState, useEffect, useCallback } from 'react';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import type { Task, User } from '../types'; // User might be needed for user.id
import firebase from '@react-native-firebase/app'; // For FieldValue

// Helper function to check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper function to check if two dates are on consecutive days
const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
  const day1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const day2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = Math.abs(day2.getTime() - day1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

export const useStreak = (user: User | null) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const firestore = getFirebaseFirestore();

  const fetchStreakData = useCallback(async () => {
    if (!user) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setLastCompletedDate(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userStreakDocRef = firestore.collection('users').doc(user.id).collection('streaks').doc('summary');
      const docSnap = await userStreakDocRef.get();

      if (docSnap.exists) {
        const data = docSnap.data();
        setCurrentStreak(data?.currentStreak || 0);
        setLongestStreak(data?.longestStreak || 0);
        // Assuming lastCompletedDate is stored as a Firestore Timestamp
        setLastCompletedDate(data?.lastCompletedDate?.toDate ? data.lastCompletedDate.toDate() : null);
      } else {
        // No streak data found, initialize
        setCurrentStreak(0);
        setLongestStreak(0);
        setLastCompletedDate(null);
      }
    } catch (e: any) {
      console.error("Error fetching streak data: ", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [user, firestore]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  const updateStreakOnTaskCompletion = useCallback(async (taskCompletedDate: Date) => {
    if (!user) return;
    setLoading(true);

    const today = new Date(taskCompletedDate.getFullYear(), taskCompletedDate.getMonth(), taskCompletedDate.getDate());
    let newCurrentStreak = currentStreak;
    let newLongestStreak = longestStreak;
    let newLastCompletedDate = lastCompletedDate ? new Date(lastCompletedDate.getFullYear(), lastCompletedDate.getMonth(), lastCompletedDate.getDate()) : null;

    if (newLastCompletedDate) {
      if (isSameDay(today, newLastCompletedDate)) {
        // Task completed on the same day, streak doesn't change yet
        // (This logic assumes one qualifying task per day maintains streak)
      } else if (isConsecutiveDay(today, newLastCompletedDate)) {
        newCurrentStreak += 1;
      } else {
        // Streak broken, reset to 1 (for today's completion)
        newCurrentStreak = 1;
      }
    } else {
      // First task completion
      newCurrentStreak = 1;
    }

    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }
    
    newLastCompletedDate = today;

    try {
      const userStreakDocRef = firestore.collection('users').doc(user.id).collection('streaks').doc('summary');
      await userStreakDocRef.set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: firebase.firestore.Timestamp.fromDate(newLastCompletedDate), // Store as Firestore Timestamp
      }, { merge: true });

      setCurrentStreak(newCurrentStreak);
      setLongestStreak(newLongestStreak);
      setLastCompletedDate(newLastCompletedDate);
    } catch (e: any) {
      console.error("Error updating streak data: ", e);
      setError(e);
      // Optionally revert local state if Firestore update fails, or handle retry
    } finally {
      setLoading(false);
    }
  }, [user, firestore, currentStreak, longestStreak, lastCompletedDate]);
  
  // This function might be called when a task is marked as complete.
  // The logic for determining if it's a "streak-worthy" task might be more complex.
  // For now, any task completion on a new day updates the streak.
  const recordTaskCompletion = async () => {
    const today = new Date(); // Or the actual completion date of the task
    await updateStreakOnTaskCompletion(today);
  };


  // Function to manually check and reset streak if a day is missed
  // This might be run periodically or on app open
  const checkAndResetStreak = useCallback(async () => {
    if (!user || !lastCompletedDate) {
        // No user or no completions yet, nothing to reset
        return;
    }
    setLoading(true);
    const today = new Date();
    const lastCompletion = new Date(lastCompletedDate.getFullYear(), lastCompletedDate.getMonth(), lastCompletedDate.getDate());
    
    if (!isSameDay(today, lastCompletion) && !isConsecutiveDay(today, lastCompletion)) {
        // If today is not the same day as last completion, AND it's not the day after, streak is broken
        try {
            const userStreakDocRef = firestore.collection('users').doc(user.id).collection('streaks').doc('summary');
            await userStreakDocRef.update({ currentStreak: 0 });
            setCurrentStreak(0);
            // lastCompletedDate remains the same until a new task is completed
        } catch (e: any) {
            console.error("Error resetting streak: ", e);
            setError(e);
        }
    }
    setLoading(false);
  }, [user, firestore, lastCompletedDate]);

  useEffect(() => {
    // Check streak when app loads or user changes, after initial fetch
    if (!loading && user && lastCompletedDate) {
        checkAndResetStreak();
    }
  }, [loading, user, lastCompletedDate, checkAndResetStreak]);


  return {
    currentStreak,
    longestStreak,
    lastCompletedDate,
    loading,
    error,
    fetchStreakData, // For manual refresh if needed
    updateStreakOnTaskCompletion, // Main function to call when a task is completed
    recordTaskCompletion, // Simplified wrapper
    checkAndResetStreak, // For periodic checks
  };
};
