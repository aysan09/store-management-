import React, { useState, useEffect, useRef } from 'react';
import logo from './vascom-logo.png';
import './styles/enhanced-login-styles.css';

export default function Login({ onBack, onLoginSuccess }) {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [isHiding, setIsHiding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const robotRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({ id: empId, password: password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Interaction Bridge: Add/remove is-hiding class based on password field focus
  useEffect(() => {
    const passwordInput = passwordInputRef.current;
    const robotCharacter = robotRef.current;

    if (!passwordInput || !robotCharacter) return;

    const handleFocus = () => {
      setIsHiding(true);
      robotCharacter.classList.add('is-hiding');
    };

    const handleBlur = () => {
      setIsHiding(false);
      robotCharacter.classList.remove('is-hiding');
    };

    // Add event listeners
    passwordInput.addEventListener('focus', handleFocus);
    passwordInput.addEventListener('blur', handleBlur);

    // Cleanup function
    return () => {
      passwordInput.removeEventListener('focus', handleFocus);
      passwordInput.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Peek Feature: Remove hiding when password is shown, even if field is focused
  useEffect(() => {
    const robotCharacter = robotRef.current;
    if (!robotCharacter) return;

    if (showPassword) {
      // Peek: Robot watches the password being revealed
      robotCharacter.classList.remove('is-hiding');
    } else if (isHiding) {
      // Only add hiding class if the field is actually focused (isHiding is true)
      robotCharacter.classList.add('is-hiding');
    }
  }, [showPassword, isHiding]);

  return (
    <div className="login-page">
      <button className="back" onClick={onBack}>←</button>
      <div className="login-card">
        
        <div className="robot-avatar">
          <div ref={robotRef} className="robot-character">
            <div className="robot-body">
              <div className="robot-head">
                <div className="robot-eyes">
                  <div className="robot-eye"></div>
                  <div className="robot-eye"></div>
                </div>
              </div>
              <div className="robot-arms">
                <div className="robot-arm left">
                  <div className="robot-hand left">
                    <div className="robot-gripper left"></div>
                    <div className="robot-gripper right"></div>
                  </div>
                </div>
                <div className="robot-arm right">
                  <div className="robot-hand right">
                    <div className="robot-gripper left"></div>
                    <div className="robot-gripper right"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
            <div className="password-input-container">
              <input 
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"} 
                className="field-input password-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </label>
          <button type="submit" className="login-btn">login</button>
        </form>
      </div>
    </div>
  );
}
