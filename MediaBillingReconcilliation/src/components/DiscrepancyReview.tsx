import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReconciliationResult, DiscrepancyItem } from '../types';
import './DiscrepancyReview.css';

interface DiscrepancyWithStatus extends DiscrepancyItem {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
}

const DiscrepancyReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reconciliationData = location.state?.reconciliationData as ReconciliationResult;

  const [discrepancies, setDiscrepancies] = useState<DiscrepancyWithStatus[]>([]);
  const [matchingProgress, setMatchingProgress] = useState(0);

  useEffect(() => {
    if (!reconciliationData) {
      navigate('/extractor');
      return;
    }

    // Transform potential_discrepancies into discrepancies with status
    const transformedDiscrepancies: DiscrepancyWithStatus[] = [];
    let idCounter = 1;

    reconciliationData.fuzzy_matches.potential_discrepancies.forEach((disc) => {
      disc.discrepancies.forEach((fieldDisc) => {
        transformedDiscrepancies.push({
          id: idCounter++,
          mapping_file: disc.mapping_file,
          extracted_line: disc.extracted_line,
          mapping_line: disc.mapping_line,
          campaign: disc.campaign,
          overall_score: disc.overall_score,
          discrepancies: [fieldDisc],
          status: 'pending'
        });
      });
    });

    setDiscrepancies(transformedDiscrepancies);
  }, [reconciliationData, navigate]);

  const handleStatusChange = (id: number, newStatus: 'approved' | 'rejected') => {
    setDiscrepancies(prev =>
      prev.map(disc =>
        disc.id === id ? { ...disc, status: newStatus } : disc
      )
    );

    // Update progress
    const updatedDiscrepancies = discrepancies.map(disc =>
      disc.id === id ? { ...disc, status: newStatus } : disc
    );
    const resolved = updatedDiscrepancies.filter(d => d.status !== 'pending').length;
    const total = updatedDiscrepancies.length;
    setMatchingProgress(Math.round((resolved / total) * 100));
  };

  const handleGenerateReport = () => {
    navigate('/report', { 
      state: { 
        reconciliationData,
        reviewedDiscrepancies: discrepancies
      } 
    });
  };

  const pendingCount = discrepancies.filter(d => d.status === 'pending').length;
  const approvedCount = discrepancies.filter(d => d.status === 'approved').length;
  const rejectedCount = discrepancies.filter(d => d.status === 'rejected').length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '🔴';
      case 'HIGH': return '🟠';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  if (!reconciliationData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="discrepancy-review">
      <div className="review-header">
        <h1>🔍 Discrepancy Review</h1>
        <p>Review and approve/reject discrepancies found during invoice matching</p>
      </div>

      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-header">
          <h2>Matching Progress</h2>
          <span className="progress-percentage">{matchingProgress}%</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${matchingProgress}%` }}
          ></div>
        </div>
        <div className="progress-stats">
          <div className="stat-item pending">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-label">Approved</span>
            <span className="stat-value">{approvedCount}</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-label">Rejected</span>
            <span className="stat-value">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Line Items</h3>
          <p className="card-value">{reconciliationData.summary.total_line_items}</p>
        </div>
        <div className="summary-card success">
          <h3>Matched Items</h3>
          <p className="card-value">{reconciliationData.summary.fuzzy_matches}</p>
        </div>
        <div className="summary-card warning">
          <h3>Discrepancies Found</h3>
          <p className="card-value">{discrepancies.length}</p>
        </div>
        <div className="summary-card info">
          <h3>Unmatched Items</h3>
          <p className="card-value">{reconciliationData.summary.unmatched}</p>
        </div>
      </div>

      {/* Discrepancies Table */}
      <div className="discrepancies-section">
        <h2>📋 Discrepancies Found ({discrepancies.length})</h2>
        {discrepancies.length === 0 ? (
          <div className="no-discrepancies">
            <p>✅ No discrepancies found! All line items match perfectly.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="discrepancies-table">
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discrepancies.map((disc) => {
                  const fieldDisc = disc.discrepancies[0];
                  return (
                    <tr key={disc.id} className={`status-${disc.status}`}>
                      <td className="campaign-cell">{disc.campaign || 'N/A'}</td>
                      <td>{disc.extracted_line}</td>
                      <td className="field-cell">{fieldDisc.field}</td>
                      <td className="value-cell">{formatValue(fieldDisc.extracted_value)}</td>
                      <td className="value-cell">{formatValue(fieldDisc.mapping_value)}</td>
                      <td className="difference-cell">
                        {fieldDisc.difference_percent 
                          ? `${fieldDisc.difference_percent}%` 
                          : formatValue(fieldDisc.difference)}
                      </td>
                      <td className="severity-cell">
                        <span className={`severity-badge ${fieldDisc.severity.toLowerCase()}`}>
                          {getSeverityIcon(fieldDisc.severity)} {fieldDisc.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${disc.status}`}>
                          {disc.status === 'pending' && '⏳ Pending'}
                          {disc.status === 'approved' && '✓ Approved'}
                          {disc.status === 'rejected' && '✗ Rejected'}
                        </span>
                      </td>
                      <td>
                        {disc.status === 'pending' && (
                          <div className="action-buttons">
                            <button
                              className="action-btn approve-btn"
                              onClick={() => handleStatusChange(disc.id, 'approved')}
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              className="action-btn reject-btn"
                              onClick={() => handleStatusChange(disc.id, 'rejected')}
                              title="Reject"
                            >
                              ✗
                            </button>
                          </div>
                        )}
                        {disc.status !== 'pending' && (
                          <button
                            className="action-btn reset-btn"
                            onClick={() => {
                              setDiscrepancies(prev =>
                                prev.map(d =>
                                  d.id === disc.id ? { ...d, status: 'pending' } : d
                                )
                              );
                            }}
                            title="Reset"
                          >
                            ↺
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="review-actions">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/extractor')}
        >
          ← Back to Upload
        </button>
        <button
          className="btn btn-primary"
          onClick={handleGenerateReport}
          disabled={pendingCount > 0}
        >
          Generate Final Report →
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="warning-message">
          ⚠️ Please review all pending discrepancies before generating the final report
        </div>
      )}
    </div>
  );
};

export default DiscrepancyReview;

