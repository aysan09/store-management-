import React, { useState, useEffect } from "react";
import { getImageUrl } from "./config";
import { notifyWarning, notifySuccess, notifyError } from "./utils/toastUtils";
import Header from "./components/Header";
import './styles/store-manager-styles.css';

export default function StorePage({ onBack, onRequest, items, isManager = false, onEdit, onDelete, onAddItem }) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRequesting, setIsRequesting] = useState(false);
  const itemsPerPage = 5;
  
  // Auto-select first item when items change
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
    console.log('handleRequestItem called, selectedItem:', selectedItem);
    console.log('onRequest function:', onRequest);
    
    // Always call onRequest, with or without selected item
    if (onRequest) {
      console.log('Calling onRequest');
      try {
        if (selectedItem) {
          console.log('Calling onRequest with selectedItem');
          onRequest(selectedItem);
        } else {
          console.log('Calling onRequest without selectedItem');
          onRequest();
        }
        console.log('onRequest call completed successfully');
      } catch (error) {
        console.error('Error calling onRequest:', error);
      }
    } else {
      console.log('onRequest is not defined');
    }
  };

  const handleDirectRequest = () => {
    console.log('handleDirectRequest called');
    // Navigate directly to request form
    if (onRequest) {
      console.log('Calling onRequest without parameters');
      onRequest();
    } else {
      console.log('onRequest is not defined');
    }
  };

  return (
    <div className="store-manager-page">
      {/* Header Section */}
      <header className="header-section">
        <div className="title-area">
          <h1><span className="title-icon">📦</span> Store Inventory</h1>
          <p className="subtitle">Browse available items and make requests</p>
        </div>
        <div className="header-actions">
          <button className="back-btn" onClick={onBack} style={{ position: 'relative', top: 0, left: 0, zIndex: 10 }}>← logout</button>
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
              <button 
                className="btn-request" 
                onClick={async () => {
                  // Check if selected item is out of stock and notify HR
                  if (selectedItem && selectedItem.quantity === 0) {
                    try {
                      const response = await fetch(`/api/items/${selectedItem.id}/notify-hr`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        }
                      });
                      
                      if (response.ok) {
                        // Show success popup
                        alert(`✅ Notification sent successfully!\n\nItem: ${selectedItem.model}\nBrand: ${selectedItem.brand}\nStatus: Out of Stock\n\nHR has been notified to reorder this item.`);
                        notifyWarning(`⚠️ ${selectedItem.model} is out of stock. HR has been notified to reorder.`);
                      } else {
                        throw new Error('Server error');
                      }
                    } catch (error) {
                      console.error('Failed to notify HR:', error);
                      alert(`❌ Failed to send notification to HR.\n\nItem: ${selectedItem.model}\nBrand: ${selectedItem.brand}\n\nPlease notify HR manually about this out-of-stock item.`);
                      notifyWarning(`⚠️ ${selectedItem.model} is out of stock. Please notify HR manually.`);
                    }
                  }
                  
                  // Notify about the request submission
                  notifyWarning(`📋 New request submitted. HR team should review pending requests.`);
                  handleRequestItem();
                }}
              >
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
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search products, brand, or category..." 
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
            {paginatedItems.map((item) => (
              <tr 
                key={item.id} 
                className={`${item.quantity === 0 ? 'row-out-of-stock' : ''} ${item.quantity > 0 && item.quantity <= 5 ? 'row-low-stock' : ''} ${selectedItem && selectedItem.id === item.id ? 'row-selected' : ''}`}
                onClick={() => handleItemSelect(item)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <img src={getImageUrl(item.photo)} alt={item.model} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                </td>
                <td className="model-cell start-at-center">{item.model}</td>
                <td className="brand-cell start-at-center">{item.brand}</td>
                <td className="start-at-center">{item.category || 'General'}</td>
                <td className="start-at-center">{item.quantity}</td>
                <td className="start-at-center">
                  <StatusBadge quantity={item.quantity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Item Info */}
      {selectedItem && (
        <div className="selected-item-info">
          <h3>Selected Item: {selectedItem.model}</h3>
          <p>Brand: {selectedItem.brand}</p>
          <p>Category: {selectedItem.category || 'General'}</p>
          <p>Available Quantity: {selectedItem.quantity}</p>
          <div className="selected-item-actions">
            {!isManager && (
              <button className="btn-request" onClick={handleRequestItem}>
                Request This Item
              </button>
            )}
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
  let iconColor = '#2563eb'; // Default blue
  
  if (type === 'in-stock') {
    bgColor = '#ecfdf5';
    iconColor = '#059669';
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
