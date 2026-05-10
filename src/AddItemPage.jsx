import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { notifySuccess, notifyError } from './utils/toastUtils';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';
import './styles/add-item-styles.css';

export default function AddItemPage({ onBack, onSave, onViewRequests }) {
  const [form, setForm] = useState({ model: "", brand: "", category: "", quantity: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.model && form.brand && form.quantity) {
      try {
        setIsSubmitting(true);
        
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
            ? result.data.photo
            : "https://via.placeholder.com/150";
          
          onSave({
            ...form, 
            id: result.data.id, 
            quantity: parseInt(form.quantity),
            photo: photoUrl
          });
          setForm({ model: "", brand: "", category: "", quantity: "" });
          setPhotoFile(null);
          notifySuccess('Item added successfully!');
        } else {
          notifyError('Error adding item: ' + result.message);
        }
      } catch (error) {
        console.error('Error adding item:', error);
        notifyError('Error adding item. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className="add-item-page">
        <div className="add-item-container">
          <div className="add-item-header">
            <button className="back-btn" onClick={onBack} style={{ position: 'relative' }}>← Back</button>
            <div className="add-item-title-section">
              <h1 className="add-item-title">Add New Item</h1>
              <p className="add-item-subtitle">Fill in the details below to add a new item to the store</p>
            </div>
           
          </div>
          
          <div className="add-item-form-section">
            <form onSubmit={handleSubmit} className="add-item-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Model Name</span>
                    <span className="required-indicator">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">📱</span>
                    <input 
                      className="form-input" 
                      placeholder="Enter model name" 
                      value={form.model}
                      onChange={e => setForm({...form, model: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Brand</span>
                    <span className="required-indicator">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">🏷️</span>
                    <input 
                      className="form-input" 
                      placeholder="Enter brand name" 
                      value={form.brand}
                      onChange={e => setForm({...form, brand: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Category</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">📁</span>
                    <input 
                      className="form-input" 
                      placeholder="Enter category (optional)" 
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Quantity</span>
                    <span className="required-indicator">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">📦</span>
                    <input 
                      className="form-input" 
                      type="number" 
                      placeholder="Enter quantity" 
                      value={form.quantity}
                      onChange={e => setForm({...form, quantity: e.target.value})} 
                      required 
                      min="1"
                      step="1"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group photo-group">
                <label className="form-label">
                  <span className="label-text">Item Photo</span>
                </label>
                <div className="photo-upload-wrapper">
                  <div className="photo-upload-area">
                    <input 
                      className="photo-input" 
                      type="file" 
                      accept="image/*"
                      id="photo-upload"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setPhotoFile(file);
                      }}
                    />
                    <label htmlFor="photo-upload" className="photo-upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">📷</span>
                        <span className="upload-text">
                          {photoFile ? `Selected: ${photoFile.name}` : 'Click to upload item photo'}
                        </span>
                      </div>
                    </label>
                  </div>
                  
                  {photoFile && (
                    <div className="photo-preview">
                      <img 
                        src={URL.createObjectURL(photoFile)} 
                        alt="Preview" 
                        className="preview-image"
                      />
                      <button 
                        type="button"
                        className="remove-photo-btn"
                        onClick={() => setPhotoFile(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Adding Item...
                    </>
                  ) : (
                    <>
                      <span className="submit-icon">➕</span>
                      Add Item to Store
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  className="reset-btn"
                  onClick={() => {
                    setForm({ model: "", brand: "", category: "", quantity: "" });
                    setPhotoFile(null);
                  }}
                  disabled={isSubmitting}
                >
                  Reset Form
                </button>
              </div>
            </form>

            <div className="form-visuals">
              <div className="visual-card">
                <div className="visual-icon">📊</div>
                <h3>Quick Stats</h3>
                <p>Track your inventory efficiently with real-time updates and detailed item management.</p>
              </div>
              
              <div className="visual-card">
                <div className="visual-icon">📸</div>
                <h3>Visual Catalog</h3>
                <p>Add photos to your items for easy identification and better inventory management.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
