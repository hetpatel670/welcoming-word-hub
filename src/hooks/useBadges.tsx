
import { useState } from 'react';
import { Badge } from '../types';

export const useBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', name: 'Hydration Hero', icon: '💧', description: 'Complete water drinking tasks 7 days in a row', earned: false },
    { id: '2', name: 'Early Reader', icon: '📚', description: 'Read in the morning for 5 days', earned: false },
    { id: '3', name: 'Productive Week', icon: '🎯', description: 'Complete all tasks for a full week', earned: false },
  ]);

  const updateBadges = (newStreak: number) => {
    const updatedBadges = [...badges];
    if (newStreak >= 7 && !badges[0].earned) {
      updatedBadges[0] = { ...updatedBadges[0], earned: true };
      setBadges(updatedBadges);
    }
  };

  return {
    badges,
    updateBadges
  };
};
