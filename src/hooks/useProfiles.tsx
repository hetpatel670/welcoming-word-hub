
import { useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { UserProfile, Badge } from '../types';

export const useProfiles = (currentUsername?: string) => {
  const fetchPublicProfiles = async (): Promise<UserProfile[]> => {
    try {
      const profiles = await firestoreService.getPublicProfiles();
      
      // Filter out current user and format the data
      return profiles
        .filter(profile => profile.id !== currentUsername)
        .map(profile => ({
          id: profile.id,
          username: profile.username || profile.id,
          points: profile.points || 0,
          currentStreak: profile.currentStreak || 0,
          badges: [], // TODO: Implement badges if needed
          isPublicProfile: true
        }));
    } catch (error) {
      console.error('Error fetching public profiles:', error);
      return [];
    }
  };

  return {
    fetchPublicProfiles
  };
};
