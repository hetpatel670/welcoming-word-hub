import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import TaskList from './TaskList';
import NewTaskPage from './NewTaskPage';
import ReportsPage from './ReportsPage';
import Navigation from './Navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { analyticsService } from '@/services/analyticsService';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showNewTask, setShowNewTask] = useState(false);
  const { user, logout } = useAppContext();
  const { toast } = useToast();

  // Track page views when activeTab changes
  useEffect(() => {
    const pageNames: { [key: string]: string } = {
      'home': 'Task List',
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'explore': 'Explore'
    };
    
    const pageName = pageNames[activeTab] || 'Unknown';
    analyticsService.trackPageView(pageName);
  }, [activeTab]);

  // Track new task page view
  useEffect(() => {
    if (showNewTask) {
      analyticsService.trackPageView('New Task');
    }
  }, [showNewTask]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
      });
    }
  };

  const renderContent = () => {
    if (showNewTask) {
      return <NewTaskPage onBack={() => setShowNewTask(false)} />;
    }

    switch (activeTab) {
      case 'home':
        return <TaskList />;
      case 'add':
        setShowNewTask(true);
        return <NewTaskPage onBack={() => setShowNewTask(false)} />;
      case 'explore':
        return (
          <div className="p-4 sm:p-6 flex flex-col items-center justify-center h-full">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Explore</h2>
            <p className="text-gray-400 text-center">
              Discover new habits and connect with other users. This feature is coming soon!
            </p>
          </div>
        );
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return (
          <div className="p-4 sm:p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Profile</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut size={18} />
              </Button>
            </div>
            
            <div className="bg-app-lightblue rounded-xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-app-teal rounded-full flex items-center justify-center mr-4">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{user?.username || 'User'}</h3>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-app-teal">{user?.points || 0}</p>
                  <p className="text-sm text-gray-400">Total Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-app-teal">{user?.level || 1}</p>
                  <p className="text-sm text-gray-400">Level</p>
                </div>
              </div>
            </div>
            
            <div className="bg-app-lightblue rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Settings</h4>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-gray-300">
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300">
                  Privacy
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300">
                  Help & Support
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:text-red-300"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-app-darkblue text-white">
      <div className="pb-16"> {/* Add padding bottom for navigation */}
        {renderContent()}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default MainApp;