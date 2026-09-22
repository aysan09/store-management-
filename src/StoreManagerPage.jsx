import React, { useState, useEffect } from "react";
import { getImageUrl } from "./config";
import { 
  Search, Package, CheckCircle, AlertTriangle, 
  XCircle, Edit2, Trash2, Send, Plus,
  X as CloseIcon, CheckCircle as SuccessIcon,
  XCircle as ErrorIcon, AlertTriangle as WarningIcon,
  Bell, Mail, Eye, Trash2 as TrashIcon, Menu, Download
} from 'lucide-react';
import './styles/store-manager-styles.css';
import './styles/enhanced-modals-styles.css';
import './styles/enhanced-store-manager-styles.css';
import SortDropdown from './components/SortDropdown';
import ExpandableSearch from './components/ExpandableSearch';

export default function StoreManagerPage({ 
  onBack, inventory, setInventory, onAddItem, approvedRequests, onMarkFinished, onViewFinished 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ model: '', brand: '', category: '', quantity: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState({ type: '', title: '', message: '', showRetry: false });
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [itemToFinish, setItemToFinish] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sortBy, setSortBy] = useState('model');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationSent, setNotificationSent] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationInterval, setNotificationInterval] = useState(null);
  const [approvedRequestsState, setApprovedRequestsState] = useState(approvedRequests || []);
  const [approvedRequestsLoading, setApprovedRequestsLoading] = useState(false);

  // Function to refresh inventory data from server
  const refreshInventory = async () => {
    try {
      const response = await fetch('/api/items');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Handle different possible API response structures
          let itemsArray = [];
          
          if (result.data && Array.isArray(result.data)) {
            itemsArray = result.data;
          } else if (result.data && result.data.items && Array.isArray(result.data.items)) {
            itemsArray = result.data.items;
          } else if (Array.isArray(result)) {
            itemsArray = result;
          }
          
          if (itemsArray.length > 0) {
            setInventory(itemsArray);
            addToast('info', 'Inventory data refreshed from server');
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing inventory:', error);
    }
  };

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

  // Pagination logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  // Only the Store Manager can notify HR about low or exhausted stock.
  const handleRequestStock = async (item) => {
    try {
      const isOutOfStock = Number(item.quantity) === 0;
      const stockLevel = isOutOfStock ? 'Out of Stock' : 'Low Stock';
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `${stockLevel} Alert: ${item.brand} ${item.model} has ${item.quantity} item(s) remaining.`,
          type: isOutOfStock ? 'out-of-stock' : 'low-stock',
          itemId: item.id,
          itemName: `${item.brand} ${item.model}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setNotificationSent(prev => new Set(prev).add(item.id));
        addToast('info', `HR has been notified about ${item.model}.`);
      } else {
        addToast('warning', 'Failed to notify HR. Please try again.');
      }
    } catch (error) {
      console.error('Error notifying HR:', error);
      addToast('error', 'Connection error. Please check your connection.');
    }
  };

  // Handle request notification with rich data for HR
  const handleRequestNotification = async (item) => {
    try {
      // Send rich notification to HR with item details
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName: item.model,
          itemPhoto: getImageUrl(item.photo),
          status: 'OUT OF STOCK',
          brand: item.brand,
          type: 'out_of_stock_alert',
          itemId: item.id,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        addToast('info', `Alert sent to HR: ${item.brand} ${item.model} is out of stock`);
      } else {
        addToast('warning', 'Failed to send notification to HR. Please try again.');
      }
    } catch (error) {
      console.error('Error sending notification to HR:', error);
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

  // Fetch notifications from server
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Enhanced fetch for approved requests
  const fetchApprovedRequests = async () => {
    try {
      setApprovedRequestsLoading(true);
      const response = await fetch('/api/requests');
      const result = await response.json();
      
      console.log('API Response:', result); // Debug log
      
      if (result.success) {
        // Filter for approved requests only (case-insensitive)
        const approved = result.data.requests.filter(req => req.status.toLowerCase() === 'approved');
        
        console.log('Approved requests from API:', approved); // Debug log
        
        // Transform data to match frontend format
        const transformedRequests = approved.map(req => ({
          employeeName: req.employeeName,
          itemName: req.itemName,
          itemBrand: req.itemBrand || 'N/A', // Ensure brand is included
          quantity: req.quantity,
          purpose: req.purpose,
          dateAdded: req.dateAdded,
          dateApproved: req.dateApproved,
          id: req.id
        }));
        
        console.log('Transformed requests:', transformedRequests); // Debug log
        
        setApprovedRequestsState(transformedRequests);
      }
    } catch (error) {
      console.error('Error fetching approved requests:', error);
      addToast('error', 'Failed to fetch approved requests');
    } finally {
      setApprovedRequestsLoading(false);
    }
  };

  // Start polling for notifications
  useEffect(() => {
    // Fetch notifications immediately
    fetchNotifications();

    // Set up interval to fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    setNotificationInterval(interval);

    // Fetch approved requests immediately
    fetchApprovedRequests();

    // Set up interval to fetch approved requests every 30 seconds
    const approvedInterval = setInterval(fetchApprovedRequests, 30000);

    return () => {
      if (interval) clearInterval(interval);
      if (approvedInterval) clearInterval(approvedInterval);
    };
  }, []);

  // Handle notification actions
  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await fetch('/api/notifications/clear', {
        method: 'DELETE'
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Handle export items to Excel
  const handleExportItems = async () => {
    try {
      addToast('info', 'Exporting items to Excel...');
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
      
      addToast('success', 'Items exported successfully!');
    } catch (error) {
      console.error('Error exporting items:', error);
      addToast('error', 'Failed to export items');
    }
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
        
        {/* Desktop Header Actions */}
        <div className="header-actions desktop-header-actions">
          <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={24} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-badge">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <button onClick={onBack} className="btn-edit-del">Logout</button>
          <button onClick={onAddItem} className="btn-request">
            <Plus size={18} /> New Item
          </button>
          <button onClick={onViewFinished} className="btn-edit-del">
            View Finished Requests
          </button>
          <button onClick={refreshInventory} className="btn-request">
            Refresh Data
          </button>
          <button onClick={handleExportItems} className="btn-request" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={18} /> Export Items
          </button>
        </div>

        {/* Mobile Header Actions */}
        <div className="mobile-header-actions">
          <div className="mobile-header-left">
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={24} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
          </div>
          <button 
            className="hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-dropdown">
            <div className="mobile-menu-header">
              <span>Menu</span>
              <button 
                className="mobile-menu-close" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="mobile-menu-items">
              <button onClick={() => { onBack(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                <span className="mobile-menu-icon">🚪</span>
                Logout
              </button>
              <button onClick={() => { onAddItem(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                <span className="mobile-menu-icon">➕</span>
                New Item
              </button>
              <button onClick={() => { onViewFinished(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                <span className="mobile-menu-icon">📋</span>
                View Finished Requests
              </button>
              <button onClick={() => { refreshInventory(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                <span className="mobile-menu-icon">🔄</span>
                Refresh Data
              </button>
              <button onClick={() => { handleExportItems(); setIsMobileMenuOpen(false); }} className="mobile-menu-item">
                <span className="mobile-menu-icon">📥</span>
                Export Items
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown top-position">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="notifications-header-actions">
              {notifications.length > 0 && (
                <button onClick={handleClearAllNotifications} className="clear-all-btn">
                  Clear All
                </button>
              )}
              <button onClick={() => setShowNotifications(false)} className="close-notifications-btn" aria-label="Close notifications">
                <CloseIcon size={18} />
              </button>
            </div>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Mail size={48} className="no-notifications-icon" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                  <div className="notification-content">
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      {notification.itemName && (
                        <span className="notification-item-name">Item: {notification.itemName}</span>
                      )}
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mark-read-btn"
                        title="Mark as read"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="delete-notification-btn"
                      title="Delete notification"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <section className="stats-grid">
        <StatCard icon={<Package />} label="Total Products" value={inventory.length} type="total" />
        <StatCard 
          icon={<CheckCircle />} 
          label="In Stock" 
          value={inventory.filter(item => item.quantity > 5).length} 
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

      {/* Search and sort */}
      <div className="store-manager-search-sort">
        <ExpandableSearch
          className="search-container"
          placeholder="Search products, brand, or category"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <div className="sort-controls store-manager-sort-controls">
          <SortDropdown
            options={[
              { value: 'model', label: 'Model' },
              { value: 'brand', label: 'Brand' },
              { value: 'category', label: 'Category' },
              { value: 'quantity', label: 'Quantity' }
            ]}
            value={sortBy}
            order={sortOrder}
            onChange={handleSort}
          />
        </div>
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
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
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
                    <td>{Number(item.quantity) || 0}</td>
                  <td>
                      <StatusBadge quantity={Number(item.quantity) || 0} />
                  </td>
                  <td>
                    <div className="action-btns">
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
                      {Number(item.quantity) <= 5 && (
                        <button
                          className="btn-request"
                          onClick={() => handleRequestStock(item)}
                          disabled={notificationSent.has(item.id)}
                          title="Notify HR about this stock level"
                        >
                          <Bell size={14} />
                          {notificationSent.has(item.id) ? 'HR Notified' : 'Notify HR'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
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

      {/* Approved Requests Section */}
      <div className="approved-requests-section">
        <div className="approved-requests-header">
          <h2 style={{ margin: '30px 0 15px 0', fontSize: '20px', color: '#1e293b' }}>
            Approved Requests
          </h2>
          <div className="approved-requests-actions">
            <button 
              className="btn-request"
              onClick={fetchApprovedRequests}
              disabled={approvedRequestsLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {approvedRequestsLoading ? 'Refreshing...' : 'Refresh Requests'}
            </button>
            <span className="approved-count">
              {approvedRequestsState.length} approved request{approvedRequestsState.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {approvedRequestsState && approvedRequestsState.length > 0 ? (
          <div className="approved-requests-table-container">
            <table className="main-table">
              <thead>
              <tr>
                <th>Employee</th>
                <th>Item</th>
                <th>Brand</th>
                <th>Purpose</th>
                <th>Quantity</th>
                <th>Requested Date</th>
                <th>Approved Date</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
              </thead>
              <tbody>
                {approvedRequestsState.map((request, index) => (
                <tr key={request.id || index}>
                    <td>{request.employeeName || 'Unknown Employee'}</td>
                    <td>{request.itemName || 'Unknown Item'}</td>
                    <td>{request.itemBrand || 'No Brand'}</td>
                    <td>{request.purpose || 'No Purpose Specified'}</td>
                    <td>{request.quantity || 0}</td>
                    <td>{request.dateAdded ? new Date(request.dateAdded).toLocaleDateString() : 'No Date'}</td>
                    <td>{request.dateApproved ? new Date(request.dateApproved).toLocaleDateString() : 'Not Approved'}</td>
                    <td>
                      <span className="status-badge badge-in">
                        ✅ Approved
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="btn-request"
                          onClick={async () => {
                            try {
                              // First, fetch all items from the server to get the most current data
                              const itemsResponse = await fetch('/api/items');
                              if (!itemsResponse.ok) {
                                addToast('error', 'Failed to fetch inventory data');
                                return;
                              }
                              
                              const itemsResult = await itemsResponse.json();
                              console.log('Items API Response:', itemsResult); // Debug log
                              
                              if (!itemsResult.success) {
                                addToast('error', 'Failed to fetch inventory data');
                                return;
                              }
                              
                              // Handle different possible API response structures
                              let itemsArray = [];
                              
                              // Try different possible structures
                              if (itemsResult.data && Array.isArray(itemsResult.data)) {
                                // Structure: {success: true, data: [...]}
                                itemsArray = itemsResult.data;
                              } else if (itemsResult.data && itemsResult.data.items && Array.isArray(itemsResult.data.items)) {
                                // Structure: {success: true, data: {items: [...]}}
                                itemsArray = itemsResult.data.items;
                              } else if (Array.isArray(itemsResult)) {
                                // Structure: [...]
                                itemsArray = itemsResult;
                              } else {
                                addToast('error', 'Unexpected API response format');
                                return;
                              }
                              
                              // Find the item by both name and brand in the server data
                              const serverItem = itemsArray.find(item => 
                                item.model === request.itemName && item.brand === request.itemBrand
                              );
                              
                              if (!serverItem) {
                                addToast('warning', `Item "${request.itemName}" by "${request.itemBrand}" not found in inventory. Please add this item to inventory first.`);
                                return;
                              }
                              
                              // Use the current quantity from the server
                              const currentQuantity = Number(serverItem.quantity) || 0;
                              const requestedQuantity = Number(request.quantity) || 0;
                              const hasSufficientStock = currentQuantity >= requestedQuantity;
                              
                              setItemToFinish({
                                ...request,
                                quantity: requestedQuantity,
                                itemInInventory: serverItem,
                                hasSufficientStock
                              });
                              setShowFinishConfirm(true);
                              
                            } catch (error) {
                              console.error('Error fetching current stock:', error);
                              addToast('error', 'Connection error. Please check your connection.');
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
        ) : (
          <div className="no-requests-message">
            <div className="no-requests-icon">📋</div>
            <h3>No Approved Requests</h3>
            <p>There are currently no approved requests to display.</p>
          </div>
        )}
      </div>

      {/* Enhanced Edit Modal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon">✏️</div>
              <h3>Edit Item Details</h3>
              <p className="modal-subtitle">Update information for "{editingItem.model}" by {editingItem.brand}</p>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Model Name</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                    className="form-input"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setEditingItem(null);
                    setEditForm({ model: '', brand: '', category: '', quantity: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon">⚠️</div>
              <h3>Delete Item</h3>
              <p className="modal-subtitle">Are you sure you want to delete "{itemToDelete?.model}" by {itemToDelete?.brand}?</p>
            </div>
            <div className="delete-warning">
              <p className="warning-text">This action cannot be undone. The item will be permanently removed from the inventory.</p>
              <div className="item-preview">
                <img src={getImageUrl(itemToDelete?.photo)} alt={itemToDelete?.model} className="preview-image" />
                <div className="item-details">
                  <span className="item-name">{itemToDelete?.model}</span>
                  <span className="item-brand">{itemToDelete?.brand}</span>
                  <span className="item-quantity">Quantity: {itemToDelete?.quantity}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteConfirm}
              >
                Delete Item
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
                <CheckCircle size={48} color="#7FE7D6" />
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

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && itemToFinish && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon">✅</div>
              <h3>Mark Request as Finished</h3>
              <p className="modal-subtitle">Confirm completion of request for {itemToFinish.employeeName}</p>
            </div>
            <div className="finish-confirmation-content">
              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">Employee:</span>
                  <span className="detail-value">{itemToFinish.employeeName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Item:</span>
                  <span className="detail-value">{itemToFinish.itemName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Brand:</span>
                  <span className="detail-value">{itemToFinish.itemBrand || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requested Quantity:</span>
                  <span className="detail-value">{itemToFinish.quantity}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Purpose:</span>
                  <span className="detail-value purpose-detail">{itemToFinish.purpose}</span>
                </div>
              </div>
              
              {itemToFinish.itemInInventory && (
                <div className="inventory-status">
                  <div className="inventory-header">
                    <h4>Inventory Status</h4>
                    <span className={`stock-status ${itemToFinish.hasSufficientStock ? 'in-stock' : 'low-stock'}`}>
                      {itemToFinish.hasSufficientStock ? '✅ Sufficient Stock' : '⚠️ Insufficient Stock'}
                    </span>
                  </div>
                  <div className="inventory-details">
                    <div className="inventory-row">
                      <span className="inventory-label">Available Stock:</span>
                      <span className="inventory-value">{Number(itemToFinish.itemInInventory.quantity) || 0}</span>
                    </div>
                    <div className="inventory-row">
                      <span className="inventory-label">Required:</span>
                      <span className="inventory-value">{itemToFinish.quantity}</span>
                    </div>
                    <div className="inventory-row">
                      <span className="inventory-label">Remaining After:</span>
                      <span className="inventory-value">
                        {itemToFinish.hasSufficientStock ? ((Number(itemToFinish.itemInInventory.quantity) || 0) - itemToFinish.quantity) : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {!itemToFinish.hasSufficientStock && (
                <div className="stock-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-content">
                    <h4>Insufficient Stock Warning</h4>
                    <p>There is not enough stock to fulfill this request. Please restock the item before marking as finished.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowFinishConfirm(false);
                  setItemToFinish(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={`save-btn ${!itemToFinish.hasSufficientStock ? 'disabled' : ''}`}
                onClick={async () => {
                  if (!itemToFinish.hasSufficientStock) {
                    addToast('warning', 'Cannot mark as finished: insufficient stock available');
                    return;
                  }
                  
                  try {
                    // Use the request ID directly from the itemToFinish object
                    const requestId = itemToFinish.id;
                    
                    if (!requestId) {
                      addToast('error', 'Request ID not found');
                      return;
                    }
                    
                    // Call the finish endpoint directly with the request ID
                    console.log('Making PUT request to:', `/api/requests/${requestId}/finish`); // Debug log
                    const finishResponse = await fetch(`/api/requests/${requestId}/finish`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      }
                    });
                    
                    console.log('Finish request response status:', finishResponse.status); // Debug log
                    console.log('Finish request response headers:', finishResponse.headers); // Debug log
                    
                    const finishResult = await finishResponse.json();
                    console.log('Finish request response data:', finishResult); // Debug log
                    console.log('Finish request error details:', finishResult.error); // Debug log
                    
                    if (finishResult.success) {
                      // Update local inventory
                      setInventory(prev => prev.map(item => 
                        item.model === itemToFinish.itemName 
                          ? { ...item, quantity: item.quantity - itemToFinish.quantity }
                          : item
                      ));
                      
                      // Show success toast
                      addToast('success', `✅ Request marked as finished! ${itemToFinish.quantity} ${itemToFinish.itemName}(s) have been deducted from inventory.`);
                      
                      // Close modal
                      setShowFinishConfirm(false);
                      setItemToFinish(null);
                      
                      // Refresh the approved requests list
                      fetchApprovedRequests();
                    } else {
                      // Handle specific error messages from backend
                      if (finishResult.error && finishResult.error.code === 'REQUEST_NOT_FOUND') {
                        addToast('error', 'Request not found. It may have been already processed.');
                      } else if (finishResult.error && finishResult.error.code === 'REQUEST_ALREADY_FINISHED') {
                        addToast('warning', 'This request has already been finished.');
                      } else if (finishResult.error && finishResult.error.code === 'REQUEST_NOT_APPROVED') {
                        addToast('warning', 'Only approved requests can be finished.');
                      } else {
                        addToast('error', finishResult.message || 'Failed to mark request as finished');
                      }
                    }
                  } catch (error) {
                    console.error('Error marking request as finished:', error);
                    addToast('error', 'Connection error. Please check your connection.');
                  }
                }}
                disabled={!itemToFinish.hasSufficientStock}
              >
                {itemToFinish.hasSufficientStock ? 'Mark as Finished' : 'Insufficient Stock'}
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
  const isLow = quantity > 0 && quantity <= 5;
  
  return (
    <span className={`status-badge ${isOut ? 'badge-out' : isLow ? 'badge-warning' : 'badge-in'}`}>
      {isOut ? <XCircle size={12}/> : isLow ? <AlertTriangle size={12}/> : <CheckCircle size={12}/>}
      {isOut ? 'Out of Stock' : isLow ? `⚠️ Low Stock (${quantity})` : `${quantity} in stock`}
    </span>
  );
}
