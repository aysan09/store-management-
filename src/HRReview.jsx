import React, { useState, useEffect } from 'react';

export default function HRReview({ onBack, onViewRecords, onRegisterEmployee, onEmployeeManagement, pendingRequests, setRequests }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

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

      let response;
      let successMessage;

      if (status === 'Approved') {
        // Approve the request
        response = await fetch(`/api/requests/${request.id}/approve`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        successMessage = 'Request approved successfully!';
      } else if (status === 'Rejected') {
        // Reject the request (delete it)
        response = await fetch(`/api/requests/${request.id}/reject`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        successMessage = 'Request rejected successfully!';
      } else {
        alert('Invalid status');
        return;
      }

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
        
        alert(successMessage);
      } else {
        alert('Error updating request: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error updating request. Please try again.');
    }
  };

  // Filter and sort pending requests
  const pendingOnly = pendingRequests.filter(req => req.status === 'Pending');
  
  const filteredRequests = pendingOnly.filter(req =>
    req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'employee':
        aValue = a.employeeName.toLowerCase();
        bValue = b.employeeName.toLowerCase();
        break;
      case 'item':
        aValue = a.itemName.toLowerCase();
        bValue = b.itemName.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.dateAdded || a.dateRequested || 0);
        bValue = new Date(b.dateAdded || b.dateRequested || 0);
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectRequest = (requestId) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRequests.size === sortedRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(sortedRequests.map(req => req.id)));
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedRequests.size === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = [];
      for (const requestId of selectedRequests) {
        const request = pendingRequests.find(req => req.id === requestId);
        if (!request) continue;

        let response;
        if (status === 'Approved') {
          response = await fetch(`/api/requests/${request.id}/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
        } else {
          response = await fetch(`/api/requests/${request.id}/reject`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await response.json();
        results.push({ id: requestId, success: result.success, message: result.message });
      }
      
      // Update local state for successful operations
      const successfulIds = results.filter(r => r.success).map(r => r.id);
      if (successfulIds.length > 0) {
        setRequests(prev => prev.map(req => 
          successfulIds.includes(req.id) 
            ? { 
                ...req, 
                status,
                ...(status === 'Approved' && { dateApproved: new Date().toISOString().split('T')[0] })
              } 
            : req
        ));
      }
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      alert(`${successCount} requests ${status.toLowerCase()}ed successfully. ${failCount} failed.`);
      setSelectedRequests(new Set());
    } catch (error) {
      console.error('Bulk action error:', error);
      setError('Bulk action failed. Please try individual actions.');
    } finally {
      setLoading(false);
    }
  };

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="status-page">
      <header className="status-header-row">
        <button className="back-btn" onClick={onBack}>← Logout</button>
        <div className="hr-header-content">
          <h1 className="status-main-title">HR Review</h1>
          <div className="hr-stats">
            <div className="stat-card">
              <span className="stat-number">{pendingOnly.length}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{filteredRequests.length}</span>
              <span className="stat-label">Showing</span>
            </div>
          </div>
        </div>
        <div className="hr-actions-bar">
          <button className="records-btn" onClick={onViewRecords}>Records</button>
          <button className="records-btn" style={{backgroundColor: '#3b82f6'}} onClick={() => {
            if (onEmployeeManagement) {
              onEmployeeManagement();
            }
          }}>Employee Management</button>
          <button className="records-btn" style={{backgroundColor: '#10b981'}} onClick={() => {
            if (onRegisterEmployee) {
              onRegisterEmployee();
            }
          }}>Register Employee</button>
        </div>
      </header>
      
      <div className="status-container">
        {/* Search and Filter Section */}
        <div className="hr-search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by employee, item, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="sort-controls">
            <span className="sort-label">Sort by:</span>
            <button 
              className={`sort-btn ${sortBy === 'employee' ? 'active' : ''}`}
              onClick={() => handleSort('employee')}
            >
              Employee {sortBy === 'employee' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'item' ? 'active' : ''}`}
              onClick={() => handleSort('item')}
            >
              Item {sortBy === 'item' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => handleSort('date')}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'quantity' ? 'active' : ''}`}
              onClick={() => handleSort('quantity')}
            >
              Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRequests.size > 0 && (
          <div className="bulk-actions-bar">
            <div className="bulk-info">
              <span className="bulk-count">{selectedRequests.size} selected</span>
              <button className="bulk-clear-btn" onClick={() => setSelectedRequests(new Set())}>
                Clear Selection
              </button>
            </div>
            <div className="bulk-actions">
              <button 
                className="bulk-approve-btn" 
                onClick={() => handleBulkAction('Approved')}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Approve Selected (${selectedRequests.size})`}
              </button>
              <button 
                className="bulk-reject-btn" 
                onClick={() => handleBulkAction('Rejected')}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Reject Selected (${selectedRequests.size})`}
              </button>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="hr-table-header">
          <div className="table-header-cell checkbox-cell">
            <input
              type="checkbox"
              checked={selectedRequests.size === sortedRequests.length && sortedRequests.length > 0}
              onChange={handleSelectAll}
              className="select-all-checkbox"
            />
          </div>
          <div className="table-header-cell" onClick={() => handleSort('employee')}>
            Employee {sortBy === 'employee' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="table-header-cell" onClick={() => handleSort('item')}>
            Item {sortBy === 'item' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="table-header-cell" onClick={() => handleSort('quantity')}>
            Qty {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="table-header-cell" onClick={() => handleSort('date')}>
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="table-header-cell">Purpose</div>
          <div className="table-header-cell">Action</div>
        </div>

        {/* Table Content */}
        {sortedRequests.length > 0 ? (
          sortedRequests.map((req, index) => (
            <div className="hr-table-row" key={req.id || index}>
              <div className="table-cell checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedRequests.has(req.id)}
                  onChange={() => handleSelectRequest(req.id)}
                  className="select-checkbox"
                />
              </div>
              <div className="table-cell employee-cell">
                <div className="employee-info">
                  <div className="employee-name">{req.employeeName}</div>
                  <div className="employee-id">ID: {req.employeeId || 'N/A'}</div>
                </div>
              </div>
              <div className="table-cell item-cell">
                <div className="item-info">
                  <div className="item-name">{req.itemName}</div>
                  <div className="item-category">{req.category || 'General'}</div>
                </div>
              </div>
              <div className="table-cell quantity-cell">
                <span className="quantity-badge">{req.quantity}</span>
              </div>
              <div className="table-cell date-cell">
                <div className="date-info">
                  <span className="date-added">{req.dateAdded || req.dateRequested || 'N/A'}</span>
                  <span className="date-time">{new Date(req.dateAdded || req.dateRequested || Date.now()).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="table-cell purpose-cell">
                <div className="purpose-content" title={req.purpose}>
                  {req.purpose}
                </div>
              </div>
              <div className="table-cell action-cell">
                <div className="hr-actions">
                  <button 
                    className="approve-btn" 
                    onClick={() => handleAction(req.employeeName, req.itemName, req.quantity, 'Approved')}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    className="reject-btn" 
                    onClick={() => handleAction(req.employeeName, req.itemName, req.quantity, 'Rejected')}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-requests">
            <div className="no-requests-icon">📋</div>
            <h3>No pending requests found</h3>
            <p>{searchTerm ? 'Try adjusting your search terms or filters.' : 'All requests have been processed.'}</p>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="modal-overlay" onClick={closeRequestDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Request Details</h3>
                <button className="modal-close" onClick={closeRequestDetails}>×</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span className="detail-label">Employee:</span>
                  <span className="detail-value">{selectedRequest.employeeName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Employee ID:</span>
                  <span className="detail-value">{selectedRequest.employeeId || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Item:</span>
                  <span className="detail-value">{selectedRequest.itemName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedRequest.category || 'General'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{selectedRequest.quantity}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date Requested:</span>
                  <span className="detail-value">{selectedRequest.dateAdded || selectedRequest.dateRequested || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Purpose:</span>
                  <span className="detail-value purpose-detail">{selectedRequest.purpose}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="modal-approve-btn" 
                  onClick={() => {
                    handleAction(selectedRequest.employeeName, selectedRequest.itemName, selectedRequest.quantity, 'Approved');
                    closeRequestDetails();
                  }}
                  disabled={loading}
                >
                  Approve
                </button>
                <button 
                  className="modal-reject-btn" 
                  onClick={() => {
                    handleAction(selectedRequest.employeeName, selectedRequest.itemName, selectedRequest.quantity, 'Rejected');
                    closeRequestDetails();
                  }}
                  disabled={loading}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
