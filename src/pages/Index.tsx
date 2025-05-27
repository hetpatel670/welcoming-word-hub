
import { useState, useEffect } from "react";
import MainApp from "@/components/MainApp";
import LoginPage from "@/components/LoginPage";
import Onboarding from "@/components/Onboarding";
import UsernamePrompt from "@/components/UsernamePrompt";
import TaskReminderNotification from "@/components/TaskReminderNotification";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const { 
    isLoggedIn, 
    showOnboarding, 
    showUsernamePrompt, 
    setOnboardingComplete,
    setUsernamePromptComplete,
    completeTask
  } = useAppContext();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setOnboardingComplete(true)} />;
  }

  if (showUsernamePrompt) {
    return <UsernamePrompt onComplete={() => setUsernamePromptComplete(true)} />;
  }

  return (
    <>
      <MainApp />
      <TaskReminderNotification onMarkComplete={completeTask} />
    </>
  );
};

export default Index;
