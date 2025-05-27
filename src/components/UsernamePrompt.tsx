import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface UsernamePromptProps {
  onComplete: () => void;
}

const UsernamePrompt: React.FC<UsernamePromptProps> = ({ onComplete }) => {
  const { user, updateUsername } = useAppContext();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue",
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: "Username too short",
        description: "Username must be at least 3 characters long",
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: "Invalid username",
        description: "Username can only contain letters, numbers, and underscores",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUsername(username.trim());
      toast({
        title: "Username set successfully",
        description: "Welcome to DoTogether!"
      });
      onComplete();
    } catch (error: any) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set username. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-app-darkblue p-6 rounded-xl w-11/12 max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Welcome to DoTogether!</h2>
        <p className="text-gray-300 mb-6">Choose a unique username to get started</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-app-lightblue border-gray-700 text-white"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-400 mt-1">
              3+ characters (letters, numbers, underscores only)
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              className="w-full bg-app-teal hover:bg-app-teal/80 text-black font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UsernamePrompt;
