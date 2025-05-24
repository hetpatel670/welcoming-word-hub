import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

// Import the actual components
import ErrorBoundary from './src/components/ErrorBoundary';
import { AppProvider, useAppContext } from './src/contexts/AppContext'; // Named import, also import useAppContext

// Import Screens and Navigators
import LoginPage from './src/screens/LoginPage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AppTabs from './src/navigation/AppTabs'; // Import AppTabs

// Define the type for the root stack navigator
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  AppTabs: undefined; // Represents the entire Bottom Tab Navigator
  // Home: undefined; // Home is now part of AppTabs
  // Add other top-level stack screens if any
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

// Main App component with conditional navigation
const AppNavigator: React.FC = () => {
  const { isLoggedIn, showOnboarding } = useAppContext(); // Get login and onboarding state

  // It's possible AppContext is not fully loaded yet.
  // Handle loading state if `showOnboarding` or `isLoggedIn` can be initially undefined.
  // For this iteration, we assume they have default values from AppContext.

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          // User needs to see onboarding
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : isLoggedIn ? (
          // User is logged in and has completed onboarding
          // Show the AppTabs navigator which contains Home and other main screens
          <Stack.Screen name="AppTabs" component={AppTabs} />
        ) : (
          // User is not logged in and has completed onboarding
          <Stack.Screen name="Login" component={LoginPage} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          {/* 
            TooltipProvider: React Native doesn't have a direct equivalent. Omitted.
          */}
          <AppNavigator /> {/* Use the AppNavigator component */}
          <StatusBar style="auto" />
          {/*
            Toaster/Sonner: Use 'react-native-toast-message'. Omitted for now.
          */}
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
