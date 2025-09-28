import React, { createContext, useContext, lazy, Suspense } from 'react';
import { Navigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded components with named exports
const LandingPage = lazy(() => 
  import('./components/landing/LandingPage').then(module => ({ default: module.LandingPage }))
);
const Login = lazy(() => 
  import('./components/auth/Login').then(module => ({ default: module.Login }))
);
const Signup = lazy(() => 
  import('./components/auth/Signup').then(module => ({ default: module.Signup }))
);
const Dashboard = lazy(() => 
  import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard }))
);
const WorkflowBuilder = lazy(() => 
  import('./components/workflow/WorkflowBuilder').then(module => ({ default: module.WorkflowBuilder }))
);
const AuthCallback = lazy(() => 
  import('./components/auth/AuthCallback').then(module => ({ default: module.AuthCallback }))
);
const DatabasePage = lazy(() => 
  import('./components/dashboard/Database').then(module => ({ default: module.default }))
);
// New components for the sections
const WorkflowsPage = lazy(() => 
  import('./components/pages/WorkflowsPage').then(module => ({ default: module.WorkflowsPage }))
);
const TemplatesPage = lazy(() => 
  import('./components/pages/TemplatesPage').then(module => ({ default: module.TemplatesPage }))
);
const DocumentsPage = lazy(() => 
  import('./components/pages/DocumentsPage').then(module => ({ default: module.DocumentsPage }))
);
const AIToolsPage = lazy(() => 
  import('./components/pages/AIToolsPage').then(module => ({ default: module.AIToolsPage }))
);

// Create Auth Context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Auth Context Hook
export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component with navigation logic
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#17252A] via-[#2B7A78] to-[#17252A] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[#3AAFA9]/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#3AAFA9] border-t-transparent rounded-full animate-spin" />
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#17252A] via-[#2B7A78] to-[#17252A] flex items-center justify-center">
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[#3AAFA9]/20">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-[#3AAFA9] border-t-transparent rounded-full animate-spin" />
        <p className="text-white">Loading...</p>
      </div>
    </div>
  </div>
);

function AppRoutes() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login onLogin={(token: string) => login(token)} />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* OAuth Callback Routes - Use only one callback component */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/oauth/callback" element={<AuthCallback />} />
            <Route path="/oauth/callback/google" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/workflows" element={<ProtectedRoute><WorkflowsPage /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/ai-tools" element={<ProtectedRoute><AIToolsPage /></ProtectedRoute>} />
            <Route path="/workflow-builder" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />
            <Route path="/workflow/edit/:id" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />
            <Route path="/workflow/create" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />
            <Route path="/database" element={<ProtectedRoute><DatabasePage /></ProtectedRoute>} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
        <AppRoutes />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#3AAFA9',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;