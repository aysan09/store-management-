import React from 'react';

export default function FinishedRequests({ onBack, finishedRequests }) {
  return (
    <div className="status-page">
      <header className="status-header-row">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="status-main-title">Finished Requests</h1>
        <div style={{ width: '80px' }}></div> {/* Spacer for symmetry */}
      </header>

      <div className="status-container">
        <div className="hr-table-header">
          <div>Employee</div>
          <div>Item</div>
          <div>Qty</div>
          <div>Date Added</div>
          <div>Date Approved</div>
          <div>Date Finished</div>
          <div>Purpose</div>
          <div>Status</div>
        </div>

        {finishedRequests && finishedRequests.length > 0 ? (
          finishedRequests.map((req, index) => (
            <div className="hr-table-row" key={index}>
              <div>{req.employeeName}</div>
              <div>{req.itemName}</div>
              <div>{req.quantity}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateAdded || 'N/A'}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateApproved || 'N/A'}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateFinished || 'N/A'}</div>
              <div className="purpose-text">{req.purpose}</div>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#6b7280' 
              }}>
                ✅ Finished
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', padding: '20px' }}>No finished requests found.</p>
        )}
      </div>
    </div>
  );
}