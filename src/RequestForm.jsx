import React, { useState } from 'react';
import { sendRequestNotification } from './services/emailService';

export default function RequestForm({ onBack, onViewStatus, items, onAddRequest }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const currentItem = items.find(item => item.id === parseInt(selectedId)) || items[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onAddRequest && currentItem) {
      const currentDate = new Date().toISOString().split('T')[0];
      const newRequest = {
        employeeName: "Current User", // This would come from context/auth in a real app
        itemName: currentItem.model,
        quantity: parseInt(quantity),
        purpose: purpose,
        status: "Pending",
        dateAdded: currentDate, // Track when request was added
        dateApproved: null,     // Will be set when approved
        dateFinished: null      // Will be set when finished/distributed
      };

      // Send email notification to HR managers
      try {
        const emailResult = await sendRequestNotification(newRequest);
        if (emailResult.success) {
          console.log('✅ Email notification sent successfully');
        } else {
          console.warn('⚠️ Email notification failed:', emailResult.message);
        }
      } catch (error) {
        console.error('❌ Error sending email notification:', error);
      }

      onAddRequest(newRequest);
    }
  };

  return (
    <div className="request-page">
      <button className="back-btn" onClick={onBack}>←</button>
      <h1 className="request-main-title">Requesting Form</h1>
      <div className="request-layout">
        <div className="request-card-form">
          <h2 className="form-sub">Employee Request Form</h2>
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
          <button className="add-request-btn" onClick={handleSubmit}>Add</button>
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
                <img src={currentItem.photo} alt={currentItem.model} className="preview-img" />
                <h3 className="preview-model">{currentItem.model.toUpperCase()}</h3>
                <p className="preview-qty">QUANTITY: {currentItem.quantity}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
