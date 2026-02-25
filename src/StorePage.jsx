import React, { useState } from "react";

export default function StorePage({ onBack, onRequest, items, isManager = false, onEdit, onDelete, onAddItem }) {
  const [search, setSearch] = useState("");
  const filteredItems = items.filter(item => 
    item.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="store-page">
      <div className="store-container">
        <div className="store-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <h1 className="store-title">Store Inventory</h1>
          {isManager ? (
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="records-btn" style={{background: '#059669'}} onClick={() => onAddItem && onAddItem()}>+ Add New Item</button>
              <button className="records-btn" style={{background: '#059669'}} onClick={() => {}}>Requests</button>
            </div>
          ) : (
            <button className="request-btn" onClick={onRequest}>Make Request</button>
          )}
        </div>
        <div className="search-box">
          <span className="search-icon" style={{left: '10px', position: 'absolute', top: '10px'}}>🔍</span>
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search} 
            style={{paddingLeft: '35px'}} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="table-header">
          <div>Photo</div><div>Model</div><div>Brand</div><div>Category</div><div>Quantity</div>
          {isManager && <div>Action</div>}
        </div>
        {filteredItems.map(item => (
          <div className="table-row" key={item.id}>
            <img src={item.photo} alt="" style={{width: '60px'}} />
            <div>{item.model}</div>
            <div className="brand">{item.brand}</div>
            <div>{item.category}</div>
            <div className={item.quantity === 0 ? "out-stock" : ""}>
              {item.quantity === 0 ? "out of stock" : item.quantity}
            </div>
            {isManager && (
              <div className="actions">
                <button className="edit-btn" onClick={() => onEdit && onEdit(item)}>Edit</button>
                <button className="delete-btn" onClick={() => onDelete && onDelete(item.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
