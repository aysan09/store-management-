import React, { useState } from 'react';

export default function AddItemModal({ onSave, onCancel, onViewRequests }) {
  const [form, setForm] = useState({ model: "", brand: "", category: "", quantity: "" });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="status-header-row">
          <button className="back-btn" onClick={onCancel}>←</button>
          <h2 style={{color: 'var(--blue)', margin: 0}}>New Item</h2>
          <button className="records-btn" onClick={onViewRequests}>Requests</button>
        </header>
        <form onSubmit={(e) => { e.preventDefault(); onSave({...form, id: Date.now(), quantity: parseInt(form.quantity)}); }}>
          <input className="field-input" placeholder="Model" onChange={e => setForm({...form, model: e.target.value})} required />
          <input className="field-input" placeholder="Brand" onChange={e => setForm({...form, brand: e.target.value})} required />
          <input className="field-input" type="number" placeholder="Qty" onChange={e => setForm({...form, quantity: e.target.value})} required />
          <button type="submit" className="add-request-btn">Add to Store</button>
        </form>
      </div>
    </div>
  );
}