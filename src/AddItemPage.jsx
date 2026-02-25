import React, { useState } from 'react';

export default function AddItemPage({ onBack, onSave, onViewRequests }) {
  const [form, setForm] = useState({ model: "", brand: "", category: "", quantity: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.model && form.brand && form.quantity) {
      onSave({
        ...form, 
        id: Date.now(), 
        quantity: parseInt(form.quantity),
        photo: "https://via.placeholder.com/150"
      });
      setForm({ model: "", brand: "", category: "", quantity: "" });
    }
  };

  return (
    <div className="store-page">
      <div className="store-container">
        <div className="store-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h1 className="store-title" style={{color: '#059669'}}>Add New Item</h1>
          <button className="records-btn" style={{background: '#059669'}} onClick={() => {
            if (onViewRequests) onViewRequests();
          }}>Requests</button>
        </div>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px'}}>
          <div className="field">
            <label className="field-label">Model</label>
            <input 
              className="field-input" 
              placeholder="Enter model name" 
              value={form.model}
              onChange={e => setForm({...form, model: e.target.value})} 
              required 
            />
          </div>
          <div className="field">
            <label className="field-label">Brand</label>
            <input 
              className="field-input" 
              placeholder="Enter brand name" 
              value={form.brand}
              onChange={e => setForm({...form, brand: e.target.value})} 
              required 
            />
          </div>
          <div className="field">
            <label className="field-label">Category</label>
            <input 
              className="field-input" 
              placeholder="Enter category" 
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})} 
            />
          </div>
          <div className="field">
            <label className="field-label">Quantity</label>
            <input 
              className="field-input" 
              type="number" 
              placeholder="Enter quantity" 
              value={form.quantity}
              onChange={e => setForm({...form, quantity: e.target.value})} 
              required 
              min="1"
            />
          </div>
          <button type="submit" className="add-request-btn" style={{background: '#059669', marginTop: '10px'}}>
            Add Item to Store
          </button>
        </form>
      </div>
    </div>
  );
}