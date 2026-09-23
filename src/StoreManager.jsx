import React, { useState } from "react";
import AddItemModal from "./AddItemModal";
import { notifySuccess, notifyError, notifyInfo } from "./utils/toastUtils";
import './styles/store-manager-styles.css';
import ExpandableSearch from './components/ExpandableSearch';

export default function StoreManager({ onBack, inventory, setInventory, onViewRequests }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  
  // Bell animation trigger state
  const [isRinging, setIsRinging] = useState(false);
  const [bellKey, setBellKey] = useState(0);

  // Opens the delete confirmation modal
  const handleDelete = (id) => {
    const item = inventory.find(item => item.id === id);
    if (item) setItemToDelete(item);
  };

  // Runs after the user confirms deletion
  const confirmDelete = () => {
    if (!itemToDelete) return;
    setInventory(inventory.filter(item => item.id !== itemToDelete.id));
    notifySuccess(`✅ Successfully deleted "${itemToDelete.model}" from inventory.`);
    setItemToDelete(null);
  };

  // Trigger bell swing animation
  const handleRequestsClick = () => {
    setBellKey(prev => prev + 1); // Remounts SVG to restart animation
    setIsRinging(true);
    
    setTimeout(() => {
      setIsRinging(false);
    }, 800);

    if (onViewRequests) onViewRequests();
  };

  // Export inventory to Excel
  const handleExport = async () => {
    try {
      notifyInfo('Exporting inventory to Excel...');
      const response = await fetch('/api/items/export');

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `items_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notifySuccess('Inventory exported successfully!');
    } catch (error) {
      console.error('Error exporting items:', error);
      notifyError('Failed to export items');
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
  };

  // Calculate statistics
  const totalProducts = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity < 5).length;
  const outOfStockItems = inventory.filter(item => item.quantity === 0).length;

  // Filter inventory based on search
  const filteredInventory = inventory.filter(item =>
    item.model.toLowerCase().includes(search.toLowerCase()) ||
    item.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="store-manager-page">
      {/* Keyframe animations injected directly */}
      <style>{`
        @keyframes svgBellSwing {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(25deg); }
          30% { transform: rotate(-22deg); }
          45% { transform: rotate(18deg); }
          60% { transform: rotate(-12deg); }
          75% { transform: rotate(6deg); }
          100% { transform: rotate(0deg); }
        }

        .bell-svg-ringing {
          transform-origin: 12px 2px !important; /* Swing from top loop */
          animation: svgBellSwing 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) !important;
        }

        /* Responsive click active scale effect */
        .click-animate {
          transition: transform 0.1s ease !important;
          user-select: none;
        }

        .click-animate:active {
          transform: scale(0.92) !important;
        }
      `}</style>

      <div className="store-manager-header">
        <button 
          className="back-btn click-animate" 
          onClick={onBack} 
          style={{ position: 'relative' }}
        >
          ← Logout
        </button>
        <h1 className="store-manager-title">Store Manager</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="records-btn click-animate" 
            style={{ background: '#3ba7f2' }} 
            onClick={() => setShowAddModal(true)}
          >
            + Add New Item
          </button>
          
          <button 
            className="records-btn click-animate" 
            style={{ 
              background: '#3ba7f2', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px' 
            }} 
            onClick={handleRequestsClick}
          >
            {/* SVG Bell Icon with explicit top pivot transform-origin */}
            <svg
              key={bellKey}
              className={isRinging ? 'bell-svg-ringing' : ''}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            >
              <path d="M12 2a2 2 0 0 0-2 2v1.07A7.002 7.002 0 0 0 4 12v5l-2 2v1h20v-1l-2-2v-5a7.002 7.002 0 0 0-6-6.93V4a2 2 0 0 0-2-2zm0 20a3 3 0 0 0 3-3h-6a3 3 0 0 0 3 3z" />
            </svg>
            <span>View Requests</span>
          </button>

          <button 
            className="records-btn click-animate" 
            style={{ background: '#0284c7' }} 
            onClick={handleExport}
          >
            📥 Export Items
          </button>
        </div>
      </div>

      <div className="store-manager-container">
        {/* Statistics Boxes */}
        <div className="store-stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalQuantity}</div>
            <div className="stat-label">Total Quantity</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{lowStockItems}</div>
            <div className="stat-label">Low Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{outOfStockItems}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>

        {/* Search Section */}
        <div className="store-manager-search-section">
          <ExpandableSearch
            placeholder="Search items by model or brand..."
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Table */}
        <div className="store-manager-table-container">
          <div className="store-manager-table-header">
            <div className="table-header-cell">Photo</div>
            <div className="table-header-cell">Model</div>
            <div className="table-header-cell">Brand</div>
            <div className="table-header-cell">Category</div>
            <div className="table-header-cell">Quantity</div>
            <div className="table-header-cell">Status</div>
            <div className="table-header-cell">Action</div>
          </div>

          {filteredInventory.map(item => (
            <div className="store-manager-table-row" key={item.id}>
              <div className="table-cell">
                <img
                  src={item.photo}
                  alt=""
                  style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>

              <div className="table-cell item-cell">
                <span className="product-model-label">Model</span>
                <div className="item-name product-model-value">{item.model}</div>
              </div>

              <div className="table-cell brand-cell">
                <div className="brand">{item.brand}</div>
              </div>

              <div className="table-cell category-cell">
                {item.category || 'N/A'}
              </div>

              <div className="table-cell quantity-cell">
                <span className="quantity-badge">
                  {item.quantity === 0 ? "Out of Stock" : item.quantity}
                </span>
              </div>

              <div className="table-cell status-cell">
                <span className={`status-badge ${item.quantity === 0 ? 'out-of-stock' : item.quantity < 5 ? 'low-stock' : 'in-stock'}`}>
                  {item.quantity === 0 ? 'Out of Stock' : item.quantity < 5 ? 'Low Stock' : 'In Stock'}
                </span>
              </div>

              <div className="table-cell action-cell">
                <div className="store-actions">
                  <button className="edit-btn click-animate" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="delete-btn click-animate" onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddItemModal
          onSave={(item) => { setInventory([...inventory, item]); setShowAddModal(false); }}
          onCancel={() => setShowAddModal(false)}
          onViewRequests={onViewRequests}
        />
      )}

      {/* Edit Modal */}
      {itemToEdit && (
        <div className="modal-overlay" onClick={() => setItemToEdit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>✏️</div>
            <h3 style={{ color: '#0b3D91', margin: '0 0 10px 0', fontSize: '20px' }}>Edit Item</h3>
            <p style={{ color: '#374151', margin: '0 0 20px 0', fontSize: '14px', lineHeight: '1.5' }}>
              You are about to edit <strong>"{itemToEdit.model}"</strong> by <strong>{itemToEdit.brand}</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="click-animate"
                style={{
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
                onClick={() => setItemToEdit(null)}
              >
                Cancel
              </button>
              <button
                className="click-animate"
                style={{
                  background: 'linear-gradient(135deg, #0b3D91, #062b68)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
                onClick={() => {
                  notifyInfo(`Edit functionality for "${itemToEdit.model}" initiated.`);
                  setItemToEdit(null);
                }}
              >
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3>Delete Item</h3>
            <p className="modal-subtitle">
              Are you sure you want to delete <strong>{itemToDelete.model}</strong>
              {itemToDelete.brand ? ` by ${itemToDelete.brand}` : ''}? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="records-btn click-animate" style={{ background: '#64748b' }} onClick={() => setItemToDelete(null)}>
                Cancel
              </button>
              <button className="delete-btn click-animate" onClick={confirmDelete}>
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}