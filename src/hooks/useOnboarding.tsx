
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

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

  return {
    showOnboarding,
    setOnboardingComplete
  };
};
