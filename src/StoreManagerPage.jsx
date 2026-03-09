import React from "react";
import { getImageUrl } from "./config";

export default function StoreManagerPage({ onBack, inventory, setInventory, onViewRequests, onAddItem, onViewFinished, approvedRequests, onMarkFinished }) {
  
  // Function to update item quantity in database
  const handleQuantityUpdate = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: inventory.find(item => item.id === itemId)?.model,
          brand: inventory.find(item => item.id === itemId)?.brand,
          category: inventory.find(item => item.id === itemId)?.category,
          quantity: newQuantity
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setInventory(inventory.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        alert('Error updating item: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    }
  };

  // Function to delete item from database
  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      try {
        const response = await fetch(`/api/items/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();
        
        if (result.success) {
          setInventory(inventory.filter(item => item.id !== id));
          alert('Item deleted successfully!');
        } else {
          alert('Error deleting item: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
      }
    }
  };

  return (
    <div className="store-page">
      <div className="store-container">
        <div className="store-header">
          <button className="back-btn" onClick={onBack}>← Logout</button>
          <h1 className="store-title" style={{color: '#059669'}}>Inventory Control</h1>
          <button className="records-btn" style={{background: '#059669'}} onClick={onAddItem}>+ Add New Item</button>
          <button className="records-btn" style={{background: '#6b7280'}} onClick={onViewFinished}>Finished Requests</button>
        </div>
        
        {/* Approved Requests Section */}
        <div style={{marginTop: '30px'}}>
          <h2 style={{color: '#059669', marginBottom: '15px'}}>Approved Requests (Ready for Distribution)</h2>
          {approvedRequests && approvedRequests.length > 0 ? (
            <div className="table-header" style={{background: '#ecfdf5'}}>
              <div>Employee</div><div>Item</div><div>Qty</div><div>Date Added</div><div>Date Approved</div><div>Purpose</div><div>Action</div>
            </div>
          ) : (
            <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>No approved requests at this time.</p>
          )}
          {approvedRequests && approvedRequests.map((req, index) => (
            <div className="table-row" key={index}>
              <div>{req.employeeName}</div>
              <div>{req.itemName}</div>
              <div>{req.quantity}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateAdded || 'N/A'}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.dateApproved || 'N/A'}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{req.purpose}</div>
              <div className="actions">
                <button 
                  className="finish-btn" 
                  onClick={async () => {
                    try {
                      // Find the request to get its ID
                      const request = approvedRequests.find(r => 
                        r.employeeName === req.employeeName && 
                        r.itemName === req.itemName && 
                        r.quantity === req.quantity
                      );

                      if (!request) {
                        alert('Request not found');
                        return;
                      }

                      // Finish the request
                      const response = await fetch(`/api/requests/${request.id}/finish`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({})
                      });

                      const result = await response.json();
                      
                      if (result.success) {
                        alert('Request finished successfully!');
                        // Request is finished, but stay on the same page
                      } else {
                        alert('Error finishing request: ' + result.message);
                      }
                    } catch (error) {
                      console.error('Error finishing request:', error);
                      alert('Error finishing request. Please try again.');
                    }
                  }}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Finish
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Section */}
        <div style={{marginTop: '30px'}}>
          <h2 style={{color: '#059669', marginBottom: '15px'}}>Inventory Items</h2>
          <div className="table-header" style={{background: '#ecfdf5'}}>
            <div>Photo</div><div>Model</div><div>Brand</div><div>Qty</div><div>Date</div><div>Action</div>
          </div>
          {inventory.map(item => (
            <div className="table-row" key={item.id}>
              <img src={getImageUrl(item.photo)} alt="" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
              <div>{item.model}</div><div>{item.brand}</div>
              <div>
                <input 
                  type="number" 
                  value={item.quantity} 
                  onChange={async (e) => {
                    const newQuantity = parseInt(e.target.value);
                    if (!isNaN(newQuantity) && newQuantity >= 0) {
                      // Update database first
                      await handleQuantityUpdate(item.id, newQuantity);
                    }
                  }}
                  style={{width: '60px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px'}}
                />
              </div>
              <div style={{fontSize: '12px', color: '#666'}}>{item.date || 'N/A'}</div>
              <div className="actions">
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
