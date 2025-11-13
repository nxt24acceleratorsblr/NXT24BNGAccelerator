import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReconciliationResult } from '../types';
import './DiscrepancyReport.css';

interface DiscrepancyWithStatus {
  id: number;
  campaign: string;
  line: number;
  field: string;
  invoiceValue: any;
  mappingValue: any;
  difference: any;
  differencePercent?: number;
  severity: string;
  status: 'approved' | 'rejected';
}

const DiscrepancyReport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reconciliationData = location.state?.reconciliationData as ReconciliationResult;
  const reviewedDiscrepancies = location.state?.reviewedDiscrepancies as any[];

  const [discrepancies, setDiscrepancies] = useState<DiscrepancyWithStatus[]>([]);

  useEffect(() => {
    if (!reconciliationData || !reviewedDiscrepancies) {
      navigate('/extractor');
      return;
    }

    // Transform reviewed discrepancies for report
    const transformedDiscrepancies: DiscrepancyWithStatus[] = reviewedDiscrepancies
      .filter(d => d.status !== 'pending')
      .map(d => ({
        id: d.id,
        campaign: d.campaign || 'N/A',
        line: d.extracted_line,
        field: d.discrepancies[0].field,
        invoiceValue: d.discrepancies[0].extracted_value,
        mappingValue: d.discrepancies[0].mapping_value,
        difference: d.discrepancies[0].difference,
        differencePercent: d.discrepancies[0].difference_percent,
        severity: d.discrepancies[0].severity,
        status: d.status
      }));

    setDiscrepancies(transformedDiscrepancies);
  }, [reconciliationData, reviewedDiscrepancies, navigate]);

  const handleExportPDF = () => {
    console.log('Exporting report as PDF...');
    alert('PDF export functionality coming soon!');
  };

  const handleExportExcel = () => {
    console.log('Exporting report as Excel...');
    alert('Excel export functionality coming soon!');
  };

  const handleStartNew = () => {
    navigate('/extractor');
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const getTrustScoreColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT': return '#2e7d32';
      case 'GOOD': return '#1976d2';
      case 'FAIR': return '#f57f17';
      case 'POOR': return '#e65100';
      case 'CRITICAL': return '#c62828';
      default: return '#757575';
    }
  };

  if (!reconciliationData) {
    return <div>Loading...</div>;
  }

  const approvedCount = discrepancies.filter(d => d.status === 'approved').length;
  const rejectedCount = discrepancies.filter(d => d.status === 'rejected').length;
  const trustScore = reconciliationData.trust_score;

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

      {/* Trust Score Section */}
      <div className="trust-score-section">
        <h2>🎯 Trust Score</h2>
        <div className="trust-score-container">
          <div className="trust-score-circle" style={{ borderColor: getTrustScoreColor(trustScore.level) }}>
            <div className="trust-score-value" style={{ color: getTrustScoreColor(trustScore.level) }}>
              {trustScore.score}
            </div>
            <div className="trust-score-label">{trustScore.level}</div>
          </div>
          <div className="trust-score-details">
            <div className="trust-metric">
              <span className="metric-label">Match Rate:</span>
              <span className="metric-value">{trustScore.match_rate}%</span>
            </div>
            <div className="trust-metric">
              <span className="metric-label">Successful Matches:</span>
              <span className="metric-value">{trustScore.successful_matches} / {trustScore.total_items}</span>
            </div>
            <div className="trust-metric">
              <span className="metric-label">Total Discrepancies:</span>
              <span className="metric-value">{trustScore.total_discrepancies}</span>
            </div>
          </div>
        </div>
        
        {/* Severity Breakdown */}
        <div className="severity-breakdown">
          <h3>Severity Distribution</h3>
          <div className="severity-bars">
            <div className="severity-bar-item">
              <span className="severity-bar-label">🔴 Critical</span>
              <div className="severity-bar-container">
                <div 
                  className="severity-bar-fill critical" 
                  style={{ width: `${(trustScore.severity_breakdown.CRITICAL / trustScore.total_discrepancies * 100) || 0}%` }}
                ></div>
              </div>
              <span className="severity-bar-count">{trustScore.severity_breakdown.CRITICAL}</span>
            </div>
            <div className="severity-bar-item">
              <span className="severity-bar-label">🟠 High</span>
              <div className="severity-bar-container">
                <div 
                  className="severity-bar-fill high" 
                  style={{ width: `${(trustScore.severity_breakdown.HIGH / trustScore.total_discrepancies * 100) || 0}%` }}
                ></div>
              </div>
              <span className="severity-bar-count">{trustScore.severity_breakdown.HIGH}</span>
            </div>
            <div className="severity-bar-item">
              <span className="severity-bar-label">🟡 Medium</span>
              <div className="severity-bar-container">
                <div 
                  className="severity-bar-fill medium" 
                  style={{ width: `${(trustScore.severity_breakdown.MEDIUM / trustScore.total_discrepancies * 100) || 0}%` }}
                ></div>
              </div>
              <span className="severity-bar-count">{trustScore.severity_breakdown.MEDIUM}</span>
            </div>
            <div className="severity-bar-item">
              <span className="severity-bar-label">🟢 Low</span>
              <div className="severity-bar-container">
                <div 
                  className="severity-bar-fill low" 
                  style={{ width: `${(trustScore.severity_breakdown.LOW / trustScore.total_discrepancies * 100) || 0}%` }}
                ></div>
              </div>
              <span className="severity-bar-count">{trustScore.severity_breakdown.LOW}</span>
            </div>
          </div>
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
              <p className="card-value">{reconciliationData.summary.total_line_items}</p>
            </div>
          </div>
          <div className="summary-card success">
            <div className="card-icon">✓</div>
            <div className="card-content">
              <h3>Matched Items</h3>
              <p className="card-value">{reconciliationData.summary.fuzzy_matches}</p>
            </div>
          </div>
          <div className="summary-card warning">
            <div className="card-icon">⚠️</div>
            <div className="card-content">
              <h3>Discrepancies Found</h3>
              <p className="card-value">{discrepancies.length}</p>
            </div>
          </div>
          <div className="summary-card approved">
            <div className="card-icon">✓</div>
            <div className="card-content">
              <h3>Approved</h3>
              <p className="card-value">{approvedCount}</p>
            </div>
          </div>
          <div className="summary-card rejected">
            <div className="card-icon">✗</div>
            <div className="card-content">
              <h3>Rejected</h3>
              <p className="card-value">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancy Details */}
      {discrepancies.length > 0 && (
        <div className="details-section">
          <h2>📄 Discrepancy Details</h2>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Line</th>
                  <th>Field</th>
                  <th>Invoice Value</th>
                  <th>Mapping Value</th>
                  <th>Difference</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {discrepancies.map((disc) => (
                  <tr key={disc.id} className={`status-${disc.status}`}>
                    <td>{disc.campaign}</td>
                    <td>{disc.line}</td>
                    <td className="field-cell">{disc.field}</td>
                    <td className="value-cell">{formatValue(disc.invoiceValue)}</td>
                    <td className="value-cell">{formatValue(disc.mappingValue)}</td>
                    <td className="difference-cell">
                      {disc.differencePercent ? `${disc.differencePercent}%` : formatValue(disc.difference)}
                    </td>
                    <td className="severity-cell">
                      <span className={`severity-badge ${disc.severity.toLowerCase()}`}>
                        {disc.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${disc.status}`}>
                        {disc.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2>💡 Recommendations</h2>
        <ul className="recommendations-list">
          {approvedCount > 0 && (
            <li>
              <span className="recommendation-icon">✓</span>
              <span>{approvedCount} approved discrepancies are within acceptable variance thresholds</span>
            </li>
          )}
          {rejectedCount > 0 && (
            <li>
              <span className="recommendation-icon">⚠️</span>
              <span>Review {rejectedCount} rejected line items with vendor for correction</span>
            </li>
          )}
          {trustScore.level === 'EXCELLENT' && (
            <li>
              <span className="recommendation-icon">🎉</span>
              <span>Excellent data quality - proceed with confidence</span>
            </li>
          )}
          {trustScore.level === 'CRITICAL' && (
            <li>
              <span className="recommendation-icon">🚨</span>
              <span>Critical issues detected - immediate vendor consultation required</span>
            </li>
          )}
          {reconciliationData.summary.unmatched > 0 && (
            <li>
              <span className="recommendation-icon">📧</span>
              <span>Investigate {reconciliationData.summary.unmatched} unmatched line items</span>
            </li>
          )}
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

