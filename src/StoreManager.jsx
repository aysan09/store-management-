import React, { useState } from "react";
import AddItemModal from "./AddItemModal";
import './styles/store-manager-styles.css';

export default function StoreManager({ onBack, inventory, setInventory, onViewRequests }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const handleDelete = (id) => {
    if (window.confirm("Delete this item?")) {
      setInventory(inventory.filter(item => item.id !== id));
    }
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
        <button className="back-btn" onClick={onBack}>← Logout</button>
        <h1 className="store-manager-title">Store Manager</h1>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="records-btn" style={{background: '#059669'}} onClick={() => setShowAddModal(true)}>+ Add New Item</button>
          <button className="records-btn" style={{background: '#059669'}} onClick={() => onViewRequests && onViewRequests()}>View Requests</button>
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
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search items by model or brand..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
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
                <div className="item-name">{item.model}</div>
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
