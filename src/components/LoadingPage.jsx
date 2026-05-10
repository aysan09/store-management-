import React from 'react';

export default function LoadingPage() {
  return (
    <div className="loading-page">
      {/* Blurred background overlay */}
      <div className="loading-blur-overlay"></div>

      <div className="loading-content">
        {/* Branding - Logo with text */}
        <div className="loading-branding">
          <div className="loading-logo-container">
            <img src="/fi-removebg-preview.png" alt="Vascom Logo" className="loading-logo-img" />
            <div className="loading-logo-icons">
              <span className="cog-icon">⚙</span>
              <span className="chart-icon">📊</span>
            </div>
          </div>
          <h1 className="loading-title">Store Management</h1>
          <p className="loading-subtitle">SMART RETAIL SOLUTIONS</p>
        </div>

        {/* 3D Torus-Style Spinner with Interwoven Bands */}
        <div className="loading-spinner-3d">
          <div className="spinner-torus-outer"></div>
          <div className="spinner-band-1"></div>
          <div className="spinner-band-2"></div>
          <div className="spinner-band-3"></div>
          <div className="spinner-channel-1"></div>
          <div className="spinner-channel-2"></div>
          <div className="spinner-channel-3"></div>
          <div className="spinner-pearlescent-glow"></div>
          <div className="spinner-braid-1"></div>
          <div className="spinner-braid-2"></div>
          <div className="spinner-braid-3"></div>
          <div className="spinner-braid-4"></div>
          <div className="spinner-core-glow"></div>
          <div className="spinner-center-pearl"></div>
        </div>

        {/* Loading Text */}
        <div className="loading-main-text">LOADING MODULES...</div>

        {/* Progress Bar with Blue Fill */}
        <div className="loading-progress-container">
          <div className="loading-progress-bar-blue"></div>
        </div>

        {/* Status Message */}
        <div className="loading-status-message">
          <p>Initializing dashboards, fetching product data, setting up inventory lists, preparing user interface... Please wait.</p>
        </div>
      </div>
    </div>
  );
}
