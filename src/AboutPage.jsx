import React, { useState, useEffect } from 'react';

export default function AboutPage({ onBack }) {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all sections by ID
    const sections = document.querySelectorAll('#stats, #features, #team');
    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

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
            <div 
              className={`stat-card ${isVisible['stats'] ? 'animate-in' : ''}`}
              id="stats"
              style={{
                animationDelay: '0.1s',
                transform: isVisible['stats'] ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible['stats'] ? 1 : 0
              }}
            >
              <h3>1000+</h3>
              <p>Items Managed</p>
            </div>
            <div 
              className={`stat-card ${isVisible['stats'] ? 'animate-in' : ''}`}
              style={{
                animationDelay: '0.3s',
                transform: isVisible['stats'] ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible['stats'] ? 1 : 0
              }}
            >
              <h3>50+</h3>
              <p>Employees Served</p>
            </div>
            <div 
              className={`stat-card ${isVisible['stats'] ? 'animate-in' : ''}`}
              style={{
                animationDelay: '0.5s',
                transform: isVisible['stats'] ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible['stats'] ? 1 : 0
              }}
            >
              <h3>99.9%</h3>
              <p>System Uptime</p>
            </div>
          </div>
        </div>

        <div 
          className={`about-features ${isVisible['features'] ? 'animate-in' : ''}`}
          id="features"
          style={{
            transform: isVisible['features'] ? 'translateY(0)' : 'translateY(40px)',
            opacity: isVisible['features'] ? 1 : 0
          }}
        >
          <h2>Key Features</h2>
          <div className="features-grid">
            <div 
              className={`feature-card ${isVisible['features'] ? 'animate-in' : ''}`}
              style={{
                animationDelay: '0.2s',
                transform: isVisible['features'] ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible['features'] ? 1 : 0
              }}
            >
              <h3>Inventory Management</h3>
              <p>Real-time tracking of all store items with automatic stock updates and low inventory alerts.</p>
            </div>
            <div 
              className={`feature-card ${isVisible['features'] ? 'animate-in' : ''}`}
              style={{
                animationDelay: '0.4s',
                transform: isVisible['features'] ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible['features'] ? 1 : 0
              }}
            >
              <h3>Employee Requests</h3>
              <p>Streamlined request system allowing employees to easily request items with approval workflows.</p>
            </div>
            <div 
              className={`feature-card ${isVisible['features'] ? 'animate-in' : ''}`}
              style={{
                animationDelay: '0.6s',
                transform: isVisible['features'] ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible['features'] ? 1 : 0
              }}
            >
              <h3>HR Management</h3>
              <p>Comprehensive employee management including registration, records, and access control.</p>
            </div>
            <div 
              className={`feature-card ${isVisible['features'] ? 'animate-in' : ''}`}
              style={{
                animationDelay: '0.8s',
                transform: isVisible['features'] ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible['features'] ? 1 : 0
              }}
            >
              <h3>Reporting & Analytics</h3>
              <p>Detailed reports on inventory usage, request patterns, and system performance metrics.</p>
            </div>
          </div>
        </div>

        <div 
          className={`about-team ${isVisible['team'] ? 'animate-in' : ''}`}
          id="team"
          style={{
            transform: isVisible['team'] ? 'translateY(0)' : 'translateY(40px)',
            opacity: isVisible['team'] ? 1 : 0
          }}
        >
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
