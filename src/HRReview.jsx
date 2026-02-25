import React from 'react';
import { sendApprovalNotification, sendEmployeeApprovalNotification } from './services/emailService';

export default function HRReview({ onBack, onViewRecords, pendingRequests, setRequests }) {
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

    // If the request was approved, send notifications to store managers and employee
    if (status === 'Approved') {
      const approvedRequest = pendingRequests.find(req => 
        req.employeeName === employeeName && req.itemName === itemName && req.quantity === quantity
      );
      
      if (approvedRequest) {
        // Send notification to store managers
        try {
          const storeResult = await sendApprovalNotification(approvedRequest);
          if (storeResult.success) {
            console.log('✅ Store manager approval notification sent successfully');
          } else {
            console.warn('⚠️ Store manager approval notification failed:', storeResult.message);
          }
        } catch (error) {
          console.error('❌ Error sending store manager approval notification:', error);
        }

        // Send notification to employee
        try {
          const employeeResult = await sendEmployeeApprovalNotification(approvedRequest);
          if (employeeResult.success) {
            console.log('✅ Employee approval notification sent successfully');
          } else {
            console.warn('⚠️ Employee approval notification failed:', employeeResult.message);
          }
        } catch (error) {
          console.error('❌ Error sending employee approval notification:', error);
        }
      }
    }
  };

  // Filter to show only pending requests
  const pendingOnly = pendingRequests.filter(req => req.status === 'Pending');

  return (
    <div className="status-page">
      <header className="status-header-row">
        <button className="back-btn" onClick={onBack}>← Logout</button>
        <h1 className="status-main-title">HR Review</h1>
        <button className="records-btn" onClick={onViewRecords}>Records</button>
      </header>
      <div className="status-container">
        <div className="hr-table-header">
          <div>Employee</div><div>Item</div><div>Qty</div><div>Date</div><div>Action</div>
        </div>
        {pendingOnly.length > 0 ? (
          pendingOnly.map((req, index) => (
            <div className="hr-table-row" key={index}>
              <div>{req.employeeName}</div><div>{req.itemName}</div><div>{req.quantity}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateAdded || 'N/A'}</div>
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
