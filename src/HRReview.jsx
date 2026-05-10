import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { notifySuccess, notifyError, notifyWarning } from './utils/toastUtils';
import { Menu, X as CloseIcon, Download } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

export default function HRReview({ onBack, onViewRecords, onRegisterEmployee, onEmployeeManagement, pendingRequests, setRequests }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAction = async (employeeName, itemName, quantity, status) => {
    try {
      // Find the request to get its ID
      const request = pendingRequests.find(req => 
        req.employeeName === employeeName && 
        req.itemName === itemName && 
        req.quantity === quantity
      );

      if (!request) {
        notifyError('Request not found');
        return;
      }

      setIsProcessing(true);
      setLoading(true);

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
        successMessage = `✅ Request approved successfully! ${itemName} has been approved for ${employeeName}.`;
      } else if (status === 'Rejected') {
        // Reject the request (delete it)
        response = await fetch(`/api/requests/${request.id}/reject`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        successMessage = `❌ Request rejected successfully! ${itemName} has been rejected for ${employeeName}.`;
      } else {
        notifyError('Invalid status');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove the approved/rejected request from the current list
        setRequests(prevRequests => Array.isArray(prevRequests) ? prevRequests.filter(req => req.id !== request.id) : []);
        // Also remove from filtered requests
        setSelectedRequests(new Set());
        
        notifySuccess(successMessage);
        
        // Send notification to store manager if request was approved
        if (status === 'Approved') {
          try {
            const notificationResponse = await fetch('/api/notifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: `✅ HR Approval: ${itemName} has been approved for ${employeeName}. Please prepare the item for pickup.`,
                type: 'hr_approval',
                itemId: request.id,
                itemName: itemName,
                employeeName: employeeName
              })
            });
            
            const notificationResult = await notificationResponse.json();
            if (notificationResult.success) {
              console.log('Notification sent to store manager successfully');
            } else {
              console.warn('Failed to send notification to store manager:', notificationResult.message);
            }
          } catch (notificationError) {
            console.warn('Error sending notification to store manager:', notificationError);
          }
        }
        
        // Auto-refresh the view after successful action
        setTimeout(() => {
          // Refresh can be handled by the parent component if needed
        }, 1000);
      } else {
        notifyError('Error updating request: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      notifyError('Error updating request. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  // Filter and sort pending requests
  const pendingOnly = Array.isArray(pendingRequests) ? pendingRequests.filter(req => req.status === 'Pending') : [];
  
  const filteredRequests = pendingOnly.filter(req =>
    req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.itemBrand && req.itemBrand.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
      case 'brand':
        aValue = (a.itemBrand || '').toLowerCase();
        bValue = (b.itemBrand || '').toLowerCase();
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
      
      // Update local state for successful operations - remove approved/rejected requests
      const successfulIds = results.filter(r => r.success).map(r => r.id);
      if (successfulIds.length > 0) {
        setRequests(prev => prev.filter(req => 
          !successfulIds.includes(req.id)
        ));
      }
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      notifySuccess(`${successCount} requests ${status.toLowerCase()}ed successfully. ${failCount} failed.`);
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

  // Handle export requests to Excel
  const handleExportRequests = async () => {
    try {
      notifySuccess('Exporting requests to Excel...');
      const response = await fetch('/api/requests/export');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Create blob from response and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `requests_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      notifySuccess('Requests exported successfully!');
    } catch (error) {
      console.error('Error exporting requests:', error);
      notifyError('Failed to export requests');
    }
  };

  return (
    <>
      <div className="status-page">
        <header className="status-header-row">
          <button className="back-btn" onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px' }}>← Back</button>
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
          {/* Desktop Actions Bar */}
          <div className="hr-actions-bar desktop-actions-bar">
            <button className="header-action-btn records-btn" onClick={onViewRecords}>
              <span className="btn-icon">📋</span>
              <span className="btn-text">Records</span>
            </button>
            <button className="header-action-btn employee-mgmt-btn" onClick={() => {
              if (onEmployeeManagement) {
                onEmployeeManagement();
              }
            }}>
              <span className="btn-icon">👥</span>
              <span className="btn-text">Employee Management</span>
            </button>
            <button className="header-action-btn register-btn" onClick={() => {
              if (onRegisterEmployee) {
                onRegisterEmployee();
              }
            }}>
              <span className="btn-icon">➕</span>
              <span className="btn-text">Register Employee</span>
            </button>
            <button className="header-action-btn export-btn" onClick={handleExportRequests}>
              <span className="btn-icon"><Download size={16} /></span>
              <span className="btn-text">Export Requests</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button className="mobile-hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="mobile-menu-dropdown hr-mobile-menu">
              <div className="mobile-menu-header">
                <span>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                  <CloseIcon size={20} />
                </button>
              </div>
              <div className="mobile-menu-items">
                <button onClick={() => { onViewRecords(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                  <span className="mobile-menu-icon">📋</span>
                  Records
                </button>
                <button onClick={() => { if (onEmployeeManagement) onEmployeeManagement(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                  <span className="mobile-menu-icon">👥</span>
                  Employee Management
                </button>
                <button onClick={() => { if (onRegisterEmployee) onRegisterEmployee(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                  <span className="mobile-menu-icon">➕</span>
                  Register Employee
                </button>
                <button onClick={() => { handleExportRequests(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                  <span className="mobile-menu-icon">📥</span>
                  Export Requests
                </button>
              </div>
            </div>
          )}
        </header>
        
        <div className="status-container">
          {/* Search and Filter Section */}
          <div className="hr-search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by employee, item, brand, or purpose..."
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
                className={`sort-btn ${sortBy === 'brand' ? 'active' : ''}`}
                onClick={() => handleSort('brand')}
              >
                Brand {sortBy === 'brand' && (sortOrder === 'asc' ? '↑' : '↓')}
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
              <div className="table-header-cell" onClick={() => handleSort('brand')}>
                Brand {sortBy === 'brand' && (sortOrder === 'asc' ? '↑' : '↓')}
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
              <div className={`hr-table-row ${req.isOutOfStockNotification ? 'out-of-stock-notification-row' : ''}`} key={req.id || index}>
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
                  </div>
                </div>
                <div className="table-cell brand-cell">
                  {req.itemBrand || 'N/A'}
                </div>
                <div className="table-cell quantity-cell">
                  <span className={`quantity-badge ${req.isOutOfStockNotification ? 'out-of-stock-badge' : ''}`}>
                    {req.isOutOfStockNotification ? '⚠️ Out of Stock' : req.quantity}
                  </span>
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
                      className={`approve-btn ${req.isOutOfStockNotification ? 'out-of-stock-approve-btn' : ''}`} 
                      onClick={() => handleAction(req.employeeName, req.itemName, req.quantity, 'Approved')}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : req.isOutOfStockNotification ? 'Reorder Item' : 'Approve'}
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
      <ToastContainer />
    </>
  );
}