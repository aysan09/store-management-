import React from 'react';

export default function AboutPage({ onBack }) {
  return (
    <div className="page">
      <header className="topbar">
        <h1 className="about-title">About Vascom Store Management</h1>
        <button className="back-btn" onClick={onBack}>Back to Home</button>
      </header>

      <main className="about-content">
        <div className="about-hero">
          <div className="about-left">
            <h1 className="about-main-title">Streamlining Store Operations</h1>
            <p className="about-subtitle">
              Our comprehensive store management system helps Vascom efficiently manage 
              inventory, process employee requests, and maintain organized records.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Items Managed</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Employees Served</p>
            </div>
            <div className="stat-card">
              <h3>99.9%</h3>
              <p>System Uptime</p>
            </div>
          </div>
        </div>

        <div className="about-features">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7h16v2H4V7zm0 4h16v2H4v-2zm0 4h16v2H4v-2z" fill="#1e40af"/>
                  <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="#1e40af" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Inventory Management</h3>
              <p>Real-time tracking of all store items with automatic stock updates and low inventory alerts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Employee Requests</h3>
              <p>Streamlined request system allowing employees to easily request items with approval workflows.</p>
            </div>
            <div className="feature-card">
              <div className="feature-logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#1e40af"/>
                </svg>
              </div>
              <h3>HR Management</h3>
              <p>Comprehensive employee management including registration, records, and access control.</p>
            </div>
            <div className="feature-card">
              <div className="feature-logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 14l3 3 7-7" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Reporting & Analytics</h3>
              <p>Detailed reports on inventory usage, request patterns, and system performance metrics.</p>
            </div>
          </div>
        </div>

        <div className="about-team">
          <h2>Our Team</h2>
          <p className="team-description">
            Dedicated professionals working together to ensure efficient store operations 
            and excellent service delivery across all departments.
          </p>
        </div>
      </main>
    </div>
  );
}