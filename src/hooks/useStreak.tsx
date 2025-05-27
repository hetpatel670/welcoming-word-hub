
import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Task } from '../types';

export const useStreak = (user: any, isLoggedIn: boolean) => {
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user && isLoggedIn && user.username) {
      fetchUserStreak(user.username);
    } else {
      setCurrentStreak(0);
    }
  }, [user, isLoggedIn]);

  const fetchUserStreak = async (username: string) => {
    try {
      const streakData = await firestoreService.getUserStreak(username);
      setCurrentStreak(streakData.currentStreak || 0);
    } catch (error) {
      console.error('Error fetching streak:', error);
      setCurrentStreak(0);
    }
  };

  const checkAndUpdateStreak = async (currentTasks: Task[]) => {
    if (!user || !user.username || currentTasks.length === 0) return;
    
    try {
      const allCompleted = currentTasks.every(task => task.isCompleted);
      
      if (allCompleted) {
        const streakData = await firestoreService.getUserStreak(user.username);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastCompletedDate = streakData.lastCompletedDate?.toDate() || new Date(0);
        lastCompletedDate.setHours(0, 0, 0, 0);
        
        const timeDiff = today.getTime() - lastCompletedDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        let newStreak = streakData.currentStreak || 0;
        
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff === 0) {
          // Same day, don't change streak
        } else {
          newStreak = 1;
        }
        
        await firestoreService.updateStreak(user.username, {
          currentStreak: newStreak,
          lastCompletedDate: today
        });
        
        setCurrentStreak(newStreak);
        
        await firestoreService.updateUser(user.username, {
          currentStreak: newStreak
        });
        
        return newStreak;
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  return {
    currentStreak,
    checkAndUpdateStreak,
    setCurrentStreak
  };
};
