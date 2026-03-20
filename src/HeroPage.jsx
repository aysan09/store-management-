import React from 'react';
import logo from './vascom-logo.png';
import laptopImg from './fi-removebg-preview.png';
import './styles.css';

export default function HeroPage({ onLoginClick, onAboutClick }) {
  const scrollToAbout = () => {
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to about section by ID if class selector doesn't work
      const aboutElement = document.getElementById('about-section');
      if (aboutElement) {
        aboutElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <img className="logo" alt="Vascom logo" src={logo} />
        <div className="topbar-actions">
          
          <button className="login" onClick={onLoginClick}>Login</button>
        </div>
      </header>

      <main className="hero">
        <div className="hero-left">
          <h1 className="title">Vascom Store<br/>Management<br/>System</h1>
          <button className="cta" onClick={scrollToAbout}>About us</button>
        </div>
        <div className="hero-right">
          <img className="laptop" src={laptopImg} alt="Laptop mock" />
        </div>
      </main>

      <section className="about-section" id="about-section">
        <div className="about-content">
          <h2>About Vascom Store Management</h2>
          <p className="about-description">
            Our comprehensive store management system helps Vascom efficiently manage 
            inventory, process employee requests, and maintain organized records.
          </p>
          
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

          <div className="about-features">
            <h3>Key Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <h4>Inventory Management</h4>
                <p>Real-time tracking of all store items with automatic stock updates and low inventory alerts.</p>
              </div>
              <div className="feature-card">
                <h4>Employee Requests</h4>
                <p>Streamlined request system allowing employees to easily request items with approval workflows.</p>
              </div>
              <div className="feature-card">
                <h4>HR Management</h4>
                <p>Comprehensive employee management including registration, records, and access control.</p>
              </div>
              <div className="feature-card">
                <h4>Reporting & Analytics</h4>
                <p>Detailed reports on inventory usage, request patterns, and system performance metrics.</p>
              </div>
            </div>
          </div>

          <div className="about-team">
            <h3>Our Team</h3>
            <p className="team-description">
              Dedicated professionals working together to ensure efficient store operations 
              and excellent service delivery across all departments.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}