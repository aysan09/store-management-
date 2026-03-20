import React, { useState } from "react";
import { getImageUrl } from "./config";
import { 
  Search, Package, CheckCircle, AlertTriangle, 
  XCircle, Edit2, Trash2, Send, Plus,
  X as CloseIcon, CheckCircle as SuccessIcon,
  XCircle as ErrorIcon, AlertTriangle as WarningIcon
} from 'lucide-react';
import './styles/store-manager-styles.css';

export default function StoreManagerPage({ 
  onBack, inventory, setInventory, onAddItem, approvedRequests, onMarkFinished, onViewFinished 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ model: '', brand: '', category: '', quantity: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState({ type: '', title: '', message: '', showRetry: false });
  const [toasts, setToasts] = useState([]);
  const [sortBy, setSortBy] = useState('model');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItems, setSelectedItems] = useState(new Set());

  const filteredItems = inventory.filter(item => 
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort function
  const sortedItems = filteredItems.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'model':
        aValue = a.model.toLowerCase();
        bValue = b.model.toLowerCase();
        break;
      case 'brand':
        aValue = a.brand.toLowerCase();
        bValue = b.brand.toLowerCase();
        break;
      case 'category':
        aValue = (a.category || '').toLowerCase();
        bValue = (b.category || '').toLowerCase();
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Sort handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  // Handle edit button click
  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditForm({
      model: item.model,
      brand: item.brand,
      category: item.category || '',
      quantity: item.quantity.toString()
    });
  };

  // Handle delete button click
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: editForm.model,
          brand: editForm.brand,
          category: editForm.category,
          quantity: parseInt(editForm.quantity)
        })
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        setInventory(inventory.map(item => 
          item.id === editingItem.id ? { ...item, ...editForm, quantity: parseInt(editForm.quantity) } : item
        ));
        setEditingItem(null);
        setEditForm({ model: '', brand: '', category: '', quantity: '' });
        // Show success toast
        addToast('success', 'Item updated successfully!');
      } else {
        // Show error toast
        addToast('error', result.message || 'Failed to update item.');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      // Show error toast
      addToast('error', 'Connection error. Please check your connection.');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/items/${itemToDelete.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        setInventory(inventory.filter(item => item.id !== itemToDelete.id));
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        // Show success toast
        addToast('success', 'Item deleted successfully!');
      } else {
        // Show error toast
        addToast('error', result.message || 'Failed to delete item.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      // Show error toast
      addToast('error', 'Connection error. Please check your connection.');
    }
  };

  // Toast notification functions
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle message popup actions
  const handleMessageAction = (action) => {
    setShowMessage(false);
    if (action === 'retry') {
      // Keep the current modal open for retry
      if (editingItem) {
        // Edit modal stays open
      } else if (showDeleteConfirm) {
        // Delete modal stays open
      }
    } else {
      // Cancel action - close modals and reset state
      if (editingItem) {
        setEditingItem(null);
        setEditForm({ model: '', brand: '', category: '', quantity: '' });
      }
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false);
        setItemToDelete(null);
      }
    }
  };

  return (
    <div className="store-manager-page">
      {/* Header */}
      <header className="header-section">
        <div className="title-area">
          <h1><span className="title-icon">📦</span> Store Inventory Management</h1>
          <p className="subtitle">Manage and track all inventory items</p>
        </div>
        <div className="header-actions">
          <button onClick={onBack} className="btn-edit-del">Logout</button>
          <button onClick={onAddItem} className="btn-request">
            <Plus size={18} /> New Request
          </button>
          <button onClick={onViewFinished} className="btn-edit-del">
            View Finished Requests
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="stats-grid">
        <StatCard icon={<Package />} label="Total Products" value={inventory.length} type="total" />
        <StatCard 
          icon={<CheckCircle />} 
          label="In Stock" 
          value={inventory.filter(item => item.quantity > 0).length} 
          type="in-stock" 
        />
        <StatCard 
          icon={<AlertTriangle />} 
          label="Low Stock" 
          value={inventory.filter(item => item.quantity > 0 && item.quantity <= 5).length} 
          type="low-stock" 
        />
        <StatCard 
          icon={<XCircle />} 
          label="Out of Stock" 
          value={inventory.filter(item => item.quantity === 0).length} 
          type="out-of-stock" 
        />
      </section>

      {/* Search */}
      <div className="search-container">
        <Search className="search-icon-pos" size={20} />
        <input 
          type="text" 
          placeholder="Search products, brand, or category" 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="inventory-table-container">
        <table className="main-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th onClick={() => handleSort('model')} style={{ cursor: 'pointer' }}>
                Model {getSortIcon('model')}
              </th>
              <th onClick={() => handleSort('brand')} style={{ cursor: 'pointer' }}>
                Brand {getSortIcon('brand')}
              </th>
              <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                Category {getSortIcon('category')}
              </th>
              <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>
                Quantity {getSortIcon('quantity')}
              </th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr 
                key={item.id} 
                className={item.quantity === 0 ? 'row-out-of-stock' : ''}
                style={{ transition: 'all 0.3s ease' }}
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
                <td>
                  <div className="action-btns">
                    {item.quantity > 0 ? (
                      <>
                        <button 
                          className="btn-edit-del" 
                          onClick={() => handleEditClick(item)}
                          title="Edit item"
                          style={{ transition: 'all 0.2s ease' }}
                        >
                          <Edit2 size={14}/>
                        </button>
                        <button 
                          className="btn-edit-del" 
                          onClick={() => handleDeleteClick(item)}
                          title="Delete item"
                          style={{ transition: 'all 0.2s ease' }}
                        >
                          <Trash2 size={14}/>
                        </button>
                      </>
                    ) : (
                      <button className="btn-request" style={{ transition: 'all 0.2s ease' }}><Send size={14}/> Request</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="page-link">Previous</button>
        <button className="page-link active">1</button>
        <button className="page-link">2</button>
        <button className="page-link">Next</button>
      </div>

      {/* Approved Requests Section */}
      {approvedRequests && approvedRequests.length > 0 && (
        <div className="approved-requests-section">
          <h2 style={{ margin: '30px 0 15px 0', fontSize: '20px', color: '#1e293b' }}>
            Approved Requests
          </h2>
          <div className="approved-requests-table-container">
            <table className="main-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Item</th>
                  <th>Purpose</th>
                  <th>Quantity</th>
                  <th>Requested Date</th>
                  <th>Approved Date</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedRequests.map((request, index) => (
                  <tr key={index}>
                    <td>{request.employeeName}</td>
                    <td>{request.itemName}</td>
                    <td>{request.purpose || 'N/A'}</td>
                    <td>{request.quantity}</td>
                    <td>{request.dateRequested}</td>
                    <td>{request.dateApproved || 'N/A'}</td>
                    <td>
                      <span className="status-badge badge-in">
                        ✅ Approved
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="btn-request"
                          onClick={() => {
                            if (onMarkFinished) {
                              onMarkFinished(request.employeeName, request.itemName, request.quantity);
                            }
                          }}
                        >
                          Mark as Finished
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Item</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={editForm.model}
                  onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                  required
                  min="0"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-request">Save Changes</button>
                <button 
                  type="button" 
                  className="btn-edit-del"
                  onClick={() => {
                    setEditingItem(null);
                    setEditForm({ model: '', brand: '', category: '', quantity: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Item</h3>
            <p>Are you sure you want to delete "{itemToDelete?.model}"?</p>
            <div className="modal-actions">
              <button 
                className="btn-edit-del"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
              <button 
                className="btn-request"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Message Popup */}
      {showMessage && (
        <div className="modal-overlay">
          <div className="message-popup">
            <div className="message-icon">
              {messageContent.type === 'success' ? (
                <CheckCircle size={48} color="#10b981" />
              ) : (
                <AlertTriangle size={48} color="#ef4444" />
              )}
            </div>
            <h3 className="message-title">{messageContent.title}</h3>
            <p className="message-text">{messageContent.message}</p>
            <div className="message-actions">
              {messageContent.showRetry && (
                <button 
                  className="btn-request"
                  onClick={() => handleMessageAction('retry')}
                >
                  Try Again
                </button>
              )}
              <button 
                className="btn-edit-del"
                onClick={() => handleMessageAction('cancel')}
              >
                {messageContent.showRetry ? 'Cancel' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-content">
              <div className="toast-icon">
                {toast.type === 'success' && <SuccessIcon size={20} />}
                {toast.type === 'error' && <ErrorIcon size={20} />}
                {toast.type === 'warning' && <WarningIcon size={20} />}
              </div>
              <span className="toast-message">{toast.message}</span>
              <button 
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <CloseIcon size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
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
        {React.cloneElement(icon, { color: iconColor, size: 24 })}
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
      {isOut ? <XCircle size={12}/> : <CheckCircle size={12}/>}
      {isOut ? 'Out of Stock' : `${quantity} in stock`}
    </span>
  );
}
