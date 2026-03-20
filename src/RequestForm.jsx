import React, { useState } from 'react';
import { getImageUrl } from './config';
import { ToastContainer } from 'react-toastify';
import { notifySuccess, notifyError } from './utils/toastUtils';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

export default function RequestForm({ onBack, onViewStatus, items, onAddRequest, user }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const currentItem = items.find(item => String(item.id) === String(selectedId)) || items[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentItem) {
      // Validate that all fields are filled
      if (!quantity || parseInt(quantity) <= 0) {
        notifyError('Please enter a valid quantity (must be greater than 0).');
        return;
      }
      if (!purpose.trim()) {
        notifyError('Please enter a purpose for this request.');
        return;
      }
      
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        const newRequest = {
          employeeName: user ? user.name : "Unknown User",
          itemName: currentItem.model,
          quantity: parseInt(quantity),
          purpose: purpose,
          status: "Pending",
          dateAdded: currentDate
        };

        // Save to database via API (using proxy)
        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRequest)
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
          notifySuccess('Request submitted successfully!');
          
          // Reset purpose and quantity fields after successful submission
          setQuantity(1);
          setPurpose("");
        } else {
          notifyError('Error submitting request: ' + result.message);
        }
      } catch (error) {
        console.error('Error submitting request:', error);
        notifyError('Error submitting request. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="request-page">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1 className="request-main-title">Requesting Form</h1>
        <div className="request-layout">
          <div className="request-card-form">
            <h2 className="form-sub">Employee Request Form</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Item</label>
                <select 
                  value={selectedId} 
                  onChange={(e) => setSelectedId(e.target.value)} 
                  className="request-select"
                >
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.model}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  className="request-select"
                  style={{height: '40px'}}
                />
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <textarea 
                  className="request-textarea" 
                  placeholder="Why do you need this?"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="add-request-btn">Add</button>
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
