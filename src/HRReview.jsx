import React from 'react';

export default function HRReview({ onBack, onViewRecords, onRegisterEmployee, onEmployeeManagement, pendingRequests, setRequests }) {
  const handleAction = async (employeeName, itemName, quantity, status) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    setRequests(prev => prev.map(req => 
      req.employeeName === employeeName && req.itemName === itemName && req.quantity === quantity 
        ? { 
            ...req, 
            status,
            ...(status === 'Approved' && { dateApproved: currentDate }) // Set approval date
          } 
        : req
    ));

    // Handle notification logic here if needed
    // For now, just log the action
    console.log(`Action: ${status} for ${employeeName} - ${itemName} x${quantity}`);
  };

  // Filter to show only pending requests
  const pendingOnly = pendingRequests.filter(req => req.status === 'Pending');

  return (
    <div className="status-page">
      <header className="status-header-row">
        <button className="back-btn" onClick={onBack}>← Logout</button>
        <h1 className="status-main-title">HR Review</h1>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="records-btn" onClick={onViewRecords}>Records</button>
          <button className="records-btn" style={{backgroundColor: '#3b82f6'}} onClick={() => {
            // Navigate to employee management
            if (onEmployeeManagement) {
              onEmployeeManagement();
            }
          }}>Employee Management</button>
          <button className="records-btn" style={{backgroundColor: '#10b981'}} onClick={() => {
            // Navigate to employee registration
            if (onRegisterEmployee) {
              onRegisterEmployee();
            }
          }}>Register Employee</button>
        </div>
      </header>
      <div className="status-container">
        <div className="hr-table-header">
          <div>Employee</div><div>Item</div><div>Qty</div><div>Date</div><div>Purpose</div><div>Action</div>
        </div>
        {pendingOnly.length > 0 ? (
          pendingOnly.map((req, index) => (
            <div className="hr-table-row" key={index}>
              <div>{req.employeeName}</div><div>{req.itemName}</div><div>{req.quantity}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateAdded || 'N/A'}</div>
              <div className="purpose-text">{req.purpose}</div>
              <div className="hr-actions">
                <button className="approve-btn" onClick={() => handleAction(req.employeeName, req.itemName, req.quantity, 'Approved')}>Approve</button>
                <button className="reject-btn" onClick={() => handleAction(req.employeeName, req.itemName, req.quantity, 'Rejected')}>Reject</button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No pending requests to review.
          </p>
        )}
      </div>
    </div>
  );
}
