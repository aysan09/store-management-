import React, { useState } from "react";
import { getImageUrl } from "./config";
import './styles/store-manager-styles.css';

export default function StorePage({ onBack, onRequest, items, isManager = false, onEdit, onDelete, onAddItem }) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  
  console.log('StorePage received items:', items);
  const filteredItems = items.filter(item => 
    item.model.toLowerCase().includes(search.toLowerCase()) ||
    item.brand.toLowerCase().includes(search.toLowerCase())
  );

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
          <button className="back-btn" onClick={onBack}>← Back</button>
          {isManager ? (
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="btn-request" onClick={() => onAddItem && onAddItem()}>
                + Add New Item
              </button>
              <button className="btn-edit-del" onClick={() => {}}>
                View Requests
              </button>
            </div>
          ) : (
            <button 
              className="btn-request" 
              onClick={handleRequestItem}
            >
              Make Request
            </button>
          )}
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <StatCard icon="📦" label="Total Products" value={items.length} type="total" />
        <StatCard icon="✅" label="In Stock" value={items.filter(item => item.quantity > 0).length} type="in-stock" />
        <StatCard icon="⚠️" label="Low Stock" value={items.filter(item => item.quantity > 0 && item.quantity < 5).length} type="low-stock" />
        <StatCard icon="❌" label="Out of Stock" value={items.filter(item => item.quantity === 0).length} type="out-of-stock" />
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
            {filteredItems.map((item) => (
              <tr 
                key={item.id} 
                className={`${item.quantity === 0 ? 'row-out-of-stock' : ''} ${selectedItem && selectedItem.id === item.id ? 'row-selected' : ''}`}
                onClick={() => handleItemSelect(item)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <img src={getImageUrl(item.photo)} alt={item.model} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                </td>
                <td className="model-cell">{item.model}</td>
                <td className="brand-cell">{item.brand}</td>
                <td>{item.category || 'General'}</td>
                <td>{item.quantity}</td>
                <td>
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
  return (
    <span className={`status-badge ${isOut ? 'badge-out' : 'badge-in'}`}>
      {isOut ? '❌ Out of Stock' : `✅ ${quantity} in stock`}
    </span>
  );
}
