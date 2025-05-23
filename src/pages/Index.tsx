
import React, { useEffect, useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { useAppContext } from '@/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// Import components directly instead of lazy loading to avoid blank screen issues
import LoginPage from '@/components/LoginPage';
import TaskList from '@/components/TaskList';
import NewTaskPage from '@/components/NewTaskPage';
import Dashboard from '@/components/Dashboard';
import Onboarding from '@/components/Onboarding';
import ProfilePage from '@/pages/ProfilePage';
import ExplorePage from '@/pages/ExplorePage';
import UsernamePrompt from '@/components/UsernamePrompt';
import ErrorBoundary from '@/components/ErrorBoundary';

const AppContent = () => {
  const { isLoggedIn, activeTab, setActiveTab, showOnboarding, showUsernamePrompt, setUsernamePromptComplete } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Add console log for debugging
  console.log('AppContent rendering, isLoggedIn:', isLoggedIn, 'authInitialized:', authInitialized);

  // Add a delay to ensure Firebase auth state is properly initialized
  useEffect(() => {
    // First loading phase - wait for auth to initialize
    const authTimer = setTimeout(() => {
      console.log("Auth initialization timeout completed");
      setAuthInitialized(true);
    }, 2000); // Increased timeout for auth initialization
    
    return () => clearTimeout(authTimer);
  }, []);

  // Second loading phase - after auth is initialized, wait a bit more for UI
  useEffect(() => {
    if (authInitialized) {
      console.log("Auth initialized, starting UI loading timer");
      const uiTimer = setTimeout(() => {
        console.log("UI loading timeout completed");
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(uiTimer);
    }
  }, [authInitialized]);

  // Show loading spinner during both loading phases
  if (isLoading || !authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center login-gradient">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // After loading is complete, show the appropriate screen
  if (!isLoggedIn) {
    console.log("Showing login page");
    return <LoginPage />;
  }
  
  // Show username prompt if needed
  if (showUsernamePrompt) {
    return <UsernamePrompt onComplete={() => setUsernamePromptComplete(true)} />;
  }
  
  // Show onboarding for new users
  if (showOnboarding) {
    console.log("Showing onboarding");
    return <Onboarding />;
  }

  console.log("Showing main app content");
  return (
    <div className="min-h-screen bg-app-darkblue relative">
      <div className="pb-16">
        {activeTab === 'home' && <TaskList />}
        {activeTab === 'add' && <NewTaskPage onBack={() => setActiveTab('home')} />}
        {activeTab === 'explore' && <ExplorePage />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'profile' && <ProfilePage />}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

// Prevent double rendering by avoiding nested AppProvider
const Index = () => {
  // Check if we're already inside an AppProvider context
  try {
    useAppContext();
    // If we get here, we're already inside an AppProvider
    return (
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    );
  } catch (e) {
    // If useAppContext throws, we need to provide the context
    return (
      <AppProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    );
  }
};

export default Index;
