import React, { useState, useEffect } from 'react';
import "./styles.css";

export default function RequestStatus({ onBack, requests: propsRequests }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/requests');
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();
        setRequests(data.data ? data.data.requests : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Use propsRequests if provided, otherwise use local state
  const currentRequests = propsRequests || requests;

  // Filter and sort requests
  const filteredRequests = currentRequests
    .filter(req => 
      req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.itemBrand && req.itemBrand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      req.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'employee':
          aVal = a.employeeName.toLowerCase();
          bVal = b.employeeName.toLowerCase();
          break;
        case 'item':
          aVal = a.itemName.toLowerCase();
          bVal = b.itemName.toLowerCase();
          break;
        case 'brand':
          aVal = (a.itemBrand || '').toLowerCase();
          bVal = (b.itemBrand || '').toLowerCase();
          break;
        case 'quantity':
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case 'date':
          aVal = new Date(a.dateAdded || 0);
          bVal = new Date(b.dateAdded || 0);
          break;
        case 'status':
          aVal = a.status.toLowerCase();
          bVal = b.status.toLowerCase();
          break;
        default:
          aVal = new Date(a.dateAdded || 0);
          bVal = new Date(b.dateAdded || 0);
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return "⏳";
      case "Approved": return "✅";
      case "Finished": return "✅";
      case "Rejected": return "❌";
      default: return "•";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "pending";
      case "Approved": return "approved";
      case "Finished": return "finished";
      case "Rejected": return "rejected";
      default: return "pending";
    }
  };

  if (loading) return (
    <div className="status-page">
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <div>Loading requests...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="status-page">
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <h3 className="empty-title">Error Loading Requests</h3>
        <p className="empty-description">Failed to load requests: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="status-page">
      <button className="back-btn" onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px' }}>←</button>
      <div className="status-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 className="status-main-title">Request Status</h1>
        </div>
        <div className="status-stats">
          <div className="stat-card">
            <span className="stat-number">{currentRequests.length}</span>
            <span className="stat-label">Total Requests</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{currentRequests.filter(r => r.status === 'Pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{currentRequests.filter(r => r.status === 'Approved').length}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
      </div>

      <div className="status-container">
        <div className="status-search-section">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by employee, item, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">No Requests Found</h3>
            <p className="empty-description">
              {searchTerm ? "No requests match your search criteria." : "No requests have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="status-table-container">
            <div className="status-table-header">
              <div 
                className="table-header-cell"
                onClick={() => handleSort('employee')}
              >
                Employee
                {sortBy === 'employee' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('item')}
              >
                Item Name
                {sortBy === 'item' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('brand')}
              >
                Brand
                {sortBy === 'brand' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('quantity')}
              >
                Quantity
                {sortBy === 'quantity' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
               <div>Purpose</div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('date')}
              >
                Date
                {sortBy === 'date' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('status')}
              >
                Status
                {sortBy === 'status' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
             
            </div>

            {filteredRequests.map((req, index) => (
              <div className="status-table-row" key={index}>
                <div className="employee-cell">
                  <div className="employee-info">
                    <div className="employee-name">{req.employeeName}</div>
         
                  </div>
                </div>
                <div className="item-cell">
                  <div className="item-name">{req.itemName}</div>
                </div>
                <div className="brand-cell">
                  <div className="item-brand">{req.itemBrand }</div>
                </div>
                <div className="quantity-cell">
                  <span className="quantity-badge">{req.quantity}</span>
                </div>
                 <div className="purpose-cell">
                  <div className="purpose-content" title={req.purpose}>
                    {req.purpose}
                  </div>
                </div>
                <div className="date-cell">
                  <div className="date-info">
                    <div className="date-added">
                      {req.dateAdded ? new Date(req.dateAdded).toLocaleDateString() : 'N/A'}
                    </div>
                    
                  </div>
                </div>
                
                <div className="status-cell">
                  <span className={`status-badge ${getStatusClass(req.status)}`}>
                    {getStatusIcon(req.status)} {req.status}
                  </span>
                </div>
               
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
