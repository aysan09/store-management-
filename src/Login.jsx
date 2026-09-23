import React, { useState, useEffect, useRef } from 'react';
import logo from './vascom-logo.png';
import './styles/enhanced-login-styles.css';

export default function Login({ onBack, onLoginSuccess }) {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [isHiding, setIsHiding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const robotRef = useRef(null);
  const passwordInputRef = useRef(null);
  const cardRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    onLoginSuccess({ id: empId, password: password });
    // Reset shortly after — the parent either navigates away or shows a toast.
    setTimeout(() => setIsSubmitting(false), 1200);
  };

  // Interactive eyes: pupils follow the mouse pointer across the card.
  useEffect(() => {
    const handleMouseMove = (event) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + 40; // roughly the robot head
      const dx = (event.clientX - cx) / rect.width;
      const dy = (event.clientY - cy) / rect.height;
      const max = 3;
      setPupilOffset({
        x: Math.max(-max, Math.min(max, dx * max * 2)),
        y: Math.max(-max, Math.min(max, dy * max * 2))
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      {/* Animated background orbs */}
      <div className="login-bg" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="orb orb-4" />
      </div>

      <button className="back" onClick={onBack}>←</button>
      <div className="login-card" ref={cardRef}>

        <div className="robot-avatar">
          <div ref={robotRef} className="robot-character">
            <div className="robot-body">
              <div className="robot-head">
                <div className="robot-eyes">
                  <div className="robot-eye">
                    <span
                      className="robot-pupil"
                      style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}
                    />
                  </div>
                  <div className="robot-eye">
                    <span
                      className="robot-pupil"
                      style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}
                    />
                  </div>
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
            <div className="field-input-wrap">
              <span className="field-icon" aria-hidden="true">👤</span>
              <input
                className="field-input"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Enter your employee ID"
                autoComplete="username"
                required
              />
            </div>
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <div className="password-input-container">
              <span className="field-icon" aria-hidden="true">🔒</span>
              <input
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                className="field-input password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
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
          <button type="submit" className={`login-btn ${isSubmitting ? 'is-loading' : ''}`} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>login</span>
                <span className="login-btn-arrow" aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
