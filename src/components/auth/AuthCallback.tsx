import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppAuth } from '../../App';
import toast from 'react-hot-toast';

export const AuthCallback: React.FC = () => {
  const { login, isAuthenticated } = useAppAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [loginCompleted, setLoginCompleted] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the token from URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        if (errorParam) {
          console.error('Auth callback error:', errorParam);
          setError(decodeURIComponent(errorParam));
          toast.error(`Authentication failed: ${decodeURIComponent(errorParam)}`);
          setIsProcessing(false);
          return;
        }

        if (!token) {
          console.error('No token found in URL');
          setError('No authentication token received');
          toast.error('Authentication failed: No token received');
          setIsProcessing(false);
          return;
        }

        console.log('Auth token received, logging in...');
        
        // Call the login function to set up the session
        await login(token);
        
        // Mark login as completed so the effect can handle the redirect
        setLoginCompleted(true);
      } catch (err) {
        console.error('Error processing auth callback:', err);
        setError('Failed to process authentication');
        toast.error('Authentication failed. Please try again.');
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [login, location.search, navigate]);
  
  // Handle redirect after successful authentication
  useEffect(() => {
    if (loginCompleted && isAuthenticated) {
      const params = new URLSearchParams(location.search);
      const redirectPath = localStorage.getItem('preLoginPath') || '/dashboard';
      localStorage.removeItem('preLoginPath'); // Clean up
      
      // Check if the user is new
      const isNewUser = params.get('new_user') === 'true';
      if (isNewUser) {
        toast.success('Welcome! Your account has been created');
      }
      
      console.log(`Redirecting to ${redirectPath}`);
      navigate(redirectPath);
    }
  }, [loginCompleted, isAuthenticated, location.search, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#17252A] via-[#2B7A78] to-[#17252A] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[#3AAFA9]/20 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Failed</h2>
            <p className="text-[#DEF2F1] mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-[#3AAFA9] rounded-lg text-white font-medium hover:bg-[#2B7A78]"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#17252A] via-[#2B7A78] to-[#17252A] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[#3AAFA9]/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#3AAFA9] border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg">Completing authentication...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
