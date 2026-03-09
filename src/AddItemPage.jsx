import React, { useState } from 'react';

export default function AddItemPage({ onBack, onSave, onViewRequests }) {
  const [form, setForm] = useState({ model: "", brand: "", category: "", quantity: "" });
  const [photoFile, setPhotoFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.model && form.brand && form.quantity) {
      try {
        // Prepare form data for API
        const formData = new FormData();
        formData.append('model', form.model);
        formData.append('brand', form.brand);
        formData.append('category', form.category);
        formData.append('quantity', form.quantity);
        
        // Add photo if provided
        if (photoFile) {
          formData.append('photo', photoFile);
        }

        // Save to database via API (using proxy)
        const response = await fetch('/api/items', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (result.success) {
          // Add to local state with the server-generated ID
          const photoUrl = result.data.photo 
            ? `/uploads${result.data.photo}`
            : "https://via.placeholder.com/150";
          
          onSave({
            ...form, 
            id: result.data.id, 
            quantity: parseInt(form.quantity),
            photo: photoUrl
          });
          setForm({ model: "", brand: "", category: "", quantity: "" });
          setPhotoFile(null);
          alert('Item added successfully!');
        } else {
          alert('Error adding item: ' + result.message);
        }
      } catch (error) {
        console.error('Error adding item:', error);
        alert('Error adding item. Please try again.');
      }
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
          <div className="field">
            <label className="field-label">Item Photo</label>
            <input 
              className="field-input" 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setPhotoFile(file);
                
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setForm({...form, photo: event.target.result});
                  };
                  reader.readAsDataURL(file);
                }
              }}
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