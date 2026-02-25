import React from 'react';

export default function ApprovedRequests({ onBack, approvedRequests }) {
  return (
    <div className="status-page">
      <header className="status-header-row">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="status-main-title">Approved Requests</h1>
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

        {approvedRequests && approvedRequests.length > 0 ? (
          approvedRequests.map((req, index) => (
            <div className="hr-table-row" key={index}>
              <div>{req.employeeName}</div>
              <div>{req.itemName}</div>
              <div>{req.quantity}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateAdded || 'N/A'}</div>
              <div className="purpose-text">{req.purpose}</div>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#22c55e' 
              }}>
                ✅ Approved
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', padding: '20px' }}>No approved requests found.</p>
        )}
      </div>
    </div>
  );
}