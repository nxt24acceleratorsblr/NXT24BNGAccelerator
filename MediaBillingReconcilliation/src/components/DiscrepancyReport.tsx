import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DiscrepancyReport.css';

interface ReportSummary {
  totalLineItems: number;
  matchedItems: number;
  discrepanciesFound: number;
  approvedDiscrepancies: number;
  rejectedDiscrepancies: number;
  totalInvoiceAmount: string;
  totalCampaignAmount: string;
  totalDifference: string;
}

interface DiscrepancyDetail {
  id: number;
  lineItem: string;
  field: string;
  invoiceValue: string | number;
  campaignValue: string | number;
  difference: string | number;
  status: 'approved' | 'rejected';
  resolution: string;
}

const DiscrepancyReport: React.FC = () => {
  const navigate = useNavigate();

  const summary: ReportSummary = {
    totalLineItems: 25,
    matchedItems: 22,
    discrepanciesFound: 3,
    approvedDiscrepancies: 2,
    rejectedDiscrepancies: 1,
    totalInvoiceAmount: '$125,000',
    totalCampaignAmount: '$122,500',
    totalDifference: '+$2,500 (2.04%)'
  };

  const discrepancies: DiscrepancyDetail[] = [
    {
      id: 1,
      lineItem: 'Campaign Line 001',
      field: 'Impressions',
      invoiceValue: 1500000,
      campaignValue: 1450000,
      difference: '+50,000 (3.4%)',
      status: 'approved',
      resolution: 'Variance within acceptable threshold'
    },
    {
      id: 2,
      lineItem: 'Campaign Line 002',
      field: 'Net Revenue',
      invoiceValue: '$45,000',
      campaignValue: '$42,500',
      difference: '+$2,500 (5.9%)',
      status: 'approved',
      resolution: 'Additional bonus impressions delivered'
    },
    {
      id: 3,
      lineItem: 'Campaign Line 003',
      field: 'Clicks',
      invoiceValue: 12500,
      campaignValue: 13000,
      difference: '-500 (-3.8%)',
      status: 'rejected',
      resolution: 'Invoice value should match campaign data'
    }
  ];

  const handleExportPDF = () => {
    console.log('Exporting report as PDF...');
    // Implement PDF export logic
  };

  const handleExportExcel = () => {
    console.log('Exporting report as Excel...');
    // Implement Excel export logic
  };

  const handleStartNew = () => {
    navigate('/extractor');
  };

  return (
    <div className="discrepancy-report">
      <div className="report-header">
        <h1>📊 Discrepancy Report</h1>
        <p>Comprehensive reconciliation report for media billing</p>
        <div className="report-date">
          Generated on: {new Date().toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'short'
          })}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="summary-section">
        <h2>📋 Executive Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <h3>Total Line Items</h3>
              <p className="card-value">{summary.totalLineItems}</p>
            </div>
          </div>
          <div className="summary-card success">
            <div className="card-icon">✓</div>
            <div className="card-content">
              <h3>Matched Items</h3>
              <p className="card-value">{summary.matchedItems}</p>
            </div>
          </div>
          <div className="summary-card warning">
            <div className="card-icon">⚠️</div>
            <div className="card-content">
              <h3>Discrepancies Found</h3>
              <p className="card-value">{summary.discrepanciesFound}</p>
            </div>
          </div>
          <div className="summary-card approved">
            <div className="card-icon">✓</div>
            <div className="card-content">
              <h3>Approved</h3>
              <p className="card-value">{summary.approvedDiscrepancies}</p>
            </div>
          </div>
          <div className="summary-card rejected">
            <div className="card-icon">✗</div>
            <div className="card-content">
              <h3>Rejected</h3>
              <p className="card-value">{summary.rejectedDiscrepancies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="financial-summary">
        <h2>💰 Financial Summary</h2>
        <div className="financial-grid">
          <div className="financial-item">
            <label>Invoice Total:</label>
            <span className="amount">{summary.totalInvoiceAmount}</span>
          </div>
          <div className="financial-item">
            <label>Campaign Total:</label>
            <span className="amount">{summary.totalCampaignAmount}</span>
          </div>
          <div className="financial-item highlight">
            <label>Total Difference:</label>
            <span className="amount difference">{summary.totalDifference}</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Details */}
      <div className="details-section">
        <h2>📄 Discrepancy Details</h2>
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Line Item</th>
                <th>Field</th>
                <th>Invoice Value</th>
                <th>Campaign Value</th>
                <th>Difference</th>
                <th>Status</th>
                <th>Resolution Notes</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((disc) => (
                <tr key={disc.id} className={`status-${disc.status}`}>
                  <td>{disc.id}</td>
                  <td>{disc.lineItem}</td>
                  <td>{disc.field}</td>
                  <td className="value-cell">{disc.invoiceValue}</td>
                  <td className="value-cell">{disc.campaignValue}</td>
                  <td className="difference-cell">{disc.difference}</td>
                  <td>
                    <span className={`status-badge status-${disc.status}`}>
                      {disc.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </span>
                  </td>
                  <td className="resolution-cell">{disc.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2>💡 Recommendations</h2>
        <ul className="recommendations-list">
          <li>
            <span className="recommendation-icon">✓</span>
            <span>Approved discrepancies are within acceptable variance thresholds</span>
          </li>
          <li>
            <span className="recommendation-icon">⚠️</span>
            <span>Review rejected line items with vendor for correction</span>
          </li>
          <li>
            <span className="recommendation-icon">📧</span>
            <span>Send corrected invoice request to vendor for rejected items</span>
          </li>
          <li>
            <span className="recommendation-icon">📅</span>
            <span>Schedule follow-up review within 5 business days</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="report-actions">
        <div className="export-buttons">
          <button className="btn btn-export" onClick={handleExportPDF}>
            📄 Export as PDF
          </button>
          <button className="btn btn-export" onClick={handleExportExcel}>
            📊 Export as Excel
          </button>
        </div>
        <button className="btn btn-primary" onClick={handleStartNew}>
          Start New Reconciliation
        </button>
      </div>
    </div>
  );
};

export default DiscrepancyReport;
