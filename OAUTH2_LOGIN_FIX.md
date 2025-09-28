# 🔧 OAuth2 Login Fix - Stops Automatic Logout After 2 Seconds

## 🎯 Problem: OAuth2 Success → Immediate Logout

You're experiencing the classic "OAuth2 login succeeds but immediately logs out" issue. Here's what's happening:

1. **OAuth2 flow completes successfully** ✅
2. **Tokens/cookies are received** ✅
3. **Frontend makes authentication check** ❌
4. **Backend rejects the request** ❌
5. **Frontend detects failure and auto-logs out** ❌

## 🔍 Root Cause Analysis

Based on your codebase, the issue is a **authentication method conflict**:

- **OAuth2 flow** stores authentication in **HTTP-only cookies** (session-based)
- **Axios interceptor** tries to add **Bearer tokens** from localStorage
- **Backend** receives conflicting authentication methods
- **Validation fails** → **Auto-logout triggered**

## 🚀 Immediate Fix

### Step 1: First, run this debug script in browser console **immediately after OAuth2 login**:

```javascript
// 🚨 URGENT: Run this immediately after OAuth2 login!
console.log('🔍 OAuth2 Debug - Checking authentication state...');

// Check 1: What tokens do we have?
const tokens = {
  authToken: localStorage.getItem('authToken'),
  token: localStorage.getItem('token'),
  sessionAuth: sessionStorage.getItem('authToken'),
  accessToken: localStorage.getItem('access_token'),
  oauthToken: localStorage.getItem('oauth_token')
};

console.log('📋 Available tokens:', tokens);

// Check 2: What cookies exist?
console.log('🍪 Cookies:', document.cookie);

// Check 3: Test API immediately
const testAuth = async () => {
  console.log('🧪 Testing API authentication...');
  
  try {
    // Test with cookie-based auth (NO Bearer token)
    const response = await fetch('http://127.0.0.1:8000/api/auth/verify', {
      credentials: 'include' // This sends cookies
    });
    
    console.log('Auth Verify Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Cookie authentication working!');
      const data = await response.json();
      console.log('User data:', data);
    } else if (response.status === 401) {
      console.log('❌ Cookie authentication failed - this is why you\'re being logged out!');
      const text = await response.text();
      console.log('Response:', text);
    } else {
      console.log('⚠️ Unexpected status:', response.status);
    }
  } catch (error) {
    console.error('❌ API call failed:', error);
  }
};

testAuth();

// Check 4: Monitor for automatic logout
setTimeout(() => {
  if (window.location.href !== window.location.href) {
    console.log('🚨 LOGOUT DETECTED!');
  }
}, 3000);
```

### Step 2: Fix the Axios Configuration

The current axios configuration is causing conflicts. We need to update it:

```typescript
// Fix for src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Keep this for cookies
});

// Updated request interceptor - DON'T add Bearer token for OAuth2 users
api.interceptors.request.use(
  (config) => {
    // Check if user is using session-based authentication (OAuth2)
    const hasSession = document.cookie.includes('session');
    
    if (!hasSession) {
      // Only add Bearer token if no session cookie exists
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication failed:', error.response.data);
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/auth/callback')) {
        // Clear any stored tokens but don't clear cookies
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        
        // For OAuth users, try to refresh the session first
        if (document.cookie.includes('session')) {
          console.log('Attempting to refresh OAuth session...');
          // Give a brief moment for session refresh
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3: Update the Authentication Hook

The `useAuth` hook needs to handle OAuth2 sessions properly:

```typescript
// Fix for src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("Checking auth status...");
        
        // Check if we have a session cookie first (OAuth2 users)
        const hasSession = document.cookie.includes('session');
        
        if (hasSession) {
          console.log("Session cookie detected - checking OAuth2 authentication");
          // For OAuth2 users, verify session with backend
          const response = await axios.get('http://127.0.0.1:8000/api/auth/verify', {
            withCredentials: true,
            timeout: 5000
          });
          
          if (response.status === 200) {
            console.log("OAuth2 session authentication successful");
            setIsAuthenticated(true);
            return;
          }
        }
        
        // Fallback: check for token-based auth
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (token) {
          console.log("Token found - checking token authentication");
          const response = await axios.get('http://127.0.0.1:8000/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 5000
          });
          
          if (response.status === 200) {
            console.log("Token authentication successful");
            setIsAuthenticated(true);
            return;
          }
        }
        
        console.log("No valid authentication found");
        setIsAuthenticated(false);
      } catch (error) {
        console.log("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function for OAuth2 callback
  const login = useCallback(async (temporaryToken: string) => {
    try {
      setIsLoading(true);
      console.log("OAuth2 login - exchanging token for session...");
      
      // Exchange the temporary token for an HTTP-only cookie session
      const response = await axios.post(
        'http://127.0.0.1:8000/api/auth/session', 
        { token: temporaryToken },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (response.status === 200) {
        console.log("OAuth2 session established successfully");
        setIsAuthenticated(true);
        toast.success('Login successful!');
      } else {
        throw new Error('Session creation failed');
      }
    } catch (error) {
      console.error('OAuth2 login error:', error);
      toast.error('Login failed. Please try again.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout: clear session
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint to clear the HTTP-only cookie
      await axios.post('http://127.0.0.1:8000/api/auth/logout', {}, { 
        withCredentials: true 
      });
      
      // Clear any local tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setIsAuthenticated(false);
      toast.error('Error during logout');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isAuthenticated, isLoading, login, logout };
}
```

## 🔧 Backend Check

Make sure your backend is handling session verification correctly. Check if this endpoint exists:

```python
# Should exist in backend/routers/auth.py
@router.get("/verify")
async def verify_auth(current_user: User = Depends(get_current_user)):
    """Verify current authentication status"""
    return {
        "authenticated": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name
        }
    }
```

## ⚡ Quick Test After Fix

After applying the fixes, test in browser console:

```javascript
// Test OAuth2 authentication
fetch('http://127.0.0.1:8000/api/auth/verify', {
  credentials: 'include'
})
.then(r => {
  console.log('Auth verify status:', r.status);
  return r.json();
})
.then(d => console.log('User data:', d))
.catch(e => console.error('Auth test failed:', e));
```

## 🎯 Expected Results After Fix

1. **OAuth2 login completes** ✅
2. **Session cookie is set** ✅
3. **No Bearer tokens are added to requests** ✅
4. **Backend validates session correctly** ✅
5. **User stays logged in** ✅

## 🚨 Emergency Workaround

If you need immediate access, run this in console after OAuth2 login:

```javascript
// Disable automatic logout temporarily
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options = {}] = args;
  
  // For auth requests, ensure cookies are sent and no auth header
  if (url.includes('/api/')) {
    const newOptions = {
      ...options,
      credentials: 'include'
    };
    
    // Remove Authorization header for OAuth2 users
    if (newOptions.headers && newOptions.headers.Authorization) {
      delete newOptions.headers.Authorization;
    }
    
    return originalFetch(url, newOptions);
  }
  
  return originalFetch(...args);
};

console.log('🛠️ Temporary fix applied - OAuth2 should work now');
```

## ✅ Success Signs

After the fix, you should see:
- **No immediate logout after OAuth2 login**
- **Dashboard loads properly**
- **API requests work without errors**
- **Session persists between page refreshes**

The core issue is that OAuth2 uses cookies but your axios setup was adding conflicting Bearer tokens. The fix ensures the right authentication method is used for each user type! 🚀 