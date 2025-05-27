
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import LoginPage from '@/components/LoginPage';
import MainApp from '@/components/MainApp';
import Onboarding from '@/components/Onboarding';
import UsernamePrompt from '@/components/UsernamePrompt';
import LoadingSpinner from '@/components/LoadingSpinner';

const Index = () => {
  const { 
    user, 
    isLoggedIn, 
    showOnboarding, 
    showUsernamePrompt, 
    setOnboardingComplete, 
    setUsernamePromptComplete 
  } = useAppContext();

  console.log('Index - Auth state:', { user, isLoggedIn, showOnboarding, showUsernamePrompt });

  // Show loading while Firebase is initializing
  if (user === undefined || isLoggedIn === undefined) {
    return <LoadingSpinner />;
  }

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // If logged in but no username, show username prompt
  if (isLoggedIn && user && !user.username && showUsernamePrompt) {
    return (
      <UsernamePrompt 
        onComplete={() => setUsernamePromptComplete(true)}
      />
    );
  }

  // If first time user, show onboarding
  if (showOnboarding && !user?.onboardingComplete) {
    return (
      <Onboarding 
        onComplete={() => setOnboardingComplete(true)}
      />
    );
  }

  // Show main app
  return <MainApp />;
};

export default Index;
