import React, { useState, useEffect } from 'react';
import './styles.css';
import { notifySuccess, notifyError, notifyInfo } from './utils/toastUtils';
import SortDropdown from './components/SortDropdown';
import ExpandableSearch from './components/ExpandableSearch';

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

  // Export finished requests to Excel (CSV format)
  const handleExport = () => {
    try {
      notifyInfo('Exporting finished requests...');
      
      if (filteredRequests.length === 0) {
        notifyError('No finished requests to export');
        return;
      }

      // Create CSV content
      const headers = ['Employee', 'Item', 'Brand', 'Quantity', 'Date Added', 'Date Approved', 'Date Finished', 'Purpose', 'Status'];
      const csvContent = [
        headers.join(','),
        ...filteredRequests.map(req => [
          `"${req.employeeName || ''}"`,
          `"${req.itemName || ''}"`,
          `"${req.itemBrand || ''}"`,
          req.quantity || 0,
          `"${req.dateAdded || ''}"`,
          `"${req.dateApproved || ''}"`,
          `"${req.dateFinished || ''}"`,
          `"${req.purpose || ''}"`,
          `"${req.status || 'Finished'}"`
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finished_requests_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notifySuccess(`Exported ${filteredRequests.length} finished requests`);
    } catch (error) {
      console.error('Error exporting finished requests:', error);
      notifyError('Failed to export finished requests');
    }
  };

  return (
    <div className="status-page">
      <div className="status-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="back-btn" onClick={onBack} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>←</button>
          <h1 className="status-main-title">Finished Requests</h1>
        </div>
        <button 
          className="records-btn" 
          style={{ background: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={handleExport}
        >
          📥 Export
        </button>
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
          <ExpandableSearch
            placeholder="Search by employee, item, or status..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <div className="sort-controls">
            <SortDropdown
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'item', label: 'Item' },
                { value: 'brand', label: 'Brand' },
                { value: 'quantity', label: 'Quantity' },
                { value: 'dateAdded', label: 'Date Added' },
                { value: 'dateApproved', label: 'Date Approved' },
                { value: 'dateFinished', label: 'Date Finished' }
              ]}
              value={sortBy}
              order={sortOrder}
              onChange={handleSort}
            />
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
              <div className="table-header-cell">Employee</div>
              <div className="table-header-cell">Item</div>
              <div className="table-header-cell">Brand</div>
              <div className="table-header-cell">Qty</div>
              <div className="table-header-cell">Date Added</div>
              <div className="table-header-cell">Date Approved</div>
              <div className="table-header-cell">Date Finished</div>
              <div>Purpose</div>
              <div>Status</div>
            </div>

            {filteredRequests.map((req, index) => (
              <div className="status-table-row" key={index}>
                <div className="employee-cell" data-label="Employee">
                  <div className="employee-info">
                    <div className="employee-name">{req.employeeName}</div>
                    <div className="employee-id">ID: {req.employeeId || 'N/A'}</div>
                  </div>
                </div>
                <div className="item-cell" data-label="Item">
                  <div className="item-info">
                    <div className="item-name">{req.itemName}</div>
                  </div>
                </div>
                <div className="brand-cell" data-label="Brand">
                  {req.itemBrand}
                </div>
                <div className="quantity-cell" data-label="Quantity">
                  <span className="quantity-badge">{req.quantity}</span>
                </div>
                <div className="date-cell" data-label="Date Added">
                  <div className="date-info">
                    <div className="date-added">
                      {(req.dateAdded)}
                    </div>
                  </div>
                </div>
                <div className="date-cell" data-label="Date Approved">
                  <div className="date-info">
                    <div className="date-added">
                      {(req.dateApproved)}
                    </div>
                  </div>
                </div>
                <div className="date-cell" data-label="Date Finished">
                  <div className="date-info">
                    <div className="date-added">
                      {(req.dateFinished)}
                    </div>
                  </div>
                </div>
                <div className="purpose-cell" data-label="Purpose">
                  <div className="purpose-content" title={req.purpose}>
                    {req.purpose}
                  </div>
                </div>
                <div className="status-cell" data-label="Status">
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
