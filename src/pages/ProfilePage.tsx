import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Award, LogOut, User, Settings, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user, badges, currentStreak, logout } = useAppContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-gray-400 text-sm sm:text-base">Manage your account and view your achievements</p>
      </motion.div>

      {user && (
        <motion.div
          className="bg-app-lightblue rounded-xl p-4 sm:p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-app-darkblue rounded-full flex items-center justify-center mr-4">
              <User size={32} className="text-app-teal" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{user.email}</h2>
              <p className="text-gray-400 text-sm sm:text-base">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-app-darkblue/50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Award size={16} className="text-app-purple mr-2" />
                <span className="text-gray-300 text-sm">Points</span>
              </div>
              <p className="text-white font-bold text-lg">{user.points}</p>
            </div>
            <div className="bg-app-darkblue/50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Calendar size={16} className="text-app-teal mr-2" />
                <span className="text-gray-300 text-sm">Current Streak</span>
              </div>
              <p className="text-white font-bold text-lg">{currentStreak} days</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        className="bg-app-lightblue rounded-xl p-4 sm:p-6 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Award size={18} className="text-app-purple mr-2" />
          Badges
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              className={`p-3 rounded-lg flex flex-col items-center justify-center text-center ${
                badge.earned ? 'bg-app-darkblue/70' : 'bg-app-darkblue/30'
              }`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <h4 className={`text-sm font-medium ${badge.earned ? 'text-white' : 'text-gray-400'}`}>
                {badge.name}
              </h4>
              <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button
          variant="outline"
          className="w-full flex items-center justify-center text-red-400 border-red-400/30 hover:bg-red-400/10"
          onClick={handleLogout}
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;