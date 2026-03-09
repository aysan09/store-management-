import React from 'react';

export default function HRReview({ onBack, onViewRecords, onRegisterEmployee, onEmployeeManagement, pendingRequests, setRequests }) {
  const handleAction = async (employeeName, itemName, quantity, status) => {
    try {
      // Find the request to get its ID
      const request = pendingRequests.find(req => 
        req.employeeName === employeeName && 
        req.itemName === itemName && 
        req.quantity === quantity
      );

      if (!request) {
        alert('Request not found');
        return;
      }

      // Update status in database
      const response = await fetch(`http://localhost:5000/api/requests/${request.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === request.id 
            ? { 
                ...req, 
                status,
                ...(status === 'Approved' && { dateApproved: new Date().toISOString().split('T')[0] })
              } 
            : req
        ));
        
        alert(`Request ${status.toLowerCase()} successfully!`);
      } else {
        alert('Error updating request: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error updating request. Please try again.');
    }
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
