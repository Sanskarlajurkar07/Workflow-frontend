import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Github, Mail, Lock, ArrowRight, Brain, Chrome } from 'lucide-react';
import { useAppAuth } from '../../App';
import toast from 'react-hot-toast';

export const Login = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://workflow-backend-2-1ki9.onrender.com/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 
          username: email,
          password: password 
        }),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      if (data.access_token) {
        // Call the onLogin function with the token to set up the session cookie
        onLogin(data.access_token);
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error('Login failed: Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    try {
      // Store the current URL to redirect back after login
      localStorage.setItem('preLoginPath', window.location.pathname);
      
      // Use absolute URL to prevent any path resolution issues
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://workflow-backend-2-1ki9.onrender.com';
      window.location.href = `${apiBaseUrl}/api/auth/${provider}/login`;
    } catch (err) {
      toast.error(`Failed to initiate ${provider} login`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#17252A] via-[#2B7A78] to-[#17252A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[#3AAFA9]/20">
          <div className="flex items-center justify-center mb-8">
            <Brain className="w-10 h-10 text-[#3AAFA9]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#3AAFA9] to-[#DEF2F1] bg-clip-text text-transparent ml-2">
              FlowMind AI
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome back</h2>

          {/* OAuth2 Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5" />
              Sign in with Google
            </button>

            <button
              onClick={() => handleOAuthLogin('github')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
              disabled={isLoading}
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3AAFA9]/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#17252A] text-[#DEF2F1]">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#DEF2F1] mb-2" htmlFor="email-input">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#DEF2F1]/70" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-[#3AAFA9]/30 rounded-lg py-2 pl-10 pr-4 text-black placeholder-[#DEF2F1]/50 focus:outline-none focus:ring-2 focus:ring-[#3AAFA9] focus:border-transparent"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DEF2F1] mb-2" htmlFor="password-input">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#DEF2F1]/70" />
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-[#3AAFA9]/30 rounded-lg py-2 pl-10 pr-4 text-black placeholder-[#DEF2F1]/50 focus:outline-none focus:ring-2 focus:ring-[#3AAFA9] focus:border-transparent"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#3AAFA9]/30 text-[#3AAFA9] focus:ring-[#3AAFA9]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#DEF2F1]">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-[#3AAFA9] hover:text-[#DEF2F1]">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
              Sign in
              <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#DEF2F1]/70">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#3AAFA9] hover:text-[#DEF2F1] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};