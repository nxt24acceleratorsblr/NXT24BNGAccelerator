import { useState } from 'react';
import './CampaignGenerator.css';
import ProgressTracker from './ProgressTracker';
import ResultsDisplay from './ResultsDisplay';
import {
  generateMarketResearch,
  generateContentStrategy,
  generateSocialMediaCampaign,
  generateEmailCampaign,
} from '../services/campaign';
import { uploadFile } from '../services/campaignAPI';
import type { CampaignResult, AgentTask } from '../types';

const CampaignGenerator = () => {
  const [productName, setProductName] = useState('iPhone 17');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [inputMethod, setInputMethod] = useState<'manual' | 'file'>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignResult, setCampaignResult] = useState<CampaignResult>({
    status: 'idle',
  });
  const [tasks, setTasks] = useState<AgentTask[]>([
    { id: 1, name: 'Market Research', description: 'Analyzing market trends and competitors', status: 'pending' },
    { id: 2, name: 'Content Strategy', description: 'Creating taglines and messaging', status: 'pending' },
    { id: 3, name: 'Social Media', description: 'Designing viral campaigns', status: 'pending' },
    { id: 4, name: 'Email Campaign', description: 'Crafting conversion emails', status: 'pending' },
  ]);

  const updateTaskStatus = (taskId: number, status: AgentTask['status'], result?: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status, result } : task
      )
    );
  };

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
    const contextToUse = inputMethod === 'file' && fileContent 
      ? fileContent 
      : `Product: ${productName}`;

    if (inputMethod === 'manual' && !productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    if (inputMethod === 'file' && !fileContent) {
      alert('Please upload a file first');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(0);
    setCampaignResult({ status: 'loading' });

    // Reset all tasks
    setTasks(prev => prev.map(task => ({ ...task, status: 'pending', result: undefined })));

    try {
      // Step 1: Market Research
      setCurrentStep(1);
      updateTaskStatus(1, 'running');
      const research = await generateMarketResearch(productName, contextToUse);
      updateTaskStatus(1, 'completed', research.rawOutput);
      setCampaignResult(prev => ({ ...prev, marketResearch: research }));

      // Step 2: Content Strategy
      setCurrentStep(2);
      updateTaskStatus(2, 'running');
      const content = await generateContentStrategy(productName, research.rawOutput);
      updateTaskStatus(2, 'completed', content.rawOutput);
      setCampaignResult(prev => ({ ...prev, contentStrategy: content }));

      // Step 3: Social Media Campaign
      setCurrentStep(3);
      updateTaskStatus(3, 'running');
      const social = await generateSocialMediaCampaign(productName, content.rawOutput);
      updateTaskStatus(3, 'completed', social.rawOutput);
      setCampaignResult(prev => ({ ...prev, socialMedia: social }));

      // Step 4: Email Campaign
      setCurrentStep(4);
      updateTaskStatus(4, 'running');
      const email = await generateEmailCampaign(
        productName,
        `${research.rawOutput}\n\n${content.rawOutput}\n\n${social.rawOutput}`
      );
      updateTaskStatus(4, 'completed', email.rawOutput);
      setCampaignResult(prev => ({
        ...prev,
        emailCampaign: email,
        status: 'success',
        currentStep: 4,
      }));

      setCurrentStep(4);
    } catch (error) {
      console.error('Campaign generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate campaign';
      setCampaignResult(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      updateTaskStatus(currentStep, 'error');
    } finally {
      setIsGenerating(false);
    }
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

      {isGenerating && (
        <div className="progress-section">
          <ProgressTracker tasks={tasks} currentStep={currentStep} />
        </div>
      )}

      {campaignResult.status === 'error' && (
        <div className="error-card">
          <h3>❌ Error</h3>
          <p>{campaignResult.error}</p>
          <p className="error-hint">Make sure the backend server is running and try again.</p>
        </div>
      )}

      {campaignResult.status === 'success' && (
        <ResultsDisplay result={campaignResult} productName={productName} />
      )}
    </div>
  );
};

export default CampaignGenerator;
