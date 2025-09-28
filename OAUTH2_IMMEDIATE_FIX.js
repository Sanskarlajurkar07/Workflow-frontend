// 🚨 IMMEDIATE OAUTH2 FIX - Run this in browser console after OAuth2 login
console.log('🔧 Applying immediate OAuth2 fix...');

// Step 1: Prevent automatic logout by overriding axios interceptors
if (window.axios) {
  console.log('🛠️ Clearing existing axios interceptors...');
  window.axios.interceptors.request.handlers = [];
  window.axios.interceptors.response.handlers = [];
  console.log('✅ Axios interceptors cleared');
}

// Step 2: Override fetch to ensure proper authentication
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  console.log('🌐 Fetch override:', url);
  
  if (url.includes('/api/auth/') || url.includes('/api/knowledge-base/')) {
    // Always use credentials for auth and knowledge base endpoints
    options.credentials = 'include';
    
    // Remove any Authorization header that might conflict
    if (options.headers && options.headers.Authorization) {
      console.log('🗑️ Removing conflicting Authorization header');
      delete options.headers.Authorization;
    }
    
    // Ensure headers object exists
    if (!options.headers) {
      options.headers = {};
    }
    
    // Set proper content type
    if (!options.headers['Content-Type'] && (options.method === 'POST' || options.method === 'PUT')) {
      options.headers['Content-Type'] = 'application/json';
    }
    
    console.log('🍪 Using session-based auth for:', url);
  }
  
  return originalFetch(url, options);
};

// Step 3: Test authentication immediately
const testAuth = async () => {
  console.log('🧪 Testing authentication...');
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/verify', {
      credentials: 'include'
    });
    
    console.log('Auth test status:', response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Authentication working!', data);
      return true;
    } else if (response.status === 401) {
      console.log('❌ Authentication failed');
      const text = await response.text();
      console.log('Error:', text);
      return false;
    }
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
};

// Step 4: Override any automatic logout mechanisms
const preventLogout = () => {
  console.log('🛡️ Preventing automatic logout...');
  
  // Override window.location.href setter temporarily
  let originalLocationHref = window.location.href;
  Object.defineProperty(window.location, 'href', {
    set: function(url) {
      if (url.includes('/login') && !url.includes('oauth')) {
        console.log('🚫 Blocked automatic redirect to login:', url);
        return; // Block the redirect
      }
      // Allow other redirects
      window.location.assign(url);
    },
    get: function() {
      return originalLocationHref;
    }
  });
  
  // Block any forced redirects for 10 seconds
  setTimeout(() => {
    console.log('🔓 Re-enabling normal navigation');
    Object.defineProperty(window.location, 'href', {
      set: function(url) {
        window.location.assign(url);
      },
      get: function() {
        return window.location.toString();
      }
    });
  }, 10000);
};

// Step 5: Apply fixes and test
(async () => {
  preventLogout();
  
  // Wait a moment for any ongoing requests to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const authWorking = await testAuth();
  
  if (authWorking) {
    console.log('🎉 OAuth2 fix successful! You should now stay logged in.');
    
    // Test knowledge base access
    try {
      const kbResponse = await fetch('http://127.0.0.1:8000/api/knowledge-base/', {
        credentials: 'include'
      });
      
      if (kbResponse.status === 200) {
        const kbData = await kbResponse.json();
        console.log('✅ Knowledge base access working!', kbData.length, 'knowledge bases found');
      } else {
        console.log('⚠️ Knowledge base access failed with status:', kbResponse.status);
      }
    } catch (error) {
      console.log('⚠️ Knowledge base test failed:', error);
    }
    
  } else {
    console.log('❌ OAuth2 fix failed. The session might not be established properly.');
    console.log('💡 Try logging in again or check the backend logs.');
  }
})();

console.log('🔧 OAuth2 fix applied! Check the results above.'); 