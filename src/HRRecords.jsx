import React from 'react';
import "./styles.css";

export default function HRRecords({ onBack, allRequests }) {
  // Filter for requests that are NOT pending
  const records = allRequests.filter(req => req.status !== "Pending");

  return (
    <div className="status-page">
      <header className="status-header-row">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="status-main-title">Request Records</h1>
        <div style={{ width: '80px' }}></div> {/* Spacer for symmetry */}
      </header>

      <div className="status-container">
        <div className="hr-table-header">
          <div>Employee</div>
          <div>Item</div>
          <div>Qty</div>
          <div>Date</div>
          <div>Purpose</div>
          <div>Status</div>
        </div>

        {records.length > 0 ? (
          records.map((req, index) => (
            <div className="hr-table-row" key={index}>
              <div>{req.employeeName}</div>
              <div>{req.itemName}</div>
              <div>{req.quantity}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateAdded || 'N/A'}</div>
              <div className="purpose-text">{req.purpose}</div>
              <div style={{ 
                fontWeight: 'bold', 
                color: req.status === 'Approved' ? '#22c55e' : '#ef4444' 
              }}>
                {req.status}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', padding: '20px' }}>No processed records found.</p>
        )}
      </div>
    </div>
  );
}