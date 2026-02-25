import React from 'react';
import "./styles.css";

export default function RequestStatus({ onBack, requests }) {
  return (
    <div className="status-page">
      <button className="back-btn" onClick={onBack} style={{ margin: '20px' }}>←</button>
      
      <h1 className="status-main-title">Request Status</h1>

      <div className="status-container">
        <div className="status-table-header">
          <div>Employee</div>
          <div>Item Name</div>
          <div>Quantity</div>
          <div>Date</div>
          <div>Status</div>
        </div>

        {requests.map((req, index) => (
          <div className="status-table-row" key={index}>
            <div>{req.employeeName}</div>
            <div>{req.itemName}</div>
            <div>{req.quantity}</div>
            <div style={{fontSize: '12px', color: '#666'}}>{req.dateAdded || 'N/A'}</div>
            <div className={`approval-status ${req.status.toLowerCase()}`}>
              {req.status === "Pending" ? "⏳ Pending" : req.status === "Approved" ? "✅ Approved" : "❌ Rejected"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
