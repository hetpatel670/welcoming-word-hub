import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label'; // Though not explicitly in web LoginPage, useful for form structure
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../hooks/useToast';
import { tw } from '../lib/utils';
import { Mail, Lock, User } from 'lucide-react-native'; // Using User as a placeholder for Google icon

// Assuming NavigationProps for routing after login/signup
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../App'; // Adjust path as needed
// type Props = NativeStackScreenProps<RootStackParamList, 'Login'>; // If you have navigation props

const LoginPage: React.FC = (/*{ navigation }: Props*/) => {
  const { login, user, isLoggedIn } = useAppContext(); // Assuming login is from context, adjust if it's from useAuth directly
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, login would be from useAuth directly
  // const { login: authLogin, loading: authLoading } = useAuth(); // from '../hooks/useAuth'

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: 'Login Error', description: 'Please enter both email and password.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      // Replace with actual login logic from useAuth or AppContext
      // const result = await login(email, password); // This is a placeholder
      console.log('Attempting login with:', email, password);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = { success: true, user: { id: '123', email }}; // Mock result

      if (result.success) {
        toast({ title: 'Login Successful', description: `Welcome back, ${result.user?.email}!` });
        // navigation.navigate('Home'); // Navigate to home screen or dashboard
      } else {
        // toast({ title: 'Login Failed', description: result.error || 'Invalid credentials.', variant: 'destructive' });
        toast({ title: 'Login Failed', description: 'Invalid credentials (mock error).', variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Login Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    toast({ title: 'Google Sign-In', description: 'Google Sign-In not implemented yet.' });
    // Implement Google Sign-In logic here
    // e.g., using @react-native-google-signin/google-signin or Expo's GoogleSignIn
    console.log('Google Sign-In button pressed');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate
    setIsLoading(false);
  };
  
  // Redirect if already logged in (optional, could be handled by navigator)
  // useEffect(() => {
  //   if (isLoggedIn && user) {
  //     navigation.replace('Home'); // Or your main app screen
  //   }
  // }, [isLoggedIn, user, navigation]);

  return (
    <View style={tw`flex-1 justify-center items-center p-6 bg-white`}>
      <View style={tw`w-full max-w-sm`}>
        <View style={tw`mb-8 items-center`}>
          {/* Replace with actual logo if available */}
          {/* <Image source={require('../assets/logo.png')} style={tw`h-12 w-auto mb-2`} /> */}
          <Text style={tw`text-3xl font-bold text-slate-900`}>Welcome Back</Text>
          <Text style={tw`text-slate-500 mt-1`}>Sign in to continue your journey</Text>
        </View>

        <View style={tw`mb-4`}>
          <Label style={tw`mb-1`} htmlFor="email">Email</Label>
          <Input
            id="email" // For web accessibility, less relevant for RN but good practice
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            inputClassName="pl-10" // Make space for icon
            // Icon can be added by wrapping Input and an Icon in a View
          />
          {/* Example of adding an icon (absolute positioned or in a row) */}
          <Mail style={tw`absolute top-9 left-2.5 h-5 w-5 text-slate-400`} size={20} />
        </View>

        <View style={tw`mb-6`}>
          <Label style={tw`mb-1`} htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            inputClassName="pl-10"
          />
          <Lock style={tw`absolute top-9 left-2.5 h-5 w-5 text-slate-400`} size={20} />
        </View>

        <Button onPress={handleLogin} disabled={isLoading} style={tw`w-full mb-3`} size="lg">
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <Button
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          variant="outline"
          style={tw`w-full flex-row items-center justify-center`}
          size="lg"
        >
          <User size={20} style={tw`mr-2 text-slate-600`} /> {/* Placeholder for Google Icon */}
          <Text style={tw`text-slate-700 font-medium`}>Sign in with Google</Text>
        </Button>

        <View style={tw`mt-6 flex-row justify-center`}>
          <Text style={tw`text-slate-500`}>Don't have an account? </Text>
          <Text
            style={tw`font-semibold text-slate-700 hover:text-slate-900`}
            onPress={() => {
              toast({ title: 'Navigation', description: 'Sign up page not implemented yet.'});
              // navigation.navigate('SignUp'); // Assuming a SignUp screen exists
            }}
          >
            Sign Up
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoginPage;
