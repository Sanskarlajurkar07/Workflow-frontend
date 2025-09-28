import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Trash2, Mail, ChevronRight, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

const GOOGLE_CLIENT_ID = '168656444308-5049dq3j9b326q5lrf7828eaolv703t9.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'REDACTED_GOOGLE_CLIENT_SECRET';

interface GmailTriggerNodeData {
  params?: {
    nodeName?: string;
    action?: 'new-email' | 'email-reply';
    oauthToken?: string;
    refreshToken?: string;
    isAuthenticated?: boolean;
    emailAddress?: string;
    filter?: string;
    showSettings?: boolean;
  };
}

const GmailTriggerNode: React.FC<NodeProps<GmailTriggerNodeData>> = ({ id, data, selected }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleActionChange = (action: 'new-email' | 'email-reply') => {
    updateNodeData(id, { params: { ...data.params, action } });
    setCurrentStep(2);
  };

  const connectToGmail = async () => {
    setConnectingGmail(true);
    setError(null);
    
    try {
      // Initialize Google OAuth2 flow
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify';
      
      // Store state in localStorage to verify after redirect
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('googleOAuthState', state);
      
      // Construct OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `state=${state}&` +
        `prompt=consent`;
      
      // Open OAuth window
      window.location.href = authUrl;
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to Gmail');
      setConnectingGmail(false);
    }
  };

  // Function to handle OAuth callback
  const handleOAuthCallback = async (code: string) => {
    try {
      const response = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${window.location.origin}/auth/google/callback`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await response.json();
      
      updateNodeData(id, { 
        params: { 
          ...data.params, 
          oauthToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true
        } 
      });
      setCurrentStep(3);

    } catch (err: any) {
      setError(err.message || 'Failed to complete authentication');
    } finally {
      setConnectingGmail(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${
        selected ? 'ring-2 ring-red-500' : 'border border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Gmail Trigger</h3>
              <p className="text-xs text-red-50/80">{data.params?.nodeName || 'gmail_trigger_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {currentStep === 1 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Select an action</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleActionChange('new-email')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">New Email</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => handleActionChange('email-reply')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Email Reply</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gmail Authentication</span>
              {error && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
            <button
              onClick={connectToGmail}
              disabled={connectingGmail}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white ${
                connectingGmail ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'
              } transition-colors`}
            >
              {connectingGmail ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Connect with Gmail</span>
                </>
              )}
            </button>
          </div>
        )}

        {currentStep === 3 && data.params?.isAuthenticated && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={data.params?.emailAddress || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, emailAddress: e.target.value } })}
                placeholder="example@gmail.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Filter (Optional)</label>
              <input
                type="text"
                value={data.params?.filter || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, filter: e.target.value } })}
                placeholder="e.g., from:example@gmail.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-red-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-red-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default GmailTriggerNode;