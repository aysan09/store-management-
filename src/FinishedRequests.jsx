import React, { useState, useEffect } from 'react';
import './styles.css';

export default function FinishedRequests({ onBack, finishedRequests }) {
  // Use the finishedRequests passed as props instead of fetching separately
  const displayRequests = finishedRequests || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateFinished');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort requests
  const filteredRequests = displayRequests
    .filter(req => 
      req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        case 'quantity':
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case 'dateAdded':
          aVal = new Date(a.dateAdded || 0);
          bVal = new Date(b.dateAdded || 0);
          break;
        case 'dateApproved':
          aVal = new Date(a.dateApproved || 0);
          bVal = new Date(b.dateApproved || 0);
          break;
        case 'dateFinished':
          aVal = new Date(a.dateFinished || 0);
          bVal = new Date(b.dateFinished || 0);
          break;
        default:
          aVal = new Date(a.dateFinished || 0);
          bVal = new Date(b.dateFinished || 0);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="status-page">
      <div className="status-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="back-btn" onClick={onBack} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>←</button>
          <h1 className="status-main-title">Finished Requests</h1>
        </div>
        <div className="status-stats">
          <div className="stat-card">
            <span className="stat-number">{displayRequests.length}</span>
            <span className="stat-label">Total Finished</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{displayRequests.filter(r => r.dateFinished).length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{displayRequests.filter(r => !r.dateFinished).length}</span>
            <span className="stat-label">Pending Finish</span>
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
            <div className="empty-icon">✅</div>
            <h3 className="empty-title">No Finished Requests</h3>
            <p className="empty-description">
              {searchTerm ? "No finished requests match your search criteria." : "No requests have been marked as finished yet."}
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
                Item
                {sortBy === 'item' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('quantity')}
              >
                Qty
                {sortBy === 'quantity' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('dateAdded')}
              >
                Date Added
                {sortBy === 'dateAdded' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('dateApproved')}
              >
                Date Approved
                {sortBy === 'dateApproved' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div 
                className="table-header-cell"
                onClick={() => handleSort('dateFinished')}
              >
                Date Finished
                {sortBy === 'dateFinished' && (
                  <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div>Purpose</div>
              <div>Status</div>
            </div>

            {filteredRequests.map((req, index) => (
              <div className="status-table-row" key={index}>
                <div className="employee-cell">
                  <div className="employee-info">
                    <div className="employee-name">{req.employeeName}</div>
                    <div className="employee-id">ID: {req.employeeId || 'N/A'}</div>
                  </div>
                </div>
                <div className="item-cell">
                  <div className="item-info">
                    <div className="item-name">{req.itemName}</div>
                    <div className="item-category">{req.itemCategory || 'General'}</div>
                  </div>
                </div>
                <div className="quantity-cell">
                  <span className="quantity-badge">{req.quantity}</span>
                </div>
                <div className="date-cell">
                  <div className="date-info">
                    <div className="date-added">
                      {formatDate(req.dateAdded)}
                    </div>
                  </div>
                </div>
                <div className="date-cell">
                  <div className="date-info">
                    <div className="date-added">
                      {formatDate(req.dateApproved)}
                    </div>
                  </div>
                </div>
                <div className="date-cell">
                  <div className="date-info">
                    <div className="date-added">
                      {formatDate(req.dateFinished)}
                    </div>
                  </div>
                </div>
                <div className="purpose-cell">
                  <div className="purpose-content" title={req.purpose}>
                    {req.purpose}
                  </div>
                </div>
                <div className="status-cell">
                  <span className="status-badge finished">
                    ✅ Approved & Finished
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
