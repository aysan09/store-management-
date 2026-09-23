import React, { useState, useEffect } from "react";
import { getImageUrl } from "./config";
import Header from "./components/Header";
import ExpandableSearch from './components/ExpandableSearch';
import { LogOut } from 'lucide-react';
import './styles/store-manager-styles.css';

export default function StorePage({ onBack, onRequest, items, isManager = false, onEdit, onDelete, onAddItem }) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showOutOfStockNotice, setShowOutOfStockNotice] = useState(false);
  const itemsPerPage = 5;

  // Keep a selected item available for the employee's next request.
  useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);
  
  console.log('StorePage received items:', items);
  const filteredItems = items.filter(item => 
    item.model.toLowerCase().includes(search.toLowerCase()) ||
    item.brand.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const handleRequestItem = () => {
    if (!onRequest) return;
    onRequest(selectedItem || undefined);
  };

  const handleMakeRequest = () => {
    if (selectedItem && Number(selectedItem.quantity) === 0) {
      setShowOutOfStockNotice(true);
      return;
    }

    handleRequestItem();
  };

  return (
    <div className="store-manager-page">
      {/* Header Section */}
      <header className="header-section">
        <div className="title-area">
          <h1><span className="title-icon">📦</span> Store Inventory</h1>
          <p className="subtitle">Browse available items and make requests</p>
        </div>
        <div className={`header-actions ${isManager ? '' : 'employee-store-actions'}`}>
          <button
            className="back-btn"
            onClick={onBack}
            style={{ position: 'relative', top: 0, left: 0, zIndex: 10 }}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
          {isManager ? (
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="btn-request" onClick={() => onAddItem && onAddItem()}>
                + Add New Item
              </button>
              <button 
                className="btn-edit-del" 
                onClick={async () => {
                  // Check for out-of-stock items and notify HR
                  const outOfStockItems = items.filter(item => item.quantity === 0);
                  if (outOfStockItems.length > 0) {
                    // Send notifications for each out-of-stock item
                    for (const item of outOfStockItems) {
                      try {
                        await fetch(`/api/items/${item.id}/notify-hr`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        });
                      } catch (error) {
                        console.error('Failed to notify HR for item:', item.model, error);
                      }
                    }
                    const itemNames = outOfStockItems.map(item => item.model).join(', ');
                    notifyWarning(`⚠️ ${outOfStockItems.length} item(s) are out of stock: ${itemNames}. HR has been notified.`);
                  }
                  // Navigate to requests view
                  if (onRequest) {
                    onRequest();
                  }
                }}
              >
                View Requests
              </button>
            </div>
          ) : (
              <button className="btn-request" onClick={handleMakeRequest}>
                📋 Make Request
              </button>
          )}
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <StatCard icon="📦" label="Total Products" value={items.length} type="total" className="total-card" />
        <StatCard icon="✅" label="In Stock" value={items.filter(item => item.quantity > 5).length} type="in-stock" className="in-stock-card" />
        <StatCard icon="⚠️" label="Low Stock" value={items.filter(item => item.quantity > 0 && item.quantity <= 5).length} type="low-stock" className="low-stock-card" />
        <StatCard icon="❌" label="Out of Stock" value={items.filter(item => item.quantity === 0).length} type="out-of-stock" className="out-of-stock-card" />
      </section>

      {/* Search Bar */}
      <ExpandableSearch
        className="search-container"
        placeholder="Search products, brand, or category..."
        value={search}
        onChange={setSearch}
      />

      {/* Table */}
      <div className="inventory-table-container">
        <table className="main-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Model</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length > 0 ? paginatedItems.map((item) => (
              <tr 
                key={item.id} 
                className={`${item.quantity === 0 ? 'row-out-of-stock' : ''} ${item.quantity > 0 && item.quantity <= 5 ? 'row-low-stock' : ''} ${selectedItem && selectedItem.id === item.id ? 'row-selected' : ''}`}
                onClick={() => handleItemSelect(item)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <img src={getImageUrl(item.photo)} alt={item.model} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                </td>
                <td className="model-cell start-at-center">
                  <span className="product-model-label">Model</span>
                  <span className="product-model-value">{item.model}</span>
                </td>
                <td className="brand-cell start-at-center">{item.brand}</td>
                <td className="start-at-center">{item.category || 'General'}</td>
                <td className="start-at-center">{item.quantity}</td>
                <td className="start-at-center">
                  <StatusBadge quantity={item.quantity} />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No inventory items are available yet. Please ask the Store Manager to add items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showOutOfStockNotice && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowOutOfStockNotice(false)}>
          <div className="modal-content out-of-stock-notice" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">⚠️</div>
              <h3>Item out of stock</h3>
              <p className="modal-subtitle">
                {selectedItem.model} is currently unavailable. Please contact the Store Manager.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-edit-del" onClick={() => setShowOutOfStockNotice(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNum => (
              <button
                key={pageNum}
                className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button 
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, type }) {
  // Determine background color based on stat type
  let bgColor = '#eff6ff'; // Default blue
  let iconColor = '#3ba7f2'; // Default blue
  
  if (type === 'in-stock') {
    bgColor = '#ecfdf5';
    iconColor = '#3ba7f2';
  } else if (type === 'low-stock') {
    bgColor = '#fffbeb';
    iconColor = '#d97706';
  } else if (type === 'out-of-stock') {
    bgColor = '#fee2e2';
    iconColor = '#dc2626';
  }

  return (
    <div className="stat-card">
      <div className="icon-wrapper" style={{ background: bgColor }}>
        <span style={{ fontSize: '24px', color: iconColor }}>{icon}</span>
      </div>
      <div className="stat-content">
        <span className="val">{value}</span>
        <span className="lbl">{label}</span>
      </div>
    </div>
  );
}

function StatusBadge({ quantity }) {
  const isOut = quantity === 0;
  const isLow = quantity > 0 && quantity <= 5;
  
  return (
    <span className={`status-badge ${isOut ? 'badge-out' : isLow ? 'low-stock' : 'badge-in'}`}>
      {isOut ? '❌ Out of Stock' : isLow ? `⚠️ Low Stock (${quantity})` : `✅ ${quantity} in stock`}
    </span>
  );
}
