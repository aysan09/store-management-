import React, { useState } from "react";
import AddItemModal from "./AddItemModal";
import { notifySuccess, notifyError, notifyInfo } from "./utils/toastUtils";
import './styles/store-manager-styles.css';
import ExpandableSearch from './components/ExpandableSearch';

export default function StoreManager({ onBack, inventory, setInventory, onViewRequests }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const handleDelete = (id) => {
    const item = inventory.find(item => item.id === id);
    if (window.confirm(`Are you sure you want to delete "${item.model}" by ${item.brand}? This action cannot be undone.`)) {
      setInventory(inventory.filter(item => item.id !== id));
      notifySuccess(`✅ Successfully deleted "${item.model}" from inventory.`);
    }
  };

  // Export inventory to Excel
  const handleExport = async () => {
    try {
      notifyInfo('Exporting inventory to Excel...');
      const response = await fetch('/api/items/export');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Create blob from response and download
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
    // Create a custom modal for edit confirmation
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 400px;
      width: 90%;
      border: 2px solid #e5e7eb;
    `;
    
    modalContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 15px;">✏️</div>
      <h3 style="color: #0b3D91; margin: 0 0 10px 0; font-size: 20px;">Edit Item</h3>
      <p style="color: #374151; margin: 0 0 20px 0; font-size: 14px; line-height: 1.5;">
        You are about to edit <strong>"${item.model}"</strong> by <strong>${item.brand}</strong>
      </p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="cancel-btn" style="
          background: #64748b;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 12px;
        ">Cancel</button>
        <button id="edit-btn" style="
          background: linear-gradient(135deg, #0b3D91, #062b68);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 12px;
        ">Edit Item</button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
    
    // Add event listeners to buttons
    const cancelBtn = modalContent.querySelector('#cancel-btn');
    const editBtn = modalContent.querySelector('#edit-btn');
    
    const closeModal = () => {
      modal.remove();
    };
    
    cancelBtn.addEventListener('click', closeModal);
    editBtn.addEventListener('click', () => {
      closeModal();
      alert(`Edit functionality for "${item.model}" would open here.`);
    });
    
    // Add event listener to handle clicks outside the modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
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
      <div className="store-manager-header">
        <button className="back-btn" onClick={onBack} style={{ position: 'relative' }}>← Logout</button>
        <h1 className="store-manager-title">Store Manager</h1>
      <div style={{display: 'flex', gap: '10px'}}>
          <button className="records-btn" style={{background: '#3ba7f2'}} onClick={() => setShowAddModal(true)}>+ Add New Item</button>
          <button className="records-btn" style={{background: '#3ba7f2'}} onClick={() => onViewRequests && onViewRequests()}>View Requests</button>
          <button className="records-btn" style={{background: '#0284c7'}} onClick={handleExport}>📥 Export Items</button>
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
                  style={{width: '55px', height: '55px', objectFit: 'cover', borderRadius: '8px'}} 
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
                  <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
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
    </div>
  );
}
