import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { useAppContext } from '../contexts/AppContext'; // Adjust path as needed
import { useToast } from '../hooks/useToast'; // Adjust path as needed
import { tw } from '../lib/utils';

// Assuming this component might be shown as a modal or overlay.
// For now, it's a simple View. If it needs to be a modal, wrap with <Modal>.

interface UsernamePromptProps {
  isVisible: boolean; // To control visibility if used as a modal
  onClose: () => void; // Callback to close the prompt
  // onSubmit: (username: string) => Promise<void>; // Callback when username is submitted
}

// Placeholder for a function that would typically be in useProfiles or useAuth
const updateUserProfile = async (userId: string, username: string) => {
  console.log(`Updating profile for user ${userId} with username ${username}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  // In a real app, this would interact with Firebase or your backend
  // For example:
  // const userRef = doc(db, 'profiles', userId);
  // await updateDoc(userRef, { username });
  return { success: true, profile: { userId, username } }; // Mock success
};


const UsernamePrompt: React.FC<UsernamePromptProps> = ({ isVisible, onClose /*, onSubmit */}) => {
  const { user, profile, setProfile } = useAppContext(); // Assuming setProfile updates context
  const { toast } = useToast();
  const [username, setUsername] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({ title: 'Validation Error', description: 'Username cannot be empty.', variant: 'destructive' });
      return;
    }
    if (!user) {
        toast({ title: 'Error', description: 'No user logged in.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call a function from a hook like useProfiles.updateProfile
      const result = await updateUserProfile(user.id, username.trim()); // Placeholder call

      if (result.success) {
        toast({ title: 'Success', description: 'Username updated successfully!' });
        if(setProfile) { // Check if setProfile exists in context
            // @ts-ignore
             setProfile(result.profile); // Update profile in context
        }
        onClose(); // Close the prompt
      } else {
        toast({ title: 'Error', description: 'Failed to update username. Please try again.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Note: Animations with Framer Motion (stagger, delay) are not directly portable.
  // For React Native, use Animated API or react-native-reanimated.
  // This version is static.

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
        animationType="fade" // Or "slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
            <View style={tw`bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-md`}>
                {/* Heading */}
                <Text style={tw`text-2xl font-bold text-slate-900 mb-2 text-center`}>
                    One Last Step!
                </Text>
                <Text style={tw`text-slate-600 mb-6 text-center`}>
                    Please choose a username for your profile.
                </Text>

                {/* Form */}
                <View style={tw`mb-4`}>
                    <Label htmlFor="username" style={tw`mb-1 text-slate-700`}>Username</Label>
                    <Input
                        id="username"
                        placeholder="e.g., CoolUser123"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        disabled={isLoading}
                    />
                </View>

                <Button onPress={handleSubmit} disabled={isLoading} style={tw`w-full`}>
                    {isLoading ? <ActivityIndicator color={tw.color('white')} /> : 'Save Username'}
                </Button>

                <Button onPress={onClose} variant="ghost" style={tw`w-full mt-2`}>
                    Skip for now
                </Button>
            </View>
        </View>
    </Modal>
  );
};

export default UsernamePrompt;
