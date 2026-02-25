import React, { useState } from 'react';
import logo from './vascom-logo.png';

export default function Login({ onBack, onLoginSuccess }) {
  console.log('Login component rendered');
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted with ID:', empId);
    // Capture the ID to identify the user role in App.jsx
    onLoginSuccess({ id: empId });
  };

  return (
    <div className="login-page">
      <button className="back" onClick={onBack}>←</button>
      <div className="login-card">
        <img src={logo} alt="Vascom" className="login-brand"/>
        <h2 className="login-title">login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Employee ID</span>
            <input 
              className="field-input" 
              value={empId} 
              onChange={(e) => setEmpId(e.target.value)} 
              required 
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input 
              type="password" 
              className="field-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </label>
          <button type="submit" className="login-btn">login</button>
        </form>
      </div>
    </div>
  );
}