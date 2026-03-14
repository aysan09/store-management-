import React, { useState, useEffect } from 'react';
import "./styles.css";

export default function RequestStatus({ onBack }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/requests');
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();
        setRequests(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) return <div className="status-page">Loading requests...</div>;
  if (error) return <div className="status-page">Error: {error}</div>;

  console.log('RequestStatus received requests:', requests);
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
          <div>Purpose</div>
          <div>Status</div>
        </div>

        {requests.map((req, index) => (
          <div className="status-table-row" key={index}>
            <div>{req.employeeName}</div>
            <div>{req.itemName}</div>
            <div>{req.quantity}</div>
            <div style={{fontSize: '12px', color: '#666'}}>{req.dateAdded || 'N/A'}</div>
            <div className="purpose-text">{req.purpose}</div>
            <div className={`approval-status ${req.status.toLowerCase()}`}>
              {req.status === "Pending" ? "⏳ Pending" : req.status === "Approved" ? "✅ Approved" : req.status === "Finished" ? "✅ Approved & Finished" : "❌ Rejected"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
