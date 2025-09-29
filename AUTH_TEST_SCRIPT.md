# 🔍 Authentication Test Script

## Quick Browser Console Test

Open your browser developer tools (`F12`) and run this script in the **Console** tab to test authentication:

```javascript
// 🧪 Authentication & Upload Functionality Test Script
console.log('🔍 Testing Smart Database Authentication & Upload Features');
console.log('=' * 60);

// Test 1: Check for authentication tokens
console.log('\n1️⃣ Checking authentication tokens...');
const authToken = localStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('authToken');
console.log('Auth token found:', !!authToken);
if (authToken) {
  console.log('Token preview:', authToken.substring(0, 20) + '...');
} else {
  console.log('❌ No authentication token found - you need to log in first');
}

// Test 2: Test knowledge base API connection
console.log('\n2️⃣ Testing knowledge base API...');
fetch('https://workflow-backend-2-1ki9.onrender.com/api/knowledge-base/', {
  headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
  credentials: 'include'
})
.then(response => {
  console.log('Knowledge base API status:', response.status);
  if (response.status === 200) {
    console.log('✅ Authentication working! API accessible');
    return response.json();
  } else if (response.status === 401) {
    console.log('❌ Authentication failed - please log in');
    return null;
  } else {
    console.log('⚠️ Unexpected status:', response.status);
    return null;
  }
})
.then(data => {
  if (data) {
    console.log('Knowledge bases found:', data.length);
    if (data.length > 0) {
      console.log('First KB:', data[0].name, '(ID:', data[0].id + ')');
    }
  }
})
.catch(error => {
  console.error('❌ API connection failed:', error);
  console.log('💡 Make sure the backend server is running on http://127.0.0.1:8000');
});

// Test 3: Check if Smart Database component is loaded
console.log('\n3️⃣ Checking Smart Database UI...');
setTimeout(() => {
  const addDocButton = document.querySelector('button[contains="Add Document"]') || 
                      document.querySelector('[data-testid="add-document"]') ||
                      Array.from(document.querySelectorAll('button')).find(btn => 
                        btn.textContent?.includes('Add Document')
                      );
  
  if (addDocButton) {
    console.log('✅ "Add Document" button found in UI');
    console.log('Button location:', addDocButton.getBoundingClientRect());
  } else {
    console.log('❌ "Add Document" button not found');
    console.log('💡 Make sure you\'re on the Smart Database page and have a knowledge base selected');
  }
}, 1000);

// Test 4: Provide troubleshooting info
console.log('\n4️⃣ Troubleshooting info:');
console.log('Current URL:', window.location.href);
console.log('Backend URL configured:', 'https://workflow-backend-2-1ki9.onrender.com');
console.log('Local storage keys:', Object.keys(localStorage));
console.log('Session storage keys:', Object.keys(sessionStorage));

console.log('\n🎯 Next steps:');
console.log('1. If no auth token: Log in to your account');
console.log('2. If API fails: Check if backend server is running');
console.log('3. If UI missing: Navigate to Smart Database section');
console.log('4. If button missing: Select a knowledge base first');

console.log('\n🚀 Once working, you can use these upload features:');
console.log('📁 File Upload - PDF, Word, CSV, TXT, Markdown');
console.log('🌐 URL Scraping - Single pages or recursive websites');
console.log('☁️ Integrations - Google Drive, Notion, Slack, GitHub');
console.log('📂 Folders - Organize your documents');
```

## Expected Results

### ✅ **Working Authentication:**
```
✅ Auth token found: true
✅ Knowledge base API status: 200
✅ Authentication working! API accessible
✅ Knowledge bases found: 2
✅ "Add Document" button found in UI
```

### ❌ **Authentication Issues:**
```
❌ No authentication token found - you need to log in first
❌ Knowledge base API status: 401
❌ Authentication failed - please log in
```

### 🔧 **Backend Issues:**
```
❌ API connection failed: Failed to fetch
💡 Make sure the backend server is running on http://127.0.0.1:8000
```

## Quick Fixes

### If Authentication Fails:
1. **Log out and log back in**
2. **Clear browser storage**: `F12` → `Application` → `Storage` → `Clear site data`
3. **Check if you have the correct credentials**

### If Backend Connection Fails:
1. **Make sure backend is running**: Backend is deployed on Render
2. **Test backend directly**: Open `https://workflow-backend-2-1ki9.onrender.com/docs` in browser
3. **Check firewall/antivirus** isn't blocking the connection

### If UI Elements Missing:
1. **Navigate to Smart Database section** in your dashboard
2. **Select a knowledge base** from the list
3. **Look for the blue "Add Document" button** in the top-right header
4. **Refresh the page** if components don't load

## 🎉 Success!

Once the test script shows all green checkmarks, your VectorShift-style upload functionality is ready to use! 🚀 