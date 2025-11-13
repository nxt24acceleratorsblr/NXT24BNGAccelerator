import React, { useState } from 'react';
import { extractInvoice } from '../services/campaignAPI';
import { InvoiceExtractionResult } from '../types';
import './InvoiceExtractor.css';

const InvoiceExtractor: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<InvoiceExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setExtractionResult(null);
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!uploadedFile) {
      setError('Please select a file first');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const result = await extractInvoice(uploadedFile, 50);
      setExtractionResult(result);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to extract invoice data');
      console.error('Extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null = 'USD') => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    return num.toLocaleString();
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return date;
  };

  const getFileTypeIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'xlsx':
      case 'xls': return '📊';
      case 'csv': return '📑';
      default: return '📁';
    }
  };

  return (
    <div className="invoice-extractor">
      <div className="extractor-header">
        <h1>📋 Invoice Data Extractor</h1>
        <p>Upload media billing invoices to extract structured data</p>
      </div>

      <div className="extractor-content">
        {/* File Upload Section */}
        <div className="upload-section">
          <label className="upload-label">Upload Invoice File</label>
          <div className="file-upload-area">
            <input
              type="file"
              className="file-input"
              accept=".pdf,.csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isExtracting}
              id="invoice-file"
            />
            <label htmlFor="invoice-file" className="file-upload-label">
              {uploadedFile ? (
                <div className="file-selected">
                  <span className="file-icon">{getFileTypeIcon(uploadedFile.name)}</span>
                  <div className="file-info">
                    <p className="file-name">{uploadedFile.name}</p>
                    <p className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <span className="check-icon">✓</span>
                </div>
              ) : (
                <div className="upload-prompt">
                  <span className="upload-icon">📤</span>
                  <p>Click to upload invoice file</p>
                  <p className="upload-hint">PDF, Excel (.xlsx, .xls), or CSV • Max 10MB</p>
                </div>
              )}
            </label>
          </div>

          <button
            className={`extract-button ${isExtracting ? 'extracting' : ''}`}
            onClick={handleExtract}
            disabled={!uploadedFile || isExtracting}
          >
            {isExtracting ? (
              <>
                <span className="spinner"></span>
                Extracting Invoice Data...
              </>
            ) : (
              <>
                <span className="button-icon">🔍</span>
                Extract Invoice Data
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Validation Status */}
        {extractionResult && (
          <div className={`validation-status ${extractionResult.validation.valid ? 'valid' : 'invalid'}`}>
            <div className="validation-header">
              <span className="validation-icon">
                {extractionResult.validation.valid ? '✅' : '⚠️'}
              </span>
              <h3>{extractionResult.validation.valid ? 'Extraction Successful' : 'Extraction Completed with Warnings'}</h3>
            </div>
            
            {extractionResult.validation.errors.length > 0 && (
              <div className="validation-errors">
                <h4>Errors:</h4>
                <ul>
                  {extractionResult.validation.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {extractionResult.validation.warnings.length > 0 && (
              <div className="validation-warnings">
                <h4>Warnings:</h4>
                <ul>
                  {extractionResult.validation.warnings.map((warn, idx) => (
                    <li key={idx}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Invoice Header */}
        {extractionResult && extractionResult.invoice_data.invoice_header && (
          <div className="invoice-header-section">
            <h2>📄 Invoice Header</h2>
            <div className="header-grid">
              <div className="header-item">
                <label>Invoice Number:</label>
                <span>{extractionResult.invoice_data.invoice_header.invoice_number || 'N/A'}</span>
              </div>
              <div className="header-item">
                <label>Vendor:</label>
                <span>{extractionResult.invoice_data.invoice_header.vendor_name || 'N/A'}</span>
              </div>
              <div className="header-item">
                <label>Campaign:</label>
                <span>{extractionResult.invoice_data.invoice_header.campaign_name || 'N/A'}</span>
              </div>
              <div className="header-item">
                <label>Invoice Date:</label>
                <span>{formatDate(extractionResult.invoice_data.invoice_header.invoice_date)}</span>
              </div>
              <div className="header-item">
                <label>Billing Period:</label>
                <span>
                  {formatDate(extractionResult.invoice_data.invoice_header.billing_start_date)} - {formatDate(extractionResult.invoice_data.invoice_header.billing_end_date)}
                </span>
              </div>
              <div className="header-item">
                <label>Currency:</label>
                <span>{extractionResult.invoice_data.invoice_header.currency || 'USD'}</span>
              </div>
            </div>

            <div className="metrics-section">
              <h3>📊 Delivery Metrics</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <label>Impressions</label>
                  <span className="metric-value">
                    {formatNumber(extractionResult.invoice_data.invoice_header.total_impressions)}
                  </span>
                </div>
                <div className="metric-card">
                  <label>Views</label>
                  <span className="metric-value">
                    {formatNumber(extractionResult.invoice_data.invoice_header.total_views)}
                  </span>
                </div>
                <div className="metric-card">
                  <label>Clicks</label>
                  <span className="metric-value">
                    {formatNumber(extractionResult.invoice_data.invoice_header.total_clicks)}
                  </span>
                </div>
              </div>
            </div>

            <div className="financial-section">
              <h3>💰 Financial Summary</h3>
              <div className="financial-grid">
                <div className="financial-item highlight">
                  <label>Gross Revenue:</label>
                  <span className="amount">
                    {formatCurrency(extractionResult.invoice_data.invoice_header.gross_revenue, extractionResult.invoice_data.invoice_header.currency)}
                  </span>
                </div>
                <div className="financial-item">
                  <label>Discount ({extractionResult.invoice_data.invoice_header.discount_percent || 0}%):</label>
                  <span className="amount discount">
                    -{formatCurrency(extractionResult.invoice_data.invoice_header.total_discount_amount, extractionResult.invoice_data.invoice_header.currency)}
                  </span>
                </div>
                <div className="financial-item highlight">
                  <label>Net Revenue:</label>
                  <span className="amount">
                    {formatCurrency(extractionResult.invoice_data.invoice_header.net_revenue, extractionResult.invoice_data.invoice_header.currency)}
                  </span>
                </div>
                <div className="financial-item profit">
                  <label>Profit:</label>
                  <span className="amount">
                    {formatCurrency(extractionResult.invoice_data.invoice_header.profit, extractionResult.invoice_data.invoice_header.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Line Items */}
        {extractionResult && extractionResult.invoice_data.line_items.length > 0 && (
          <div className="line-items-section">
            <h2>📋 Line Items ({extractionResult.invoice_data.line_items.length})</h2>
            <div className="table-container">
              <table className="line-items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Campaign</th>
                    <th>Placement</th>
                    <th>Period</th>
                    <th>Impressions</th>
                    <th>Views</th>
                    <th>Clicks</th>
                    <th>Gross Revenue</th>
                    <th>Discount</th>
                    <th>Net Revenue</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {extractionResult.invoice_data.line_items.map((item) => (
                    <tr key={item.line_id}>
                      <td>{item.line_id}</td>
                      <td>{item.campaign_name || '-'}</td>
                      <td>{item.placement || '-'}</td>
                      <td className="date-cell">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </td>
                      <td className="number-cell">{formatNumber(item.billed_impressions)}</td>
                      <td className="number-cell">{formatNumber(item.views)}</td>
                      <td className="number-cell">{formatNumber(item.clicks)}</td>
                      <td className="currency-cell">
                        {formatCurrency(item.gross_revenue, extractionResult.invoice_data.invoice_header.currency)}
                      </td>
                      <td className="currency-cell discount">
                        {item.discount_amount ? `-${formatCurrency(item.discount_amount, extractionResult.invoice_data.invoice_header.currency)}` : '-'}
                      </td>
                      <td className="currency-cell">
                        {formatCurrency(item.net_revenue, extractionResult.invoice_data.invoice_header.currency)}
                      </td>
                      <td className="currency-cell profit">
                        {formatCurrency(item.profit, extractionResult.invoice_data.invoice_header.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        {extractionResult && extractionResult.invoice_data.notes && (
          <div className="notes-section">
            <h3>📝 Notes</h3>
            <p>{extractionResult.invoice_data.notes}</p>
          </div>
        )}

        {/* Export Options */}
        {extractionResult && (
          <div className="export-section">
            <button
              className="export-button"
              onClick={() => {
                const dataStr = JSON.stringify(extractionResult.invoice_data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `invoice_${extractionResult.invoice_data.invoice_header.invoice_number || 'extracted'}.json`;
                link.click();
              }}
            >
              💾 Export as JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceExtractor;
