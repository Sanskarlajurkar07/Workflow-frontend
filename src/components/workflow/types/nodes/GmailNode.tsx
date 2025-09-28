import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Trash2, Mail, Send, RefreshCw, LogIn, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';
import { useGoogleOAuth } from '../../../../hooks/useGoogleOAuth';

// Read Google OAuth credentials from environment
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

interface GmailNodeData {
  params?: {
    nodeName?: string;
    action?: 'create-draft' | 'send-email' | 'draft-reply' | 'send-reply';
    to?: string;
    cc?: string;
    bcc?: string;
    subject?: string;
    body?: string;
    isHtml?: boolean;
    attachments?: string[];
    threadId?: string;
    messageId?: string;
    oauthToken?: string;
    refreshToken?: string;
    isAuthenticated?: boolean;
    showSettings?: boolean;
  };
}

interface GmailNodeProps {
  id: string;
  data: GmailNodeData;
  selected?: boolean;
}

const GmailNode: React.FC<GmailNodeProps> = ({ id, data, selected }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Use the Google OAuth hook
  const { isLoading: connectingGmail, error, connectToGoogle } = useGoogleOAuth(id, updateNodeData);

  // Update step based on authentication status
  useEffect(() => {
    if (data.params?.action && !data.params?.isAuthenticated && currentStep === 1) {
      setCurrentStep(2);
    } else if (data.params?.isAuthenticated && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [data.params?.action, data.params?.isAuthenticated, currentStep]);

  const handleActionChange = (action: 'create-draft' | 'send-email' | 'draft-reply' | 'send-reply') => {
    updateNodeData(id, { params: { ...data.params, action } });
  };

  const handleConnect = async () => {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose'
    ];
    try {
      await connectToGoogle('gmail', scopes);
    } catch (err) {
      console.error('Failed to connect to Gmail:', err);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create-draft': return 'Create Email Draft';
      case 'send-email': return 'Send Email';
      case 'draft-reply': return 'Draft Reply';
      case 'send-reply': return 'Send Reply';
      default: return 'Select Action';
    }
  };

  const isReplyAction = ['draft-reply', 'send-reply'].includes(data.params?.action || '');
  const isComposeAction = ['create-draft', 'send-email'].includes(data.params?.action || '');

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden w-80 ${
      selected ? 'ring-2 ring-red-500' : 'border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Gmail</h3>
              <p className="text-xs text-red-50/80">{data.params?.nodeName || 'gmail_1'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {data.params?.isAuthenticated && (
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <Check className="w-4 h-4 text-green-300" />
              </div>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(id)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Copy Node ID"
            >
              <Send className="w-4 h-4" />
            </button>
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
        {/* Step 1: Action Selection */}
        {currentStep === 1 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Select Gmail Action</h4>
            <div className="space-y-2">
              {[
                { key: 'create-draft', label: 'Create Email Draft', icon: Mail },
                { key: 'send-email', label: 'Send Email', icon: Send },
                { key: 'draft-reply', label: 'Draft Reply', icon: RefreshCw },
                { key: 'send-reply', label: 'Send Reply', icon: Send }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleActionChange(key as any)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Authentication */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Gmail Authentication Required</h4>
              <p className="text-xs text-gray-500">Action: {getActionLabel(data.params?.action || '')}</p>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-600">{error}</span>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connectingGmail}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-white font-medium ${
                connectingGmail 
                  ? 'bg-red-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
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
                  <span>Connect Gmail Account</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 3 && data.params?.isAuthenticated && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Configure {getActionLabel(data.params?.action || '')}
              </h4>
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <Check className="w-3 h-3" />
                <span>Connected</span>
              </div>
            </div>

            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                multiple
                value={data.params?.to || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, to: e.target.value } })}
                placeholder="recipient@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
              />
            </div>

            {/* Subject Field (only for compose actions) */}
            {isComposeAction && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.params?.subject || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, subject: e.target.value } })}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                />
              </div>
            )}

            {/* Message ID Field (only for reply actions) */}
            {isReplyAction && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Message ID to reply to"
                  value={data.params?.messageId || ''}
                  onChange={(e) => updateNodeData(id, { params: { ...data.params, messageId: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                />
              </div>
            )}

            {/* Body Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                value={data.params?.body || ''}
                onChange={(e) => updateNodeData(id, { params: { ...data.params, body: e.target.value } })}
                placeholder="Enter your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm resize-none"
                rows={4}
              />
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                <span>Advanced Options</span>
              </button>
              
              {showAdvanced && (
                <div className="mt-3 space-y-3 pl-6 border-l-2 border-gray-100">
                  {/* CC Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
                    <input
                      type="email"
                      multiple
                      value={data.params?.cc || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, cc: e.target.value } })}
                      placeholder="cc@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                    />
                  </div>

                  {/* BCC Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BCC</label>
                    <input
                      type="email"
                      multiple
                      value={data.params?.bcc || ''}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, bcc: e.target.value } })}
                      placeholder="bcc@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                    />
                  </div>

                  {/* HTML Toggle */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="html-toggle"
                      checked={data.params?.isHtml || false}
                      onChange={(e) => updateNodeData(id, { params: { ...data.params, isHtml: e.target.checked } })}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="html-toggle" className="text-sm font-medium text-gray-700">
                      Send as HTML
                    </label>
                  </div>
                </div>
              )}
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

export default GmailNode;