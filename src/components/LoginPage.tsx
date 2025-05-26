import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle, register } = useAppContext();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        await register(email, password);
        toast({
          title: "Success",
          description: "Your account has been created successfully!",
        });
      } else {
        await login(email, password);
        toast({
          title: "Success",
          description: "You have been logged in successfully!",
        });
      }
    } catch (error: any) {
      console.error(isRegistering ? 'Registration failed:' : 'Login failed:', error);
      toast({
        title: isRegistering ? "Registration failed" : "Login failed",
        description: error.message || "Please check your credentials and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Success",
        description: "You have been logged in with Google successfully!",
      });
    } catch (error: any) {
      console.error('Google login failed:', error);
      toast({
        title: "Google login failed",
        description: error.message || "An error occurred during Google login",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center login-gradient p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-app-lightblue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="flex flex-col">
              <span className="h-2 w-12 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-2 w-12 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-2 w-8 bg-pink-400 rounded-full"></span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Habit Streak Now</h1>
          <p className="text-gray-300 text-sm sm:text-base">Build better habits, one task at a time</p>
        </div>
        
        <div className="flex w-full mb-6 bg-app-lightblue rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-3 text-center font-medium rounded-md transition-all ${
              !isRegistering 
                ? 'bg-app-teal text-black shadow-sm' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-3 text-center font-medium rounded-md transition-all ${
              isRegistering 
                ? 'bg-app-teal text-black shadow-sm' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
              className="h-12 rounded-xl bg-app-lightblue text-white placeholder:text-gray-400 border-none shadow-sm focus:ring-2 focus:ring-app-teal"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
              className="h-12 rounded-xl bg-app-lightblue text-white placeholder:text-gray-400 border-none shadow-sm focus:ring-2 focus:ring-app-teal"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-12 bg-app-teal hover:bg-app-teal/90 text-black text-base font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRegistering ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isRegistering ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center justify-center w-full">
          <div className="border-t border-gray-300/30 flex-grow"></div>
          <span className="px-4 text-gray-300 text-sm">Or continue with</span>
          <div className="border-t border-gray-300/30 flex-grow"></div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 flex items-center justify-center gap-3 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
