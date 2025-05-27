import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register } = useAppContext();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center login-gradient p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-app-lightblue rounded-lg flex items-center justify-center mx-auto mb-6">
            <div className="flex flex-col">
              <span className="h-2 w-12 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-2 w-12 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-2 w-8 bg-pink-400 rounded-full"></span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DoTogether</h1>
        </div>
        
        <div className="flex w-full mb-6">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 text-center font-medium ${!isRegistering ? 'text-app-teal border-b-2 border-app-teal' : 'text-white border-b-2 border-transparent'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2 text-center font-medium ${isRegistering ? 'text-app-teal border-b-2 border-app-teal' : 'text-white border-b-2 border-transparent'}`}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 rounded-lg bg-app-lightblue text-white border-none shadow-lg"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 rounded-lg bg-app-lightblue text-white border-none shadow-lg"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-14 bg-app-teal hover:bg-app-teal/90 text-black text-lg font-bold rounded-lg shadow-lg"
          >
            {isRegistering ? 'Create Account' : 'Log in'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Start building your habits today and track your progress!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
