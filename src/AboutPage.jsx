import React from 'react';
import './styles.css';

export default function AboutPage({ onBack }) {
  return (
    <div className="page">
      <header className="topbar">
        <h1 className="about-title">About Vascom Store Management</h1>
        <button className="back-btn" onClick={onBack}>Back to Home</button>
      </header>

      <main className="about-section">
        <div className="about-content">
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
    
    {/* Feature 1 */}
    <div className="feature-card">
      <div className="feature-logo">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
          <rect x="4" y="5" width="16" height="14" />
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="13" x2="20" y2="13" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </div>
      <h3>Inventory Management</h3>
      <p>Real-time tracking of all store items with automatic stock updates and low inventory alerts.</p>
    </div>

    {/* Feature 2 */}
    <div className="feature-card">
      <div className="feature-logo">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h3>Employee Requests</h3>
      <p>Streamlined request system allowing employees to easily request items with approval workflows.</p>
    </div>

    {/* Feature 3 */}
    <div className="feature-card">
      <div className="feature-logo">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#1e40af">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        </svg>
      </div>
      <h3>HR Management</h3>
      <p>Comprehensive employee management including registration, records, and access control.</p>
    </div>

    {/* Feature 4 */}
    <div className="feature-card">
      <div className="feature-logo">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M18 9l-5 5-2-2-4 4" />
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
        </div>
      </main>
    </div>
  );
}
