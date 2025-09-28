# Google OAuth Testing Guide

## 🛠️ What We Fixed

### ❌ **Previous Issues:**
1. Popup opened to dashboard instead of closing
2. Node didn't get updated with authentication status
3. User had to manually navigate back to workflow
4. No visual indication of connection success
5. **Backend was redirecting to wrong frontend URL (port 5174 instead of 5173)**

### ✅ **Current Fixes:**
1. **Popup Management**: Popup now properly closes after OAuth success
2. **Node Updates**: Node gets updated with `isAuthenticated: true` and tokens
3. **User Experience**: User stays in workflow, no navigation disruption
4. **Visual Feedback**: Green "Connected" status shown in node
5. **Fixed Backend Configuration**: Updated `backend/.env` to use correct frontend URL

## 🧪 Testing Steps

### Prerequisites:
1. Backend server running on `http://localhost:8000`
2. Frontend server running on `http://localhost:5173` (default Vite port)
3. Google Cloud Console configured with test user email
4. **IMPORTANT**: Backend `.env` file updated with correct `FRONTEND_URL=http://localhost:5173`

### Test Procedure:

#### 1. Verify Configuration
Check `backend/.env` file contains:
```
FRONTEND_URL=http://localhost:5173
```

#### 2. Start the Servers
```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
cd Automation-Workflow--main
npm run dev
```

#### 3. Test Google Drive Node
1. Navigate to `http://localhost:5173/workflow/create`
2. Add a Google Drive node from the panel
3. Click "Connect with Google Drive" button
4. **Expected behavior:**
   - Popup opens with Google OAuth consent screen
   - User completes OAuth flow
   - Popup shows "Success!" message briefly
   - Popup closes automatically
   - Node shows green "Connected to Google Drive" status
   - User remains on workflow page

#### 4. Test Other Google Nodes
Repeat the same process for:
- Google Docs node
- Gmail node  
- Google Calendar node
- Google Sheets node (if available)

### 🔍 Debug Information

Check browser console for these messages:
```
Initiating Google googledrive OAuth: [auth_url]
Google googledrive OAuth message: [popup_message]
Google googledrive OAuth success: {accessToken: true, refreshToken: true}
Sending OAuth success message for googledrive: [token_info]
Closing OAuth popup window
```

### 🚨 Troubleshooting

#### Issue: "Access blocked: App not verified"
**Solution:** Add your email as test user in Google Cloud Console:
1. Go to Google Cloud Console
2. Navigate to APIs & Services > OAuth consent screen
3. Add your email to "Test users"

#### Issue: Popup still redirects to dashboard
**Check:**
1. Verify `backend/.env` has `FRONTEND_URL=http://localhost:5173`
2. Restart backend server after changing .env
3. Clear browser cache
4. Check browser console for redirect URLs

#### Issue: Node doesn't show connected
**Check:**
1. Browser console for OAuth messages
2. Node data in React DevTools
3. Backend logs for token exchange

## 🎯 Expected Flow

```
[User clicks Connect] 
    ↓
[Popup opens with Google OAuth]
    ↓  
[User authorizes app]
    ↓
[Google redirects to backend]
    ↓
[Backend exchanges code for tokens]
    ↓
[Backend redirects to frontend callback at localhost:5173]
    ↓
[Frontend sends tokens to parent window]
    ↓
[Popup closes automatically]
    ↓
[Node updates with connected status]
    ↓
[User continues with workflow]
```

## 📋 Test Checklist

- [ ] Backend `.env` has `FRONTEND_URL=http://localhost:5173`
- [ ] Backend server restarted after .env change
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173  
- [ ] Google Cloud Console configured
- [ ] Test user email added to Google project
- [ ] Popup opens correctly
- [ ] OAuth flow completes without errors
- [ ] Popup closes automatically after success
- [ ] Node shows "Connected" status
- [ ] User remains on workflow page
- [ ] No unexpected navigation to dashboard

## 🔧 Files Modified

### Backend:
- `backend/.env` - Fixed FRONTEND_URL to use port 5173
- `backend/routers/google_auth.py` - Uses settings.FRONTEND_URL for redirects
  
### Frontend:
- `src/hooks/useGoogleOAuth.ts` - Fixed node data updates
- `src/pages/OAuthCallback.tsx` - Improved popup handling
- `src/components/workflow/types/nodes/GoogleDriveNode.tsx` - Added connected status

---

**✅ Success Criteria:** 
Popup opens → User authenticates → **Popup redirects to localhost:5173** → Popup closes → Node shows connected → User continues workflow

**🔑 Key Fix:** 
The main issue was that `backend/.env` had `FRONTEND_URL=http://localhost:5174` but the frontend runs on port 5173. This caused OAuth callbacks to redirect to the wrong port, opening a new tab instead of returning to the popup. 