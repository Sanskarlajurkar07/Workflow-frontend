import React, { useState, useEffect } from 'react';
import { 
  Database as DatabaseIcon, BookOpen, RefreshCw, 
  Plus, FileText, Trash2, Globe, 
  Calendar, Settings, Check, 
  Save, Upload, RotateCw, Link as LinkIcon, 
  AlertTriangle, HardDrive, FolderInput, Briefcase, Database,
  Search, Clock, Eye, X, Loader, CheckCircle, XCircle
} from 'lucide-react';
import smartDatabaseService, { SmartDatabase, SmartDatabaseCreate, Document, SearchResponse } from '../../lib/knowledgeBaseService';
import toast from 'react-hot-toast';

// Renamed from Database to DatabasePage to avoid conflict with the lucide Database icon
const DatabasePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDB, setSelectedDB] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [smartDatabases, setSmartDatabases] = useState<SmartDatabase[]>([]);
  const [currentDB, setCurrentDB] = useState<SmartDatabase | null>(null);
  const [newDbSettings, setNewDbSettings] = useState<SmartDatabaseCreate>({
    name: '',
    description: '',
    chunk_size: 400,
    chunk_overlap: 0,
    embedding_model: 'text-embedding-3-small',
    advanced_doc_analysis: true
  });

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Task monitoring state
  const [activeTasks, setActiveTasks] = useState<any>({});
  const [taskPolling, setTaskPolling] = useState(false);

  // Document addition state
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<'url' | 'integration' | 'recursive_url'>('url');

  // Fetch smart databases on component mount
  useEffect(() => {
    fetchSmartDatabases();
  }, []);

  // Fetch smart database details when selected DB changes
  useEffect(() => {
    if (selectedDB) {
      fetchSmartDatabaseDetails(selectedDB);
    } else {
      // If selectedDB becomes null (e.g., all DBs deleted or selection cleared),
      // ensure currentDB is also nulled out to prevent showing stale data.
      setCurrentDB(null);
      // No need for setLoading(false) here as fetchSmartDatabaseDetails handles its own loading state
    }
  }, [selectedDB]);

  // Fetch all smart databases and handle selection logic
  const fetchSmartDatabases = async () => {
    setLoading(true); // Indicate loading of the list
    try {
      const freshListOfDatabases = await smartDatabaseService.getSmartDatabases();
      setSmartDatabases(freshListOfDatabases);

      let nextSelectedDB = selectedDB;

      if (selectedDB) {
        // Check if the currently selected DB ID still exists in the fresh list
        const currentSelectedExists = freshListOfDatabases.some(db => db.id === selectedDB);
        if (!currentSelectedExists) {
          nextSelectedDB = null; // Mark for re-evaluation or clearing
        }
      }

      if (nextSelectedDB === null && freshListOfDatabases.length > 0) {
        // If no valid selection (or selection was invalidated), pick the first from the new list
        nextSelectedDB = freshListOfDatabases[0].id;
      } else if (freshListOfDatabases.length === 0) {
        // If the list is empty, there's nothing to select
        nextSelectedDB = null;
      }
      
      // Only update selectedDB if it actually changes, or if it needs to be set initially
      // This prevents unnecessary re-runs of the useEffect that depends on selectedDB if the ID remains the same.
      if (selectedDB !== nextSelectedDB) {
        setSelectedDB(nextSelectedDB);
      } else if (nextSelectedDB === null && currentDB !== null) {
        // If selection remains null (e.g. list is empty), but currentDB had data, clear currentDB
        setCurrentDB(null);
      } else if (nextSelectedDB !== null && currentDB === null) {
        // If a DB is selected but no currentDB is loaded (e.g. initial load with a valid pre-selected ID)
        // The useEffect for selectedDB will trigger fetchSmartDatabaseDetails
      }


    } catch (error) {
      console.error('Error fetching smart databases:', error);
      toast.error('Failed to load smart databases');
      // Potentially set smartDatabases to [] and selectedDB to null here
      setSmartDatabases([]);
      setSelectedDB(null);
      setCurrentDB(null);
    } finally {
      setLoading(false); // Done loading the list (or failed)
    }
  };

  // Fetch details for a specific smart database
  const fetchSmartDatabaseDetails = async (dbId: string) => {
    // setLoading(true); // This loading state is more for the main content area
    // Let's use a different state for loading just the details, or manage `loading` more carefully.
    // For now, the main `loading` state will cover this. If it causes flicker, we can refine.
    try {
      const data = await smartDatabaseService.getSmartDatabase(dbId);
      setCurrentDB(data);
    } catch (error) {
      console.error(`Error fetching smart database ${dbId}:`, error);
      toast.error('Failed to load smart database details. It might have been deleted.');
      // If fetching details for a selectedDB fails (e.g. 404),
      // we should ideally clear this selection or re-evaluate.
      // One option is to call fetchSmartDatabases() again to refresh the list and selection.
      // Or, if selectedDB is the one that failed, set it to null.
      if (selectedDB === dbId) { // ensure we are clearing the right one
          setSelectedDB(null); // This will trigger a re-evaluation by the useEffect
          setCurrentDB(null);
      }
    } finally {
      // setLoading(false); // Handled by fetchSmartDatabases's finally block
    }
  };

  // Handler for creating a new smart database
  const handleSaveSmartDatabase = async () => {
    try {
      setLoading(true);
      const newDB = await smartDatabaseService.createSmartDatabase(newDbSettings);
      setShowCreateModal(false);
      
      // Update the local state
      setSmartDatabases(prev => [...prev, newDB]);
      setSelectedDB(newDB.id);
      
      toast.success('Smart database created successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error creating smart database:', error);
      toast.error('Failed to create smart database');
      setLoading(false);
    }
  };

  // Handler for file uploads
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDB || !event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    try {
      setLoading(true);
      const documentName = file.name;
      await smartDatabaseService.uploadFile(selectedDB, file, documentName);
      
      // Refresh DB details to show new document
      await fetchSmartDatabaseDetails(selectedDB);
      
      toast.success(`File ${file.name} uploaded successfully`);
      setLoading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      setLoading(false);
    }
  };

  // Handler for adding document
  const handleAddDocument = async (docType: 'url' | 'integration' | 'recursive_url', path: string, name: string) => {
    if (!selectedDB) {
      return;
    }
    
    try {
      setLoading(true);
      await smartDatabaseService.addDocument(selectedDB, {
        name,
        source_type: docType,
        source_path: path
      });
      
      // Refresh DB details to show new document
      await fetchSmartDatabaseDetails(selectedDB);
      
      toast.success(`Document ${name} added successfully`);
      setLoading(false);
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
      setLoading(false);
    }
  };

  // Handler for deleting a document
  const handleDeleteDocument = async (docId: string) => {
    if (!selectedDB) {
      return;
    }
    
    try {
      setLoading(true);
      await smartDatabaseService.deleteDocument(selectedDB, docId);
      
      // Refresh DB details to show new document list
      await fetchSmartDatabaseDetails(selectedDB);
      
      toast.success('Document deleted successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
      setLoading(false);
    }
  };

  // Handler for syncing a smart database
  const handleSyncSmartDatabase = async () => {
    if (!selectedDB) {
      return;
    }
    
    try {
      setLoading(true);
      await smartDatabaseService.syncSmartDatabase(selectedDB);
      
      // Refresh DB details
      await fetchSmartDatabaseDetails(selectedDB);
      
      toast.success('Smart database synced successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error syncing smart database:', error);
      toast.error('Failed to sync smart database');
      setLoading(false);
    }
  };

  // Handler for updating smart database settings
  const handleUpdateDBSettings = async () => {
    if (!selectedDB || !currentDB) {
      return;
    }
    
    try {
      setLoading(true);
      const updateData: SmartDatabaseCreate = {
        name: currentDB.name,
        description: currentDB.description,
        chunk_size: currentDB.chunk_size,
        chunk_overlap: currentDB.chunk_overlap,
        embedding_model: currentDB.embedding_model,
        advanced_doc_analysis: currentDB.advanced_doc_analysis
      };
      
      await smartDatabaseService.updateSmartDatabase(selectedDB, updateData);
      
      // Refresh DB details
      await fetchSmartDatabaseDetails(selectedDB);
      
      toast.success('Smart database settings updated successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error updating smart database settings:', error);
      toast.error('Failed to update smart database settings');
      setLoading(false);
    }
  };
  
  // File upload input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Search functionality
  const handleSearch = async () => {
    if (!selectedDB || !searchQuery.trim()) {
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await smartDatabaseService.searchSmartDatabase(selectedDB, searchQuery, 5);
      setSearchResults(results);
      setActiveTab('search'); // Switch to search tab to show results
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  // Add URL/Integration document
  const handleAddUrlDocument = async () => {
    if (!selectedDB || !newDocUrl.trim() || !newDocName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      await smartDatabaseService.addDocument(selectedDB, {
        name: newDocName,
        source_type: newDocType,
        source_path: newDocUrl,
        metadata: { source_url: newDocUrl }
      });
      
      // Refresh DB details to show new document
      await fetchSmartDatabaseDetails(selectedDB);
      
      // Reset form and close modal
      setNewDocUrl('');
      setNewDocName('');
      setShowAddDocModal(false);
      
      // Start task polling
      startTaskPolling();
      
      toast.success(`Document ${newDocName} added successfully`);
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
    } finally {
      setLoading(false);
    }
  };

  // Task monitoring
  const fetchActiveTasks = async () => {
    if (!selectedDB) return;
    
    try {
      const response = await smartDatabaseService.getActiveTasks(selectedDB);
      setActiveTasks(response.active_tasks || {});
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const startTaskPolling = () => {
    if (taskPolling) return;
    setTaskPolling(true);
    
    const interval = setInterval(async () => {
      await fetchActiveTasks();
      
      // Also refresh DB details to update document statuses
      if (selectedDB) {
        await fetchSmartDatabaseDetails(selectedDB);
      }
    }, 3000); // Poll every 3 seconds
    
    // Stop polling after 2 minutes or when no active tasks
    setTimeout(() => {
      clearInterval(interval);
      setTaskPolling(false);
    }, 120000);
  };

  // Start polling when there are processing documents
  useEffect(() => {
    if (currentDB?.documents?.some(doc => doc.status === 'processing' || doc.status === 'pending')) {
      startTaskPolling();
    }
  }, [currentDB]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 border-b relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <DatabaseIcon className="mr-3 h-8 w-8 text-blue-100" />
                Smart Database
              </h1>
              <p className="text-blue-100 mt-2 max-w-2xl">
                Create and manage AI-powered vector databases to store, index, and search your documents using semantic similarity
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-50 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">New Database</span>
            </button>
          </div>

          {/* Quick Stats */}
          {!loading && smartDatabases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="text-sm font-medium text-blue-100 mb-1">Total Smart Databases</h3>
                <p className="text-2xl font-bold text-white">{smartDatabases.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="text-sm font-medium text-blue-100 mb-1">Total Documents</h3>
                <p className="text-2xl font-bold text-white">
                  {smartDatabases.reduce((acc, db) => acc + (db.documents?.length || 0), 0)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="text-sm font-medium text-blue-100 mb-1">Active Databases</h3>
                <p className="text-2xl font-bold text-white">
                  {smartDatabases.filter(db => db.status === 'active').length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r bg-white overflow-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold text-gray-700">Smart Databases</h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Create new database"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {loading && smartDatabases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-sm text-gray-500">Loading databases...</p>
            </div>
          ) : smartDatabases.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-blue-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">No databases yet</h3>
              <p className="text-gray-500 text-sm mb-4">Create your first smart database to start organizing your content</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create Database
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {smartDatabases.map((db) => (
                <button
                  key={db.id}
                  onClick={() => setSelectedDB(db.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedDB === db.id 
                      ? 'bg-blue-50 border-blue-100 shadow-sm' 
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md mr-3 ${
                      selectedDB === db.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Database className={`h-4 w-4 ${selectedDB === db.id ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${selectedDB === db.id ? 'text-blue-700' : 'text-gray-700'}`}>
                        {db.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 truncate">{db.documents?.length || 0} docs</span>
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                          db.status === 'active' ? 'bg-green-100 text-green-700' : 
                          db.status === 'configuring' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {db.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Help Section */}
          <div className="mt-auto border-t p-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Smart Database Tips</h4>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                  <span>Embed documents for semantic search</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                  <span>Connect databases to workflow nodes</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                  <span>Upload PDFs, DOCs, TXTs and more</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Tabs - Enhanced */}
          <div className="bg-white border-b px-6 flex">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'search' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4 mr-2 inline" />
              Search
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Documents
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
            <button 
              onClick={() => setActiveTab('monitoring')}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'monitoring' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Monitoring
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading && !currentDB ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : !currentDB ? (
              <div className="text-center py-12 text-gray-500">
                Please select or create a smart database.
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">{currentDB.name}</h2>
                      <p className="text-gray-600">
                        {currentDB.description}
                      </p>
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-500">Documents</h3>
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-semibold">{currentDB.documents?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {currentDB.documents?.length ? `${currentDB.documents.length} documents added` : 'No documents added yet'}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-semibold">
                          {new Date(currentDB.updated_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(currentDB.updated_at).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-500">Status</h3>
                          <Settings className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className={`text-2xl font-semibold ${
                          currentDB.status === 'active' ? 'text-green-600' : 
                          currentDB.status === 'configuring' ? 'text-yellow-600' : 
                          'text-gray-600'
                        }`}>
                          {currentDB.status.charAt(0).toUpperCase() + currentDB.status.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {currentDB.status === 'configuring' ? 'Add documents to complete setup' : 
                           currentDB.status === 'active' ? 'Smart database is ready' : 
                           'Check settings'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <button 
                          onClick={triggerFileUpload} 
                          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <Upload className="h-6 w-6 text-blue-600 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Upload Files</span>
                        </button>
                        <button 
                          onClick={() => setShowAddDocModal(true)}
                          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <Globe className="h-6 w-6 text-blue-600 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Add URLs</span>
                        </button>
                        <button 
                          onClick={() => setShowAddDocModal(true)}
                          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <LinkIcon className="h-6 w-6 text-blue-600 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Connect Integrations</span>
                        </button>
                        <button 
                          onClick={handleSyncSmartDatabase}
                          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <RefreshCw className="h-6 w-6 text-blue-600 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Sync Data</span>
                        </button>
                      </div>
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.txt,.doc,.docx,.csv,.json"
                    />

                    {/* Configuration Overview */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Configuration</h3>
                      <div className="bg-white p-5 rounded-xl border">
                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <p className="text-xs text-gray-500">Chunk Size</p>
                            <p className="text-sm font-medium">{currentDB.chunk_size} tokens</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Chunk Overlap</p>
                            <p className="text-sm font-medium">{currentDB.chunk_overlap} tokens</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Embedding Model</p>
                            <p className="text-sm font-medium">{currentDB.embedding_model}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Advanced Document Analysis</p>
                            <p className="text-sm font-medium flex items-center">
                              {currentDB.advanced_doc_analysis ? (
                                <>
                                  <Check className="h-4 w-4 text-green-500 mr-1" />
                                  Enabled
                                </>
                              ) : (
                                'Disabled'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'search' && (
                  <div>
                    {/* Search Interface */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Knowledge Base</h2>
                      
                      {/* Check if database has processed documents */}
                      {currentDB.documents?.filter(doc => doc.status === 'completed').length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-yellow-800 mb-2">No processed documents</h3>
                          <p className="text-yellow-700 mb-4">
                            You need to upload and process documents before you can search. 
                            {currentDB.documents?.length > 0 ? ' Some documents are still processing.' : ' Get started by uploading your first document.'}
                          </p>
                          <button 
                            onClick={() => setActiveTab('documents')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                          >
                            {currentDB.documents?.length > 0 ? 'View Documents' : 'Add Documents'}
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Search Input */}
                          <div className="bg-white border rounded-lg p-4 mb-6">
                            <div className="flex space-x-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                  placeholder="Ask a question or search for information..."
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <button
                                onClick={handleSearch}
                                disabled={!searchQuery.trim() || searchLoading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                              >
                                {searchLoading ? (
                                  <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                  <>
                                    <Search className="w-5 h-5 mr-2" />
                                    Search
                                  </>
                                )}
                              </button>
                            </div>
                            
                            {/* Search Stats */}
                            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                              <div>
                                {currentDB.documents?.filter(doc => doc.status === 'completed').length} documents ready for search
                              </div>
                              <div>
                                Powered by {currentDB.embedding_model}
                              </div>
                            </div>
                          </div>

                          {/* Search Results */}
                          {searchResults && (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-800">
                                  Search Results for "{searchResults.query}"
                                </h3>
                                <span className="text-sm text-gray-500">
                                  {searchResults.total_results} results found
                                </span>
                              </div>

                              {searchResults.results.length > 0 ? (
                                <div className="space-y-4">
                                  {searchResults.results.map((result, index) => (
                                    <div key={index} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center">
                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-gray-900">{result.source}</h4>
                                            <p className="text-sm text-gray-500">
                                              Score: {(result.score * 100).toFixed(1)}% • 
                                              {result.metadata.chunk_length} characters
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <button 
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="View source document"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="text-gray-700 leading-relaxed">
                                        {result.text}
                                      </div>
                                      
                                      {result.metadata.created_at && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                          <p className="text-xs text-gray-500">
                                            From: {result.metadata.original_filename || result.source} • 
                                            Added: {new Date(result.metadata.created_at).toLocaleDateString()}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                  <h3 className="text-lg font-medium text-gray-800 mb-2">No results found</h3>
                                  <p className="text-gray-600">
                                    Try adjusting your search query or using different keywords.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Search Tips */}
                          {!searchResults && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                              <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Search Tips
                              </h3>
                              <ul className="text-sm text-blue-700 space-y-2">
                                <li>• Ask natural language questions (e.g., "What is machine learning?")</li>
                                <li>• Use specific keywords related to your documents</li>
                                <li>• Search results are ranked by semantic similarity</li>
                                <li>• Try different phrasings if you don't find what you're looking for</li>
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
                      <div className="flex space-x-2">
                        <button 
                          onClick={triggerFileUpload}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </button>
                        <button 
                          onClick={() => setShowAddDocModal(true)}
                          className="px-3 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Document
                        </button>
                      </div>
                    </div>

                    {/* Document Sources Tabs */}
                    <div className="bg-white border-b mb-4">
                      <div className="flex">
                        <button className="px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600">
                          All Documents
                        </button>
                        <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                          Files
                        </button>
                        <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                          URLs
                        </button>
                        <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                          Integrations
                        </button>
                      </div>
                    </div>

                    {/* Document List or Empty State */}
                    {currentDB?.documents?.length ? (
                      <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Chunks
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Added
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentDB.documents.map((doc) => (
                              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {doc.source_type === 'file' && <FileText className="h-5 w-5 text-blue-500 mr-3" />}
                                    {doc.source_type === 'url' && <Globe className="h-5 w-5 text-blue-500 mr-3" />}
                                    {doc.source_type === 'integration' && <LinkIcon className="h-5 w-5 text-blue-500 mr-3" />}
                                    {doc.source_type === 'recursive_url' && <Globe className="h-5 w-5 text-blue-500 mr-3" />}
                                    <div className="text-sm font-medium text-gray-900">
                                      {doc.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 capitalize">
                                    {doc.source_type}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                                    doc.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    doc.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {doc.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {doc.chunks || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="flex justify-end space-x-2">
                                    <button 
                                      className="text-blue-600 hover:text-blue-900 p-1"
                                      title="View details"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteDocument(doc.id)}
                                      className="text-red-600 hover:text-red-900 p-1"
                                      title="Delete document"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <div className="flex justify-center mb-6">
                          <div className="bg-blue-50 p-5 rounded-full">
                            <FileText className="h-12 w-12 text-blue-500" />
                          </div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 mb-3">No documents in this database</h3>
                        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                          Add files, URLs, or connect integrations to populate your {currentDB?.name} smart database for semantic search and AI operations.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                          <button 
                            onClick={triggerFileUpload}
                            className="px-5 py-3 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Files
                          </button>
                          <button 
                            onClick={() => setShowAddDocModal(true)}
                            className="px-5 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm"
                          >
                            <Globe className="h-5 w-5 mr-2" />
                            Add URL
                          </button>
                          <button 
                            onClick={() => setShowAddDocModal(true)}
                            className="px-5 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm"
                          >
                            <LinkIcon className="h-5 w-5 mr-2" />
                            Connect Integration
                          </button>
                        </div>
                        <div className="mt-8 bg-gray-50 rounded-lg p-4 max-w-lg mx-auto">
                          <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                            Supported File Types
                          </h4>
                          <p className="text-xs text-gray-600">
                            PDF, DOCX, TXT, CSV, JSON, HTML, MD and other text-based files are supported. 
                            For best results, ensure your files are text-searchable.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.txt,.doc,.docx,.csv,.json"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create DB Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Create Smart Database</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input 
                  type="text" 
                  value={newDbSettings.name}
                  onChange={(e) => setNewDbSettings({...newDbSettings, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Product Documentation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  rows={3}
                  value={newDbSettings.description}
                  onChange={(e) => setNewDbSettings({...newDbSettings, description: e.target.value || ''})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Purpose of this smart database"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chunk Size (tokens)
                </label>
                <input 
                  type="number" 
                  value={newDbSettings.chunk_size}
                  onChange={(e) => setNewDbSettings({...newDbSettings, chunk_size: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chunk Overlap (tokens)
                </label>
                <input 
                  type="number" 
                  value={newDbSettings.chunk_overlap}
                  onChange={(e) => setNewDbSettings({...newDbSettings, chunk_overlap: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Embedding Model
                </label>
                <select 
                  value={newDbSettings.embedding_model}
                  onChange={(e) => setNewDbSettings({...newDbSettings, embedding_model: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="text-embedding-3-small">text-embedding-3-small</option>
                  <option value="embed-multilingual-v3.0">embed-multilingual-v3.0</option>
                  <option value="text-embedding-3-large">text-embedding-3-large</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="advanced-modal"
                  checked={newDbSettings.advanced_doc_analysis}
                  onChange={(e) => setNewDbSettings({...newDbSettings, advanced_doc_analysis: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="advanced-modal" className="ml-2 block text-sm text-gray-700">
                  Enable Advanced Document Analysis
                </label>
              </div>
            </div>
            
            <div className="p-5 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSmartDatabase}
                className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : 'Create Smart Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Add Document</h2>
              <button 
                onClick={() => setShowAddDocModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setNewDocType('url')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      newDocType === 'url' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Globe className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">URL</div>
                  </button>
                  <button
                    onClick={() => setNewDocType('recursive_url')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      newDocType === 'recursive_url' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Globe className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Website</div>
                  </button>
                  <button
                    onClick={() => setNewDocType('integration')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      newDocType === 'integration' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <LinkIcon className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Integration</div>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input 
                  type="text" 
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Company Documentation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newDocType === 'url' ? 'URL' : 
                   newDocType === 'recursive_url' ? 'Website URL' : 
                   'Integration Path'}
                </label>
                <input 
                  type="text" 
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    newDocType === 'url' ? 'https://example.com/document.pdf' : 
                    newDocType === 'recursive_url' ? 'https://example.com' : 
                    'integration://source'
                  }
                />
              </div>

              {newDocType === 'recursive_url' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Website Crawling</h4>
                  <p className="text-sm text-blue-700">
                    This will crawl the website starting from the provided URL and extract text content from multiple pages.
                  </p>
                </div>
              )}

              {newDocType === 'integration' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Integration Source</h4>
                  <p className="text-sm text-yellow-700">
                    Connect to external platforms like Google Drive, Notion, or other document repositories.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowAddDocModal(false);
                  setNewDocUrl('');
                  setNewDocName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddUrlDocument}
                className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                disabled={!newDocUrl.trim() || !newDocName.trim() || loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Adding...
                  </div>
                ) : 'Add Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabasePage; 