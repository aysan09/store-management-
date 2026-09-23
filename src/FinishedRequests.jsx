import React, { useState } from 'react';
import './styles.css';
import { notifySuccess, notifyError, notifyInfo } from './utils/toastUtils';
import SortDropdown from './components/SortDropdown';
import ExpandableSearch from './components/ExpandableSearch';

export default function FinishedRequests({ onBack, finishedRequests }) {
  const displayRequests = finishedRequests || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateFinished');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportHovered, setIsExportHovered] = useState(false);

  // Filter and sort requests
  const filteredRequests = displayRequests
    .filter(req => 
      (req.employeeName && req.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.itemName && req.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.itemBrand && req.itemBrand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.status && req.status.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'employee':
          aVal = (a.employeeName || '').toLowerCase();
          bVal = (b.employeeName || '').toLowerCase();
          break;
        case 'item':
          aVal = (a.itemName || '').toLowerCase();
          bVal = (b.itemName || '').toLowerCase();
          break;
        case 'brand':
          aVal = (a.itemBrand || '').toLowerCase();
          bVal = (b.itemBrand || '').toLowerCase();
          break;
        case 'quantity':
          aVal = a.quantity || 0;
          bVal = b.quantity || 0;
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

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const stringVal = String(str);
    return `"${stringVal.replace(/"/g, '""')}"`;
  };

  const handleExport = async () => {
    if (isExporting) return;

    if (filteredRequests.length === 0) {
      notifyError('No finished requests available to export');
      return;
    }

    try {
      setIsExporting(true);
      notifyInfo('Preparing CSV export file...');

      await new Promise((resolve) => setTimeout(resolve, 600));

      const headers = [
        'Employee Name',
        'Employee ID',
        'Item Name',
        'Brand',
        'Quantity',
        'Date Added',
        'Date Approved',
        'Date Finished',
        'Purpose',
        'Status'
      ];

      const rows = filteredRequests.map(req => [
        escapeCsv(req.employeeName || ''),
        escapeCsv(req.employeeId || 'N/A'),
        escapeCsv(req.itemName || ''),
        escapeCsv(req.itemBrand || ''),
        req.quantity || 0,
        escapeCsv(req.dateAdded || 'N/A'),
        escapeCsv(req.dateApproved || 'N/A'),
        escapeCsv(req.dateFinished || 'N/A'),
        escapeCsv(req.purpose || ''),
        escapeCsv(req.status || 'Finished')
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const fileName = `finished_requests_${new Date().toISOString().slice(0, 10)}.csv`;
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notifySuccess(`Successfully exported ${filteredRequests.length} records!`);
    } catch (error) {
      console.error('Error during CSV export:', error);
      notifyError('Failed to generate export file');
    } finally {
      setIsExporting(false);
    }
  };

  // Inline style definitions strictly for the Export button and spinner
  const isDisabled = isExporting || filteredRequests.length === 0;

  const exportButtonStyle = {
    backgroundColor: isExporting ? '#0369a1' : (isExportHovered && !isDisabled ? '#0369a1' : '#0284c7'),
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: filteredRequests.length === 0 ? 0.6 : 1,
    transition: 'all 0.2s ease-in-out',
    boxShadow: isExportHovered && !isDisabled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
  };

  return (
    <div className="status-page">
      {/* Keyframe animation injected inline purely for the export button spinner */}
      <style>
        {`
          @keyframes inlineExportSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className="status-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            className="back-btn" 
            onClick={onBack} 
            style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
          >
            ←
          </button>
          <h1 className="status-main-title">Finished Requests</h1>
        </div>

        {/* --- Export Button styled entirely with inline styles --- */}
        <button 
          style={exportButtonStyle}
          onClick={handleExport}
          onMouseEnter={() => setIsExportHovered(true)}
          onMouseLeave={() => setIsExportHovered(false)}
          disabled={isDisabled}
        >
          {isExporting ? (
            <>
              <span style={{ display: 'inline-block', animation: 'inlineExportSpin 1s linear infinite' }}>⏳</span>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '16px' }}>📥</span>
              <span>Export CSV</span>
            </>
          )}
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
          <div className="status-table-container finished-requests-table">
            <div className="status-table-header">
              <div className="table-header-cell">Employee</div>
              <div className="table-header-cell">Item</div>
              <div className="table-header-cell">Brand</div>
              <div className="table-header-cell">Qty</div>
              <div className="table-header-cell">Date Added</div>
              <div className="table-header-cell">Date Approved</div>
              <div className="table-header-cell">Date Finished</div>
              <div className="table-header-cell">Purpose</div>
              <div className="table-header-cell">Status</div>
            </div>

            {filteredRequests.map((req, index) => (
              <div className="status-table-row" key={req.id || index}>
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
                  {req.itemBrand || '—'}
                </div>
                <div className="quantity-cell" data-label="Quantity">
                  <span className="quantity-badge">{req.quantity}</span>
                </div>
                <div className="date-cell" data-label="Date Added">
                  <div className="date-info">
                    <div className="date-added">{req.dateAdded || 'N/A'}</div>
                  </div>
                </div>
                <div className="date-cell" data-label="Date Approved">
                  <div className="date-info">
                    <div className="date-added">{req.dateApproved || 'N/A'}</div>
                  </div>
                </div>
                <div className="date-cell" data-label="Date Finished">
                  <div className="date-info">
                    <div className="date-added">{req.dateFinished || 'N/A'}</div>
                  </div>
                </div>
                <div className="purpose-cell" data-label="Purpose">
                  <div className="purpose-content" title={req.purpose}>
                    {req.purpose || '—'}
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