import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MySQLLoginForm from '../components/database/MySQLLoginForm';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const MySQLLoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract state from URL if available (for OAuth integrations)
  const queryParams = new URLSearchParams(location.search);
  const state = queryParams.get('state');
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated && !state) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, state]);
  
  const handleSuccess = () => {
    toast.success('MySQL connection saved successfully');
    
    // If state is present, it means we came from an OAuth flow and should redirect back
    if (state) {
      try {
        const stateData = JSON.parse(atob(state));
        if (stateData.returnUrl) {
          window.location.href = stateData.returnUrl;
          return;
        }
      } catch (e) {
        console.error('Invalid state parameter:', e);
      }
    }
    
    // Default navigation if no state or invalid state
    navigate('/connections');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            className="mx-auto h-12 w-auto"
            src="/mysql-logo.svg"
            alt="MySQL Logo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MySQL Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your MySQL database credentials to connect
          </p>
        </div>
        
        <MySQLLoginForm onSuccess={handleSuccess} />
        
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/connections')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Cancel and return to connections
          </button>
        </div>
      </div>
    </div>
  );
};

export default MySQLLoginPage; 