# 🚀 VectorShift-Style Document Upload Guide

## Overview

Your Smart Database system now includes VectorShift-inspired document upload functionality that allows you to add documents from multiple sources with an intuitive interface.

## 📍 Where to Find the Upload Button

### 1. **Main Dashboard - Smart Database Section**
- Navigate to your workflow dashboard
- Select the **Smart Database** tab
- Look for the blue **"Add Document"** button in the top-right header
- Located next to the "Configure" button

### 2. **Knowledge Base Interface**
The interface matches VectorShift's design with:
- Clean header with Knowledge Base name
- **Add Document** button prominently displayed
- Quick stats showing documents, quality score, performance, and efficiency

## 🎯 How to Use Document Upload

### Step 1: Click "Add Document"
Click the blue **"Add Document"** button to open the document source selection modal.

### Step 2: Choose Your Document Source

The modal presents 4 options (exactly like VectorShift):

#### 📁 **Choose/Upload Files**
- **Purpose**: Upload static files from your computer
- **Supported formats**: PDF, Word (.doc/.docx), CSV, Text (.txt), Markdown (.md)
- **Features**:
  - Drag and drop interface
  - Multiple file selection
  - Progress indicators
  - File preview

#### ☁️ **Choose/Add Integration**
- **Purpose**: Connect to external services
- **Supported integrations**:
  - Google Drive
  - Notion
  - Slack
  - Confluence
  - GitHub
- **Features**:
  - Live sync capabilities
  - Automatic updates
  - Permission handling

#### 🌐 **Scrape URL**
- **Purpose**: Extract content from web pages
- **Options**:
  - **Single URL**: Extract content from one webpage
  - **Recursive**: Scrape all subpages from a base URL
- **Configuration**:
  - Rescrape frequency (Never, Daily, Weekly, Monthly)
  - Custom document naming
  - Metadata preservation

#### 📂 **Create Folder**
- **Purpose**: Organize documents into logical groups
- **Features**:
  - Hierarchical organization
  - Bulk operations
  - Easy navigation

### Step 3: Configure Document Settings

#### For File Uploads:
1. Select files using drag-and-drop or "Browse Files"
2. Enter optional custom document name
3. View selected files with icons
4. Click "Add Document" to upload

#### For URL Scraping:
1. Enter the target URL
2. Check "Recursive" if you want to scrape subpages
3. Set rescrape frequency for automatic updates
4. Enter optional document name
5. Click "Add Document" to start scraping

#### For Integrations:
1. Select integration type from dropdown
2. Follow authentication flow (if needed)
3. Choose specific files/folders to sync
4. Enter optional document name
5. Click "Add Document" to connect

## 🔧 Advanced Features

### Smart Processing
When you upload documents, the system automatically:
- **Analyzes content type** and applies appropriate processing
- **Optimizes chunking strategy** based on document structure
- **Generates high-quality embeddings** using the configured model
- **Extracts metadata** for enhanced searchability

### Background Processing
- All uploads happen in the background
- Real-time progress updates
- Notifications when processing completes
- Detailed processing logs in the task panel

### Configuration Options
After uploading, you can configure:
- **Chunk size and overlap** for optimal performance
- **Embedding models** (OpenAI, Cohere, custom)
- **Processing options** (advanced analysis, metadata extraction)
- **Search settings** (filters, reranking, query expansion)

## 🎨 User Interface Features

### Visual Design
- **Clean, modern interface** matching VectorShift aesthetics
- **Color-coded options** for easy identification
- **Responsive layout** working on all screen sizes
- **Intuitive icons** for quick recognition

### Progress Tracking
- **Upload progress bars** for file transfers
- **Processing status indicators** for background tasks
- **Real-time notifications** for success/failure
- **Detailed error messages** for troubleshooting

### Document Management
- **Document preview** in the knowledge base
- **Status indicators** (Pending, Processing, Completed, Failed)
- **Metadata display** with original filenames and sources
- **Easy document removal** with confirmation

## 📊 Monitoring and Analytics

### Performance Metrics
After uploading documents, view:
- **Document count** and processing status
- **Quality scores** for embeddings and content
- **Search performance** metrics
- **Storage efficiency** statistics

### Usage Insights
- **Search patterns** and popular queries
- **Response times** for different document types
- **Optimization recommendations** from AI analysis
- **Usage trends** over time

## 🚀 Quick Start Example

### Upload a PDF Document:
1. Click **"Add Document"** button
2. Select **"Choose/Upload Files"**
3. Drag your PDF into the upload area or click **"Browse Files"**
4. Enter a descriptive name (optional)
5. Click **"Add Document"**
6. Monitor progress in the task panel
7. View analytics once processing completes

### Scrape a Website:
1. Click **"Add Document"** button
2. Select **"Scrape URL"**
3. Enter the website URL (e.g., `https://docs.example.com`)
4. Check **"Recursive"** to include all subpages
5. Set **"Weekly"** rescrape frequency for automatic updates
6. Click **"Add Document"**
7. Check the task panel for scraping progress

## 🔗 API Integration

### Programmatic Upload
You can also upload documents programmatically using the API:

```javascript
// Upload file
const formData = new FormData();
formData.append('source_type', 'file');
formData.append('file', fileInput.files[0]);
formData.append('document_name', 'My Document');

await fetch(`/api/knowledge-base/${kbId}/add-documents`, {
  method: 'POST',
  body: formData
});

// Scrape URL
await fetch(`/api/knowledge-base/${kbId}/add-documents`, {
  method: 'POST',
  body: new FormData({
    source_type: 'url',
    source_path: 'https://example.com',
    document_name: 'Example Website',
    metadata: JSON.stringify({ recursive: true })
  })
});
```

## 🛠️ Troubleshooting

### Common Issues:

#### Upload Fails
- **Check file size**: Ensure files are under the size limit
- **Verify format**: Only supported file types are accepted
- **Network issues**: Ensure stable internet connection

#### URL Scraping Fails
- **Check URL accessibility**: Ensure the URL is publicly accessible
- **Verify permissions**: Some sites block automated scraping
- **Review robots.txt**: Respect website scraping policies

#### Integration Issues
- **Authentication**: Ensure proper permissions for integrated services
- **API limits**: Check if you've exceeded service rate limits
- **Sync settings**: Verify integration configuration

## 🎉 Success Indicators

### Document Successfully Added:
- ✅ Green success notification
- 📊 Updated document count in analytics
- 🔍 Document appears in search results
- 📈 Performance metrics refresh

### Processing Complete:
- 📄 Document status changes to "Completed"
- 🧠 Embeddings generated successfully
- 🔎 Document becomes searchable
- 📋 Analytics update with new insights

## 🔮 Next Steps

After uploading documents:
1. **Test search functionality** with relevant queries
2. **Review analytics** for performance insights
3. **Optimize settings** based on recommendations
4. **Set up automated syncing** for dynamic content
5. **Create workflows** using your knowledge base

Your Smart Database system now provides enterprise-grade document management with VectorShift-level capabilities! 🚀 