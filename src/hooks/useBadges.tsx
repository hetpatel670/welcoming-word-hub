
import { useState } from 'react';
import { Badge } from '../types';

export const useBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', name: 'First Steps', icon: '👟', description: 'Complete your first task', earned: false },
    { id: '2', name: 'Getting Started', icon: '🌱', description: 'Complete 5 tasks', earned: false },
    { id: '3', name: 'Task Master', icon: '🎯', description: 'Complete 10 tasks', earned: false },
    { id: '4', name: 'Streak Starter', icon: '🔥', description: 'Maintain a 3-day streak', earned: false },
    { id: '5', name: 'Week Warrior', icon: '💪', description: 'Maintain a 7-day streak', earned: false },
    { id: '6', name: 'Consistency King', icon: '👑', description: 'Maintain a 14-day streak', earned: false },
    { id: '7', name: 'Habit Hero', icon: '🦸', description: 'Complete 25 tasks', earned: false },
    { id: '8', name: 'Task Champion', icon: '🏆', description: 'Complete 50 tasks', earned: false },
    { id: '9', name: 'Dedication Master', icon: '🌟', description: 'Maintain a 30-day streak', earned: false },
    { id: '10', name: 'Century Club', icon: '💯', description: 'Complete 100 tasks', earned: false },
  ]);

  const updateBadges = (newStreak: number, totalCompletedTasks: number = 0) => {
    const updatedBadges = badges.map(badge => {
      // Task completion badges
      if (badge.id === '1' && totalCompletedTasks >= 1 && !badge.earned) {
        return { ...badge, earned: true };
      }
      if (badge.id === '2' && totalCompletedTasks >= 5 && !badge.earned) {
        return { ...badge, earned: true };
      }
      if (badge.id === '3' && totalCompletedTasks >= 10 && !badge.earned) {
        return { ...badge, earned: true };
      }
      if (badge.id === '7' && totalCompletedTasks >= 25 && !badge.earned) {
        return { ...badge, earned: true };
      }
      if (badge.id === '8' && totalCompletedTasks >= 50 && !badge.earned) {
        return { ...badge, earned: true };
      }
      if (badge.id === '10' && totalCompletedTasks >= 100 && !badge.earned) {
        return { ...badge, earned: true };
      }

      // Streak badges
      if (badge.id === '4' && newStreak >= 3 && !badge.earned) {
        return { ...badge, earned: true };
      }
      if (badge.id === '5' && newStreak >= 7 && !badge.earned) {
        return { ...badge, earned: true };
      }
      if (badge.id === '6' && newStreak >= 14 && !badge.earned) {
        return { ...badge, earned: true };
      }
      if (badge.id === '9' && newStreak >= 30 && !badge.earned) {
        return { ...badge, earned: true };
      }

      return badge;
    });
    
    setBadges(updatedBadges);
    
    // Return newly earned badges for notifications
    const newlyEarned = updatedBadges.filter((badge, index) => 
      badge.earned && !badges[index].earned
    );
    
    return newlyEarned;
  };

  return {
    badges,
    updateBadges
  };
};
