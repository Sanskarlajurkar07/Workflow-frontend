import React from 'react';
import { Trash2, Settings, Bell, Mail, MessageSquare } from 'lucide-react';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from '../../../../store/flowStore';

interface NotificationNodeProps {
  data: {
    params?: {
      nodeName?: string;
      showSettings?: boolean;
      operation?: string;
      phoneNumber?: string;
      message?: string;
      recipientEmail?: string;
      emailSubject?: string;
      emailBody?: string;
      sendAsHtml?: boolean;
      smtpServer?: string;
      smtpPort?: number;
      senderEmail?: string;
      senderPassword?: string;
      senderName?: string;
      connectionType?: string;
    };
  };
  id: string;
  selected?: boolean;
}

const NotificationNode: React.FC<NotificationNodeProps> = ({ data, id, selected }) => {
  // Get store functions
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Handle functions
  const handleDelete = () => {
    removeNode(id);
  };

  const toggleSettings = () => {
    updateNodeData(id, { showSettings: !data.params?.showSettings });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Notification</h3>
              <p className="text-xs text-rose-50/80">
                {data.params?.operation ? data.params.operation.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ') : 'Select type'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSettings}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-red-400/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Settings Panel */}
        {data.params?.showSettings && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Node Name</label>
              <input
                type="text"
                value={data.params?.nodeName || 'notifications_0'}
                onChange={(e) => updateNodeData(id, { nodeName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Operation Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Notification Type</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'sms-notification', label: 'SMS Notification', icon: MessageSquare },
              { value: 'email-notification', label: 'Email Notification', icon: Mail },
              { value: 'custom-smtp-email', label: 'Custom SMTP Email', icon: Mail }
            ].map((op) => (
              <button
                key={op.value}
                onClick={() => updateNodeData(id, { operation: op.value })}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  data.params?.operation === op.value
                    ? 'bg-rose-100 text-rose-700 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <op.icon className="w-4 h-4" />
                <span>{op.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Based on Operation */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
          {data.params?.operation === 'sms-notification' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="Enter phone number with country code"
                value={data.params?.phoneNumber || ''}
                onChange={(e) => updateNodeData(id, { phoneNumber: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              {!data.params?.phoneNumber && (
                <p className="text-xs text-red-500">Phone number field is required</p>
              )}
              <label className="block text-xs text-gray-500 mb-1">Message *</label>
              <textarea
                placeholder="Enter message"
                value={data.params?.message || ''}
                onChange={(e) => updateNodeData(id, { message: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              {!data.params?.message && (
                <p className="text-xs text-red-500">Message field is required</p>
              )}
            </div>
          )}

          {data.params?.operation === 'email-notification' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Recipient Email *</label>
              <input
                type="email"
                placeholder="Enter recipient email"
                value={data.params?.recipientEmail || ''}
                onChange={(e) => updateNodeData(id, { recipientEmail: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              {!data.params?.recipientEmail && (
                <p className="text-xs text-red-500">Recipient Email field is required</p>
              )}
              <label className="block text-xs text-gray-500 mb-1">Email Subject *</label>
              <input
                type="text"
                placeholder="Enter email subject"
                value={data.params?.emailSubject || ''}
                onChange={(e) => updateNodeData(id, { emailSubject: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              {!data.params?.emailSubject && (
                <p className="text-xs text-red-500">Email Subject field is required</p>
              )}
              <label className="block text-xs text-gray-500 mb-1">Email Body</label>
              <textarea
                placeholder="Enter email body"
                value={data.params?.emailBody || ''}
                onChange={(e) => updateNodeData(id, { emailBody: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={data.params?.sendAsHtml || false}
                  onChange={(e) => updateNodeData(id, { sendAsHtml: e.target.checked })}
                />
                <label className="text-xs text-gray-500">Send as HTML</label>
              </div>
            </div>
          )}

          {data.params?.operation === 'custom-smtp-email' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Recipient Email *</label>
              <input
                type="email"
                placeholder="Enter recipient email"
                value={data.params?.recipientEmail || ''}
                onChange={(e) => updateNodeData(id, { recipientEmail: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              {!data.params?.recipientEmail && (
                <p className="text-xs text-red-500">Recipient Email field is required</p>
              )}
              <label className="block text-xs text-gray-500 mb-1">Email Subject *</label>
              <input
                type="text"
                placeholder="Enter email subject"
                value={data.params?.emailSubject || ''}
                onChange={(e) => updateNodeData(id, { emailSubject: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              {!data.params?.emailSubject && (
                <p className="text-xs text-red-500">Email Subject field is required</p>
              )}
              <label className="block text-xs text-gray-500 mb-1">Email Body</label>
              <textarea
                placeholder="Enter email body"
                value={data.params?.emailBody || ''}
                onChange={(e) => updateNodeData(id, { emailBody: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={data.params?.sendAsHtml || false}
                  onChange={(e) => updateNodeData(id, { sendAsHtml: e.target.checked })}
                />
                <label className="text-xs text-gray-500">Send as HTML</label>
              </div>
              <label className="block text-xs text-gray-500 mb-1">SMTP Server *</label>
              <input
                type="text"
                placeholder="Enter SMTP server"
                value={data.params?.smtpServer || ''}
                onChange={(e) => updateNodeData(id, { smtpServer: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              <label className="block text-xs text-gray-500 mb-1">SMTP Server Port *</label>
              <input
                type="number"
                placeholder="Enter SMTP server port"
                value={data.params?.smtpPort || ''}
                onChange={(e) => updateNodeData(id, { smtpPort: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              <label className="block text-xs text-gray-500 mb-1">Sender Email *</label>
              <input
                type="email"
                placeholder="Enter sender email"
                value={data.params?.senderEmail || ''}
                onChange={(e) => updateNodeData(id, { senderEmail: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              <label className="block text-xs text-gray-500 mb-1">Sender Password *</label>
              <input
                type="password"
                placeholder="Enter sender password"
                value={data.params?.senderPassword || ''}
                onChange={(e) => updateNodeData(id, { senderPassword: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              <label className="block text-xs text-gray-500 mb-1">Sender Name</label>
              <input
                type="text"
                placeholder="Enter sender name"
                value={data.params?.senderName || ''}
                onChange={(e) => updateNodeData(id, { senderName: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
              <label className="block text-xs text-gray-500 mb-1">Connection Type</label>
              <select
                value={data.params?.connectionType || 'SSL'}
                onChange={(e) => updateNodeData(id, { connectionType: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              >
                <option value="SSL">SSL</option>
                <option value="TLS">TLS</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            data.params?.operation ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span>{data.params?.operation ? 'Type selected' : 'Select notification type'}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -ml-0.5 bg-rose-500 border-2 border-white rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -mr-0.5 bg-green-500 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default NotificationNode;