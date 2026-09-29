import React, { useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import "./styles.css";
import ExpandableSearch from './components/ExpandableSearch';
import { notifySuccess, notifyError } from './utils/toastUtils';

export default function HRRecords({ onBack, allRequests, onGoToHRReview, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // Filter for requests that are NOT pending
  const records = allRequests.filter(req =>
    req.status !== "Pending" &&
    [req.employeeName, req.itemName, req.itemBrand, req.purpose, req.status]
      .some(value => String(value || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRefresh = async () => {
    if (isRefreshing || typeof onRefresh !== 'function') return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      notifySuccess('Records refreshed');
    } catch (error) {
      console.error('Error refreshing records:', error);
      notifyError('Failed to refresh records');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportRecords = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      notifySuccess('Exporting records to Excel...');
      // Records page shows processed (non-pending) requests; export those from the server,
      // falling back to a client-side CSV if the export endpoint is unavailable.
      const response = await fetch('/api/requests/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `hr_records_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        notifySuccess('Records exported successfully!');
      } else {
        throw new Error('Export endpoint unavailable');
      }
    } catch (error) {
      console.error('Error exporting records:', error);
      // Client-side CSV fallback so the button still produces a file.
      try {
        const headers = ['Employee', 'Employee ID', 'Item', 'Brand', 'Quantity', 'Date', 'Purpose', 'Status'];
        const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const rows = records.map(req => [
          req.employeeName,
          req.employeeId,
          req.itemName,
          req.itemBrand,
          req.quantity,
          req.dateAdded,
          req.purpose,
          req.status
        ].map(escapeCsv).join(','));
        const csv = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `hr_records_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        notifySuccess('Records exported as CSV.');
      } catch (fallbackError) {
        console.error('CSV fallback failed:', fallbackError);
        notifyError('Failed to export records');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="hr-records-page">
      <div className="hr-records-header">
        <button className="back-btn" onClick={() => { console.log('HRRecords back button clicked, calling onBack:', onBack); onBack && onBack(); }} style={{ position: 'absolute', top: '20px', left: '20px' }}>← Back to HR Review</button>
        <h1 className="hr-records-title">HR Records</h1>
        <div className="hr-records-header-actions">
          <button
            type="button"
            className="hr-records-refresh-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh records"
            aria-label="Refresh records"
          >
            <RefreshCw className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hr-records-export-btn export-btn"
            onClick={handleExportRecords}
            disabled={isExporting}
            title="Export records"
            aria-label="Export records"
          >
            <Download className="export-icon" aria-hidden="true" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      <div className="hr-records-container">
        <div className="hr-records-search-section">
          <ExpandableSearch
            placeholder="Search records..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <div className="hr-records-table-container">
          <div className="hr-records-table-header">
            <div className="table-header-cell">Employee</div>
            <div className="table-header-cell">Item</div>
            <div className="table-header-cell">Brand</div>
            <div className="table-header-cell">Quantity</div>
            <div className="table-header-cell">Date</div>
            <div className="table-header-cell">Purpose</div>
            <div className="table-header-cell">Status</div>
          </div>

          {records.length > 0 ? (
            records.map((req, index) => (
              <div className="hr-records-table-row" key={index}>
                <div className="table-cell employee-cell" data-label="Employee">
                  <div className="employee-info">
                    <div className="employee-name">{req.employeeName}</div>
                    <div className="employee-id">ID: {req.employeeId || 'N/A'}</div>
                  </div>
                </div>
                <div className="table-cell item-cell" data-label="Item">
                  <div className="item-info">
                    <div className="item-name">{req.itemName}</div>
                    <div className="item-category">Category: {req.itemCategory || 'General'}</div>
                  </div>
                </div>
                <div className="table-cell brand-cell" data-label="Brand">
                  <span className="brand-name">{req.itemBrand || 'N/A'}</span>
                </div>
                <div className="table-cell quantity-cell" data-label="Quantity">
                  <span className="quantity-badge">{req.quantity}</span>
                </div>
                <div className="table-cell date-cell" data-label="Date">
                  <div className="date-info">
                    <div className="date-added">{req.dateAdded || 'N/A'}</div>
                    <div className="date-time">{req.timeAdded || ''}</div>
                  </div>
                </div>
                <div className="table-cell purpose-cell" data-label="Purpose">
                  <div className="purpose-content">{req.purpose}</div>
                </div>
                <div className="table-cell status-cell" data-label="Status">
                  <span className={`status-badge ${req.status.toLowerCase()}`}>
                    {req.status === "Approved" ? "✅ Approved" : 
                     req.status === "Finished" ? "✅ Finished" : 
                     req.status === "Rejected" ? "❌ Rejected" : req.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">No Records Found</h3>
              <p className="empty-description">No processed request records are available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
