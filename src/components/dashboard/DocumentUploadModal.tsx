import React, { useState } from 'react';
import {
  Upload, Link, Globe, FolderPlus, X, File,
  Cloud, Database, Settings, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeBaseId: string;
  onDocumentAdded: () => void;
}

interface LoadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loaderType: 'file' | 'url' | 'integration' | 'folder';
  knowledgeBaseId: string;
  onDocumentAdded: () => void;
}

const LoadDocumentModal: React.FC<LoadDocumentModalProps> = ({
  isOpen,
  onClose,
  loaderType,
  knowledgeBaseId,
  onDocumentAdded
}) => {
  const [formData, setFormData] = useState({
    url: '',
    recursive: false,
    rescrapeFrequency: 'Never',
    documentName: '',
    selectedFiles: [] as File[],
    integrationType: 'google_drive'
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const submitData = new FormData();
      
      if (loaderType === 'file' && formData.selectedFiles.length > 0) {
        submitData.append('source_type', 'file');
        submitData.append('file', formData.selectedFiles[0]);
        submitData.append('document_name', formData.documentName || formData.selectedFiles[0].name);
        submitData.append('source_path', formData.selectedFiles[0].name);
      } else if (loaderType === 'url') {
        const sourceType = formData.recursive ? 'recursive_url' : 'url';
        submitData.append('source_type', sourceType);
        submitData.append('source_path', formData.url);
        submitData.append('document_name', formData.documentName || `URL: ${formData.url}`);
        submitData.append('metadata', JSON.stringify({
          recursive: formData.recursive,
          rescrape_frequency: formData.rescrapeFrequency
        }));
      } else if (loaderType === 'integration') {
        submitData.append('source_type', 'integration');
        submitData.append('source_path', formData.integrationType);
        submitData.append('document_name', formData.documentName || `Integration: ${formData.integrationType}`);
      }

      const response = await fetch(`/api/knowledge-base/${knowledgeBaseId}/add-documents`, {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        toast.success('Document added successfully!');
        onDocumentAdded();
        onClose();
      } else {
        const error = await response.text();
        toast.error(`Failed to add document: ${error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to add document');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setFormData(prev => ({
        ...prev,
        selectedFiles: Array.from(files)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Load Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Loader Type Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loader Type
            </label>
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white"
                value={loaderType.toUpperCase()}
                disabled
              >
                <option value="FILE">File</option>
                <option value="URL">URL</option>
                <option value="INTEGRATION">Integration</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* File Upload */}
          {loaderType === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and Drop</p>
                <p className="text-gray-500 text-sm mb-4">or Click to Upload</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.csv,.md"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  Browse Files
                </label>
              </div>
              {formData.selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected files:</p>
                  {formData.selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center mt-1 text-sm text-gray-700">
                      <File className="h-4 w-4 mr-2" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* URL Input */}
          {loaderType === 'url' && (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recursive"
                  checked={formData.recursive}
                  onChange={(e) => setFormData(prev => ({ ...prev, recursive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="recursive" className="text-sm text-gray-700">
                  Recursive
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://vectorshift.ai/"
                    className="w-full p-2 pr-10 border border-gray-300 rounded-lg"
                  />
                  <button className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600">
                    <Link className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rescrape Frequency
                </label>
                <div className="relative">
                  <select
                    value={formData.rescrapeFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, rescrapeFrequency: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white"
                  >
                    <option value="Never">Never</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </>
          )}

          {/* Integration */}
          {loaderType === 'integration' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integration Type
              </label>
              <div className="relative">
                <select
                  value={formData.integrationType}
                  onChange={(e) => setFormData(prev => ({ ...prev, integrationType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white"
                >
                  <option value="google_drive">Google Drive</option>
                  <option value="notion">Notion</option>
                  <option value="slack">Slack</option>
                  <option value="confluence">Confluence</option>
                  <option value="github">GitHub</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Name (Optional)
            </label>
            <input
              type="text"
              value={formData.documentName}
              onChange={(e) => setFormData(prev => ({ ...prev, documentName: e.target.value }))}
              placeholder="Enter custom name..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={uploading || (loaderType === 'file' && formData.selectedFiles.length === 0) || (loaderType === 'url' && !formData.url)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Adding...' : 'Add Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  knowledgeBaseId,
  onDocumentAdded
}) => {
  const [selectedLoader, setSelectedLoader] = useState<'file' | 'url' | 'integration' | 'folder' | null>(null);

  const loaderOptions = [
    {
      id: 'file' as const,
      title: 'Choose/Upload Files',
      description: 'Upload PDF, Word, CSV, and other document types',
      icon: Upload,
      color: 'blue'
    },
    {
      id: 'integration' as const,
      title: 'Choose/Add Integration',
      description: 'Connect to Google Drive, Notion, Slack, and more',
      icon: Cloud,
      color: 'green'
    },
    {
      id: 'url' as const,
      title: 'Scrape URL',
      description: 'Extract content from web pages',
      icon: Globe,
      color: 'purple'
    },
    {
      id: 'folder' as const,
      title: 'Create Folder',
      description: 'Organize your documents into folders',
      icon: FolderPlus,
      color: 'orange'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {selectedLoader ? (
        <LoadDocumentModal
          isOpen={!!selectedLoader}
          onClose={() => setSelectedLoader(null)}
          loaderType={selectedLoader}
          knowledgeBaseId={knowledgeBaseId}
          onDocumentAdded={onDocumentAdded}
        />
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Documents to Knowledge Base</h2>
                <p className="text-gray-600 mt-1">Knowledge bases allow you to create LLM workflows using your own documents.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {loaderOptions.map((option) => {
                const IconComponent = option.icon;
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
                  green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
                  purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700',
                  orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700'
                };

                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedLoader(option.id)}
                    className={`p-6 border-2 rounded-lg transition-colors text-left ${colorClasses[option.color]}`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className="h-8 w-8 mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Tip:</strong> You can configure advanced settings like chunk size, embedding models, 
                and processing options in the Configure panel after adding documents.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentUploadModal; 