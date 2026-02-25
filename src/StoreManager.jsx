import React, { useState } from "react";
import AddItemModal from "./AddItemModal";

export default function StoreManager({ onBack, inventory, setInventory, onViewRequests }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id) => {
    if (window.confirm("Delete this item?")) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  return (
    <div className="store-page">
      {showAddModal && (
        <AddItemModal 
          onSave={(item) => { setInventory([...inventory, item]); setShowAddModal(false); }} 
          onCancel={() => setShowAddModal(false)}
          onViewRequests={onViewRequests}
        />
      )}
      <div className="store-container">
        <div className="store-header">
          <button className="back-btn" onClick={onBack}>← Logout</button>
          <h1 className="store-title" style={{color: '#059669'}}>Inventory Control</h1>
          <button className="records-btn" style={{background: '#059669'}} onClick={() => setShowAddModal(true)}>+ Add New Item</button>
        </div>
        <div className="table-header" style={{background: '#ecfdf5'}}>
          <div>Photo</div><div>Model</div><div>Brand</div><div>Qty</div><div>Action</div>
        </div>
        {inventory.map(item => (
          <div className="table-row" key={item.id}>
            <img src={item.photo} alt="" style={{width: '40px'}} />
            <div>{item.model}</div><div>{item.brand}</div><div>{item.quantity}</div>
            <div className="hr-actions">
              <button className="reject-btn" onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
