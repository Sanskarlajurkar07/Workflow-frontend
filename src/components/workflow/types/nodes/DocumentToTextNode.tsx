import React, { useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Trash2, FileText, Lock, Unlock, FileType, FileSearch, ChevronsUpDown, List, Move, Highlighter, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFlowStore } from '../../../../store/flowStore';

interface DocumentToTextNodeProps {
  id: string;
  data: {
    params?: {
      nodeName?: string;
      extractionMode?: 'full' | 'summary' | 'first_page';
      includeMetadata?: boolean;
      preserveFormatting?: boolean;
      maxLength?: number;
      showSettings?: boolean;
      locked?: boolean;
      highlightedText?: Array<{ start: number, end: number, text: string }>;
      testResponse?: {
        status?: number;
        content?: any;
        success?: boolean;
        execution_time_ms?: number;
      };
      responseFormat?: 'preview' | 'raw';
    };
  };
  selected?: boolean;
}

const DocumentToTextNode: React.FC<DocumentToTextNodeProps> = ({ id, data, selected }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'preview' | 'response'>('settings');
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const responseTextRef = useRef<HTMLPreElement>(null);
  
  const removeNode = useFlowStore((state) => state.removeNode);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Handle text highlighting in the response
  const handleTextSelection = useCallback(() => {
    if (!isHighlighting || !responseTextRef.current) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString() && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preElement = responseTextRef.current;
      
      if (preElement.contains(range.startContainer) && preElement.contains(range.endContainer)) {
        // Get text content of the pre element
        const text = preElement.textContent || '';
        
        // Calculate start and end positions
        const startNode = range.startContainer;
        const endNode = range.endContainer;
        
        let startPos = range.startOffset;
        let currentNode = startNode;
        
        // Traverse DOM to find the absolute start position
        const walker = document.createTreeWalker(preElement, NodeFilter.SHOW_TEXT);
        while (walker.nextNode() && walker.currentNode !== startNode) {
          startPos += walker.currentNode.textContent?.length || 0;
        }
        
        // Calculate end position
        let endPos = range.endOffset;
        if (startNode !== endNode) {
          currentNode = startNode;
          walker.currentNode = startNode;
          
          while (walker.nextNode() && walker.currentNode !== endNode) {
            endPos += walker.currentNode.textContent?.length || 0;
          }
        }
        
        endPos += startPos;
        
        // Add the highlighted text to the node data
        const highlightedText = data.params?.highlightedText || [];
        const highlightedContent = text.substring(startPos, endPos);
        
        updateNodeData(id, {
          params: {
            ...data.params,
            highlightedText: [...highlightedText, {
              start: startPos,
              end: endPos,
              text: highlightedContent
            }]
          }
        });
        
        // Clear selection
        selection.removeAllRanges();
      }
    }
  }, [isHighlighting, id, data.params, updateNodeData, responseTextRef]);
  
  // Toggle node lock state
  const toggleLock = () => {
    updateNodeData(id, {
      params: {
        ...data.params,
        locked: !data.params?.locked
      }
    });
  };

  // Format highlighted text in preview
  const renderHighlightedText = (text: string, highlights: Array<{ start: number, end: number, text: string }> = []) => {
    if (!highlights.length) return text;
    
    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    
    // Build result with highlight spans
    let result = [];
    let lastIdx = 0;
    
    for (const highlight of sortedHighlights) {
      // Add text before the highlight
      if (highlight.start > lastIdx) {
        result.push(text.substring(lastIdx, highlight.start));
      }
      
      // Add highlighted text
      result.push(
        <span key={`${highlight.start}-${highlight.end}`} className="bg-yellow-200 px-0.5 rounded">
          {text.substring(highlight.start, highlight.end)}
        </span>
      );
      
      lastIdx = highlight.end;
    }
    
    // Add any remaining text
    if (lastIdx < text.length) {
      result.push(text.substring(lastIdx));
    }
    
    return result;
  };

  // Remove highlight
  const removeHighlight = (index: number) => {
    const highlightedText = [...(data.params?.highlightedText || [])];
    highlightedText.splice(index, 1);
    updateNodeData(id, {
      params: {
        ...data.params,
        highlightedText
      }
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${
        selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
      } ${dragMode ? 'cursor-move' : ''}`}
      style={{ minWidth: '320px' }}
      data-no-drag={dragMode ? 'false' : 'true'}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Document to Text</h3>
              <p className="text-xs text-gray-500">{data.params?.nodeName || 'document_to_text_0'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDragMode(!dragMode)}
              className={`p-1 rounded-md transition-colors ${
                dragMode ? 'bg-amber-100 text-amber-700' : 'hover:bg-white/50 text-gray-600'
              }`}
              title={dragMode ? "Exit move mode" : "Enter move mode"}
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={toggleLock}
              className={`p-1 rounded-md transition-colors ${
                data.params?.locked ? 'bg-red-100 text-red-700' : 'hover:bg-white/50 text-gray-600'
              }`}
              title={data.params?.locked ? "Unlock node" : "Lock node"}
            >
              {data.params?.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => updateNodeData(id, { params: { ...data.params, showSettings: !data.params?.showSettings } })}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => removeNode(id)}
              className="p-1 rounded-md hover:bg-white/50 transition-colors"
              disabled={data.params?.locked}
            >
              <Trash2 className={`w-4 h-4 ${data.params?.locked ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Node Name Input */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Variable Name</label>
          <input
            type="text"
            placeholder="Enter variable name..."
            value={data.params?.nodeName || ''}
            onChange={(e) => updateNodeData(id, { params: { ...data.params, nodeName: e.target.value } })}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={data.params?.locked}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1">
            {(['settings', 'preview', 'response'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg -mb-px ${
                  activeTab === tab
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Extraction Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Extraction Mode</label>
                <select
                  value={data.params?.extractionMode || 'full'}
                  onChange={(e) => updateNodeData(id, {
                    params: {
                      ...data.params,
                      extractionMode: e.target.value as 'full' | 'summary' | 'first_page'
                    }
                  })}
                  disabled={data.params?.locked}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full">Full Document</option>
                  <option value="summary">Summary</option>
                  <option value="first_page">First Page Only</option>
                </select>
              </div>

              {/* Include Metadata */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <FileType className="w-4 h-4 text-gray-500" />
                  Include Metadata
                </label>
                <button 
                  type="button"
                  onClick={() => updateNodeData(id, {
                    params: { ...data.params, includeMetadata: !data.params?.includeMetadata }
                  })}
                  disabled={data.params?.locked}
                  className="text-sm"
                >
                  {data.params?.includeMetadata !== false ? (
                    <ToggleRight className="w-6 h-6 text-amber-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Preserve Formatting */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <List className="w-4 h-4 text-gray-500" />
                  Preserve Formatting
                </label>
                <button 
                  type="button"
                  onClick={() => updateNodeData(id, {
                    params: { ...data.params, preserveFormatting: !data.params?.preserveFormatting }
                  })}
                  disabled={data.params?.locked}
                  className="text-sm"
                >
                  {data.params?.preserveFormatting ? (
                    <ToggleRight className="w-6 h-6 text-amber-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Max Length */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Max Length (0 = no limit)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.params?.maxLength || 0}
                  onChange={(e) => updateNodeData(id, {
                    params: { ...data.params, maxLength: parseInt(e.target.value) || 0 }
                  })}
                  disabled={data.params?.locked}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Document Preview Placeholder */}
              <div className="p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center min-h-[150px]">
                <FileSearch className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Connect a document source to preview content</p>
                <p className="text-xs text-gray-400 mt-1">Supports PDF, DOCX, TXT, and more</p>
              </div>
              
              {/* Toggle highlighting mode */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <Highlighter className="w-4 h-4 text-gray-500" />
                  Highlight Mode
                </label>
                <button 
                  type="button"
                  onClick={() => setIsHighlighting(!isHighlighting)}
                  disabled={data.params?.locked}
                  className="text-sm"
                >
                  {isHighlighting ? (
                    <ToggleRight className="w-6 h-6 text-amber-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Display highlighted text sections */}
              {(data.params?.highlightedText?.length ?? 0) > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-medium text-gray-500">Highlighted Sections</h4>
                  <div className="max-h-[150px] overflow-y-auto space-y-1">
                    {data.params?.highlightedText?.map((highlight, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-yellow-50 px-2 py-1.5 rounded-md">
                        <div className="text-xs text-gray-700 truncate flex-1">
                          "{highlight.text.substring(0, 50)}{highlight.text.length > 50 ? '...' : ''}"
                        </div>
                        <button
                          type="button"
                          onClick={() => removeHighlight(idx)}
                          disabled={data.params?.locked}
                          className="p-0.5 rounded-md hover:bg-yellow-100 text-yellow-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'response' && (
            <div className="space-y-3">
              {!data.params?.testResponse ? (
                <div className="p-4 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-500">
                  <FileText className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm mb-1">No processed text yet</p>
                  <p className="text-xs">Run the workflow to see results</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex justify-between">
                    <span>Extracted Text</span>
                    {data.params.testResponse.execution_time_ms && (
                      <span>{data.params.testResponse.execution_time_ms}ms</span>
                    )}
                  </div>
                  
                  <pre 
                    className={`p-3 text-xs font-mono bg-white h-[180px] overflow-auto ${isHighlighting ? 'cursor-text' : ''}`}
                    ref={responseTextRef}
                    onMouseUp={handleTextSelection}
                  >
                    {data.params.testResponse.content?.text ? (
                      renderHighlightedText(
                        data.params.testResponse.content.text,
                        data.params?.highlightedText
                      )
                    ) : (
                      JSON.stringify(data.params.testResponse.content, null, 2)
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${data.params?.locked ? 'bg-red-500' : 'bg-green-500'}`} />
          <span>{data.params?.locked ? 'Locked' : 'Ready'}</span>
        </div>
        <div className="flex items-center gap-2">
          {data.params?.highlightedText && (
            <span>
              {data.params.highlightedText.length} highlight{data.params.highlightedText.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 -ml-0.5 bg-blue-500 border-2 border-white rounded-full shadow-md transition-opacity ${data.params?.locked ? 'opacity-50' : 'hover:scale-110'}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 -mr-0.5 bg-amber-500 border-2 border-white rounded-full shadow-md transition-opacity ${data.params?.locked ? 'opacity-50' : 'hover:scale-110'}`}
      />
    </div>
  );
};

export default DocumentToTextNode;