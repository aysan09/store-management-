import React, { useState, useEffect } from 'react';
import { getImageUrl } from './config';
import { ToastContainer } from 'react-toastify';
import { notifySuccess, notifyError, notifyWarning } from './utils/toastUtils';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';
import './styles/enhanced-request-form-styles.css';

export default function RequestForm({ onBack, onViewStatus, items, onAddRequest, user, preselectedItemId }) {
  const availableItems = items.filter(item => Number(item.quantity) > 0);
  const [selectedId, setSelectedId] = useState(() => {
    const preselectedItem = availableItems.find(item => String(item.id) === String(preselectedItemId));
    return preselectedItem?.id ?? availableItems[0]?.id ?? "";
  });
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const currentItem = availableItems.find(item => String(item.id) === String(selectedId)) || availableItems[0];

  // Apply the item chosen from the inventory page immediately when this form opens.
  useEffect(() => {
    const selectedItemIsAvailable = availableItems.some(item => String(item.id) === String(preselectedItemId));

    if (selectedItemIsAvailable) {
      setSelectedId(preselectedItemId);
      setQuantity(1);
    } else if (availableItems.length > 0 && !selectedId) {
      setSelectedId(availableItems[0].id);
    }
  }, [items, selectedId, preselectedItemId]);

  // Keep the selected product first in the dropdown as a visual confirmation.
  const requestItems = currentItem
    ? [currentItem, ...availableItems.filter(item => String(item.id) !== String(currentItem.id))]
    : availableItems;

  // Real-time validation
  useEffect(() => {
    const errors = {};
    
    // Quantity validation
    const qty = parseInt(quantity);
    if (!quantity || qty <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    } else if (currentItem && qty > currentItem.quantity) {
      errors.quantity = `Only ${currentItem.quantity} items available`;
    }
    
    // Purpose validation
    if (!purpose.trim()) {
      errors.purpose = 'Purpose is required';
    } else if (purpose.trim().length < 10) {
      errors.purpose = 'Please provide more details (minimum 10 characters)';
    }
    
    setValidationErrors(errors);
  }, [quantity, purpose, currentItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach(error => notifyError(error));
      return;
    }

    if (currentItem) {
      setIsSubmitting(true);
      
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        const newRequest = {
          employeeName: user ? user.name : "Unknown User",
          itemName: currentItem.model,
          itemBrand: currentItem.brand,
          quantity: parseInt(quantity),
          purpose: purpose.trim(),
          status: "Pending",
          dateAdded: currentDate
        };

        // Save to database via API (using proxy)
        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employee_id: user ? user.id : 1, // Use actual employee ID
            item_id: currentItem.id, // Use actual item ID
            quantity: parseInt(quantity),
            purpose: purpose.trim(),
            priority: 'medium', // Add required field
            notes: purpose.trim() // Add required field
          })
        });

        const result = await response.json();
        
        if (result.success) {
          // Add to local state with the server-generated ID
          const fullRequest = {
            ...newRequest,
            id: result.data.id,
            dateApproved: null,
            dateFinished: null
          };
          
          onAddRequest(fullRequest);
          notifySuccess('✅ Request submitted successfully! Your request is now pending approval.');
          
          // Reset form after successful submission
          setQuantity(1);
          setPurpose("");
          setValidationErrors({});
          
          // Auto-navigate to status page after 2 seconds
          setTimeout(() => {
            if (onViewStatus) {
              onViewStatus();
            }
          }, 2000);
        } else {
          notifyError('❌ Error submitting request: ' + result.message);
        }
      } catch (error) {
        console.error('Error submitting request:', error);
        notifyError('❌ Network error. Please check your connection and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle item selection change
  const handleItemChange = (e) => {
    setSelectedId(e.target.value);
    // Reset quantity when item changes to prevent validation errors
    setQuantity(1);
    setValidationErrors({});
  };

  return (
    <>
      <div className="request-page">
        <button className="back-btn" onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px' }}>←</button>
        <h1 className="request-main-title">Requesting Form</h1>
        <div className="request-layout">
          <div className="request-card-form">
            <h2 className="form-sub">Employee Request Form</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Item<span className="required">*</span></label>
                <select 
                  value={selectedId} 
                  onChange={handleItemChange} 
                  className="request-select"
                  disabled={isSubmitting || availableItems.length === 0}
                >
                  {availableItems.length === 0 && <option value="">No items currently in stock</option>}
                  {requestItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.model} - {item.brand} ({item.quantity} available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity<span className="required">*</span></label>
                <input 
                  type="number" 
                  min="1" 
                  max={currentItem?.quantity || 999} 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  className={`request-select ${validationErrors.quantity ? 'error-input' : ''}`}
                  style={{height: '40px'}}
                  disabled={isSubmitting || !currentItem}
                />
                {validationErrors.quantity && (
                  <span className="error-message">{validationErrors.quantity}</span>
                )}
              </div>
              <div className="form-group">
                <label>Purpose<span className="required">*</span></label>
                <textarea 
                  className={`request-textarea ${validationErrors.purpose ? 'error-input' : ''}`}
                  placeholder="Why do you need this? (Minimum 10 characters)"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={isSubmitting}
                  rows="4"
                ></textarea>
                {validationErrors.purpose && (
                  <span className="error-message">{validationErrors.purpose}</span>
                )}
                <div className={`char-count ${purpose.length >= 10 ? 'success' : purpose.length > 0 ? 'warning' : ''}`}>
                  {purpose.length}/10+ characters
                </div>
              </div>
              <button 
                type="submit" 
                className="add-request-btn"
                disabled={isSubmitting || !currentItem || Object.keys(validationErrors).length > 0}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>
            <div className="status-link">
              <span 
                onClick={onViewStatus} 
                style={{cursor: 'pointer', color: '#0b5fad', textDecoration: 'underline'}}
              >
                My Request Status
              </span>
            </div>
          </div>
          <div className="preview-card">
            <h2 className="preview-sub">Available Items</h2>
            <div className="preview-content">
              {currentItem && (
                <>
                  <img src={getImageUrl(currentItem.photo)} alt={currentItem.model} className="preview-img" />
                  <h3 className="preview-model">{currentItem.model.toUpperCase()}</h3>
                  <p className="preview-brand">BRAND: {currentItem.brand}</p>
                  <p className="preview-qty">QUANTITY: {currentItem.quantity}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
