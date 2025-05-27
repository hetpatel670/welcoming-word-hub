
import { useState, useEffect } from 'react';
import { User } from '../types';

export const useUsernamePrompt = (user: User | null | undefined, isLoggedIn: boolean | undefined) => {
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

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

  return {
    showUsernamePrompt,
    setUsernamePromptComplete
  };
};
