import React from 'react';
import "./styles.css";

export default function HRRecords({ onBack, allRequests, onGoToHRReview }) {
  // Filter for requests that are NOT pending
  const records = allRequests.filter(req => req.status !== "Pending");

  return (
    <div className="hr-records-page">
      <div className="hr-records-header">
        <button className="back-btn" onClick={onGoToHRReview || onBack}>← Back</button>
        <h1 className="hr-records-title">HR Records</h1>
        <div style={{ width: '80px' }}></div> {/* Spacer for symmetry */}
      </div>

      <div className="hr-records-container">
        <div className="hr-records-search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search records..." 
              className="search-input"
            />
          </div>
        </div>

        <div className="hr-records-table-container">
          <div className="hr-records-table-header">
            <div className="table-header-cell">Employee</div>
            <div className="table-header-cell">Item</div>
            <div className="table-header-cell">Quantity</div>
            <div className="table-header-cell">Date</div>
            <div className="table-header-cell">Purpose</div>
            <div className="table-header-cell">Status</div>
          </div>

          {records.length > 0 ? (
            records.map((req, index) => (
              <div className="hr-records-table-row" key={index}>
                <div className="table-cell employee-cell">
                  <div className="employee-info">
                    <div className="employee-name">{req.employeeName}</div>
                    <div className="employee-id">ID: {req.employeeId || 'N/A'}</div>
                  </div>
                </div>
                <div className="table-cell item-cell">
                  <div className="item-info">
                    <div className="item-name">{req.itemName}</div>
                    <div className="item-category">Category: {req.itemCategory || 'General'}</div>
                  </div>
                </div>
                <div className="table-cell quantity-cell">
                  <span className="quantity-badge">{req.quantity}</span>
                </div>
                <div className="table-cell date-cell">
                  <div className="date-info">
                    <div className="date-added">{req.dateAdded || 'N/A'}</div>
                    <div className="date-time">{req.timeAdded || ''}</div>
                  </div>
                </div>
                <div className="table-cell purpose-cell">
                  <div className="purpose-content">{req.purpose}</div>
                </div>
                <div className="table-cell status-cell">
                  <span className={`status-badge ${req.status.toLowerCase()}`}>
                    {req.status === "Approved" ? "✅ Approved" : 
                     req.status === "Finished" ? "✅ Finished" : 
                     req.status === "Rejected" ? "❌ Rejected" : req.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">No Records Found</h3>
              <p className="empty-description">No processed request records are available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
