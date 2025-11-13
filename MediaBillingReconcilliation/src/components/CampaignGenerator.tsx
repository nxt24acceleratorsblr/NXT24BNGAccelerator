import { useState } from 'react';
import './CampaignGenerator.css';
import { uploadFile } from '../services/campaignAPI';

const CampaignGenerator = () => {
  const [productName, setProductName] = useState('iPhone 17');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [inputMethod, setInputMethod] = useState<'manual' | 'file'>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const getFileTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      pdf: '📄',
      csv: '📊',
      xml: '🗂️',
      image: '🖼️',
      text: '📝'
    };
    return icons[type] || '📁';
  };

  const getFileTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      pdf: 'PDF Document',
      csv: 'CSV Spreadsheet',
      xml: 'XML Data',
      image: 'Image File',
      text: 'Text File'
    };
    return labels[type] || 'File';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    try {
      // Upload to backend and get content
      const uploadResult = await uploadFile(file);
      setFileContent(uploadResult.content);
      setFileType(uploadResult.file_type || 'unknown');
      setParsedData(uploadResult.parsed_data);
      
      // Try to extract product name from parsed data or content
      if (uploadResult.parsed_data?.product_name) {
        setProductName(uploadResult.parsed_data.product_name);
      } else {
        // Fallback: search in content
        const lines = uploadResult.content.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().includes('product name:')) {
            const extractedName = line.split(':')[1]?.trim();
            if (extractedName) {
              setProductName(extractedName);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Make sure the backend server is running.');
    }
  };

  const handleGenerate = async () => {

    if (inputMethod === 'manual' && !productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    if (inputMethod === 'file' && !fileContent) {
      alert('Please upload a file first');
      return;
    }

    setIsGenerating(true);
  };

  return (
    <div className="campaign-generator">
      <div className="generator-card">
        <h2 className="generator-title">Generate Your Marketing Campaign</h2>
        <p className="generator-subtitle">
          Enter your product name or upload a file with product details
        </p>

        {/* Input Method Toggle */}
        <div className="input-method-toggle">
          <button
            className={`toggle-button ${inputMethod === 'manual' ? 'active' : ''}`}
            onClick={() => setInputMethod('manual')}
            disabled={isGenerating}
          >
            📝 Manual Input
          </button>
          <button
            className={`toggle-button ${inputMethod === 'file' ? 'active' : ''}`}
            onClick={() => setInputMethod('file')}
            disabled={isGenerating}
          >
            📁 File Upload
          </button>
        </div>

        {inputMethod === 'manual' ? (
          <div className="input-section">
            <label htmlFor="productName" className="input-label">
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              className="product-input"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., iPhone 17, Tesla Model X, AirPods Pro 2"
              disabled={isGenerating}
            />
          </div>
        ) : (
          <div className="input-section">
            <label htmlFor="fileUpload" className="input-label">
              Upload Product File
            </label>
            <div className="file-upload-area">
              <input
                id="fileUpload"
                type="file"
                className="file-input"
                accept=".pdf,.csv,.xml,.jpg,.jpeg,.png,.gif,.bmp,.txt"
                onChange={handleFileUpload}
                disabled={isGenerating}
              />
              <label htmlFor="fileUpload" className="file-upload-label">
                {uploadedFile ? (
                  <div className="file-selected">
                    <span className="file-icon">{getFileTypeIcon(fileType)}</span>
                    <div className="file-info">
                      <p className="file-name">{uploadedFile.name}</p>
                      <p className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      <p className="file-type-label">{getFileTypeLabel(fileType)}</p>
                    </div>
                    <span className="check-icon">✓</span>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <span className="upload-icon">📤</span>
                    <p>Click to upload or drag and drop</p>
                    <p className="upload-hint">
                      PDF, CSV, XML, or Image files • Max 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            {uploadedFile && fileContent && (
              <div className="file-preview">
                <p className="preview-label">📋 Extracted Content Preview:</p>
                <pre className="preview-content">{fileContent.substring(0, 300)}...</pre>
                {parsedData && parsedData.product_name && (
                  <div className="parsed-info">
                    <p><strong>Product:</strong> {parsedData.product_name}</p>
                    {parsedData.features && parsedData.features.length > 0 && (
                      <p><strong>Features:</strong> {parsedData.features.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          className={`generate-button ${isGenerating ? 'generating' : ''}`}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner"></span>
              Generating Campaign...
            </>
          ) : (
            <>
              <span className="button-icon">✨</span>
              Generate Campaign
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CampaignGenerator;
