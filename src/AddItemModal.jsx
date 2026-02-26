import React, { useState } from 'react';

export default function AddItemModal({ onSave, onCancel, onViewRequests }) {
  const [form, setForm] = useState({ model: "", brand: "", category: "", quantity: "", photo: "https://via.placeholder.com/150" });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setForm({...form, photo: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setForm({...form, photo: "https://via.placeholder.com/150"});
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="status-header-row">
          <button className="back-btn" onClick={onCancel}>←</button>
          <h2 style={{color: 'var(--blue)', margin: 0}}>New Item</h2>
          <button className="records-btn" onClick={onViewRequests}>Requests</button>
        </header>
        <form onSubmit={(e) => { e.preventDefault(); onSave({...form, id: Date.now(), quantity: parseInt(form.quantity)}); }}>
          <div className="image-upload-container">
            <div className="image-preview">
              <img 
                src={imagePreview || form.photo} 
                alt="Item preview" 
                className="item-image-preview"
              />
            </div>
            <div className="image-input-group">
              <input 
                type="file" 
                id="image-upload" 
                className="image-upload-input"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload" className="image-upload-label">
                Choose Image
              </label>
              {imagePreview && (
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
          <input className="field-input" placeholder="Model" onChange={e => setForm({...form, model: e.target.value})} required />
          <input className="field-input" placeholder="Brand" onChange={e => setForm({...form, brand: e.target.value})} required />
          <input className="field-input" type="number" placeholder="Qty" onChange={e => setForm({...form, quantity: e.target.value})} required />
          <button type="submit" className="add-request-btn">Add to Store</button>
        </form>
      </div>
    </div>
  );
}
