import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DiscrepancyReview.css';

interface Discrepancy {
  id: number;
  lineItem: string;
  field: string;
  invoiceValue: string | number;
  campaignValue: string | number;
  difference: string | number;
  status: 'pending' | 'approved' | 'rejected';
}

const DiscrepancyReview: React.FC = () => {
  const navigate = useNavigate();
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([
    {
      id: 1,
      lineItem: 'Campaign Line 001',
      field: 'Impressions',
      invoiceValue: 1500000,
      campaignValue: 1450000,
      difference: '+50,000 (3.4%)',
      status: 'pending'
    },
    {
      id: 2,
      lineItem: 'Campaign Line 002',
      field: 'Net Revenue',
      invoiceValue: '$45,000',
      campaignValue: '$42,500',
      difference: '+$2,500 (5.9%)',
      status: 'pending'
    },
    {
      id: 3,
      lineItem: 'Campaign Line 003',
      field: 'Clicks',
      invoiceValue: 12500,
      campaignValue: 13000,
      difference: '-500 (-3.8%)',
      status: 'pending'
    }
  ]);

  const [matchingProgress, setMatchingProgress] = useState(65);

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
    navigate('/report');
  };

  const pendingCount = discrepancies.filter(d => d.status === 'pending').length;
  const approvedCount = discrepancies.filter(d => d.status === 'approved').length;
  const rejectedCount = discrepancies.filter(d => d.status === 'rejected').length;

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

      {/* Discrepancies Table */}
      <div className="discrepancies-section">
        <h2>📋 Discrepancies Found</h2>
        <div className="table-container">
          <table className="discrepancies-table">
            <thead>
              <tr>
                <th>Line Item</th>
                <th>Field</th>
                <th>Invoice Value</th>
                <th>Campaign Value</th>
                <th>Difference</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((disc) => (
                <tr key={disc.id} className={`status-${disc.status}`}>
                  <td>{disc.lineItem}</td>
                  <td>{disc.field}</td>
                  <td className="value-cell">{disc.invoiceValue}</td>
                  <td className="value-cell">{disc.campaignValue}</td>
                  <td className="difference-cell">{disc.difference}</td>
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
              ))}
            </tbody>
          </table>
        </div>
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
          Generate Report →
        </button>
      </div>
    </div>
  );
};

export default DiscrepancyReview;
