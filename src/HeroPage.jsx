import React, { useState, useEffect, useRef } from 'react';
import logo from './vascom-logo.png';
import './styles.css';
import './styles/enhanced-about-page-styles.css';

export default function HeroPage({ onLoginClick, onAboutClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    items: 0,
    employees: 0,
    uptime: 0
  });
  const [teamMembers, setTeamMembers] = useState([]);
  
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const teamRef = useRef(null);

  useEffect(() => {
    // Observer for hero section (Nero section)
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const heroLeft = document.querySelector('.hero-left');
          const heroRight = document.querySelector('.hero-right');
          const title = document.querySelector('.title');
          const cta = document.querySelector('.cta');
          const laptop = document.querySelector('.laptop');
          
          if (heroLeft) heroLeft.classList.add('animate-in');
          if (heroRight) heroRight.classList.add('animate-in');
          if (title) title.classList.add('animate-in');
          if (cta) cta.classList.add('animate-in');
          if (laptop) laptop.classList.add('animate-in');
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10px 0px'
      }
    );

    // Observer for stats section
    const statsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Animate counters
          const targetItems = 1000;
          const targetEmployees = 50;
          const targetUptime = 99.9;
          
          const duration = 2000; // 2 seconds
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            setCounters({
              items: Math.floor(targetItems * easeOutCubic),
              employees: Math.floor(targetEmployees * easeOutCubic),
              uptime: +(targetUptime * easeOutCubic).toFixed(1)
            });
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          animate();
        }
      },
      {
        threshold: 0.5, // Trigger when 50% visible
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observer for features section
    const featuresObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const featureCards = document.querySelectorAll('.feature-card');
          featureCards.forEach((card, index) => {
            setTimeout(() => {
              // Alternate animation direction: left, right, left, right...
              if (index % 2 === 0) {
                card.classList.add('translate-left', 'animate-in');
              } else {
                card.classList.add('translate-right', 'animate-in');
              }
            }, index * 100); // Stagger animation with 100ms delay
          });
          
          // Animate section header
          const sectionHeader = document.querySelector('.section-header');
          const sectionSubtitle = document.querySelector('.section-subtitle');
          if (sectionHeader) sectionHeader.classList.add('translate-up', 'animate-in', 'delay-1');
          if (sectionSubtitle) sectionSubtitle.classList.add('translate-down', 'animate-in', 'delay-2');
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    // Observer for mission section
    const missionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const missionCards = document.querySelectorAll('.mission-card');
          missionCards.forEach((card, index) => {
            setTimeout(() => {
              // Alternate animation direction: left, right, left, right...
              if (index % 2 === 0) {
                card.classList.add('translate-left', 'animate-in');
              } else {
                card.classList.add('translate-right', 'animate-in');
              }
            }, index * 150); // Stagger animation with 150ms delay
          });
          
          // Animate mission section header
          const missionContainer = document.querySelector('.container');
          if (missionContainer) {
            const missionTitle = missionContainer.querySelector('h2');
            const missionSubtitle = missionContainer.querySelector('p');
            if (missionTitle) missionTitle.classList.add('translate-up', 'animate-in', 'delay-1');
            if (missionSubtitle) missionSubtitle.classList.add('translate-down', 'animate-in', 'delay-2');
          }
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    // Observer for header section
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const headerTitle = document.querySelector('.about-main-title');
          const headerSubtitle = document.querySelector('.about-subtitle');
          const headerStats = document.querySelector('.header-stats');
          const headerSection = document.querySelector('.about-header');
          const visualShapes = document.querySelector('.visual-shapes');
          
          if (headerTitle) headerTitle.classList.add('translate-left', 'animate-in', 'delay-1');
          if (headerSubtitle) headerSubtitle.classList.add('translate-right', 'animate-in', 'delay-2');
          if (headerStats) headerStats.classList.add('translate-up', 'animate-in', 'delay-3');
          if (headerSection) headerSection.classList.add('animate-in');
          if (visualShapes) visualShapes.classList.add('animate-in');
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    // Observer for stats section (enhanced with header animation)
    const statsObserver2 = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const statCards = document.querySelectorAll('.stat-card');
          statCards.forEach((card, index) => {
            setTimeout(() => {
              // Alternate animation direction: left, right, left, right...
              if (index % 2 === 0) {
                card.classList.add('translate-left', 'animate-in');
              } else {
                card.classList.add('translate-right', 'animate-in');
              }
            }, index * 200); // Stagger animation with 200ms delay
          });
          
          // Animate stats section header
          const statsContainer = document.querySelector('.container');
          if (statsContainer) {
            const statsTitle = statsContainer.querySelector('h2');
            const statsSubtitle = statsContainer.querySelector('p');
            if (statsTitle) statsTitle.classList.add('translate-up', 'animate-in', 'delay-1');
            if (statsSubtitle) statsSubtitle.classList.add('translate-down', 'animate-in', 'delay-2');
          }
        }
      },
      {
        threshold: 0.4,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Start observing the hero section immediately
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroObserver.observe(heroSection);
    }

    if (statsRef.current) {
      statsObserver.observe(statsRef.current);
    }

    if (featuresRef.current) {
      featuresObserver.observe(featuresRef.current);
    }

    if (document.querySelector('.mission-section')) {
      missionObserver.observe(document.querySelector('.mission-section'));
    }

    if (document.querySelector('.about-header')) {
      headerObserver.observe(document.querySelector('.about-header'));
    }

    if (statsRef.current) {
      statsObserver2.observe(statsRef.current);
    }

    return () => {
      if (heroSection) {
        heroObserver.unobserve(heroSection);
      }
      if (statsRef.current) {
        statsObserver.unobserve(statsRef.current);
      }
      if (featuresRef.current) {
        featuresObserver.unobserve(featuresRef.current);
      }
      const missionSection = document.querySelector('.mission-section');
      if (missionSection) {
        missionObserver.unobserve(missionSection);
      }
      const headerSection = document.querySelector('.about-header');
      if (headerSection) {
        headerObserver.unobserve(headerSection);
      }
    };
  }, []);

  const scrollToAbout = () => {
    // Try multiple selectors to find the about section
    const aboutTargets = [
      () => document.querySelector('.about-header'),
      () => document.querySelector('.about-section'),
      () => document.getElementById('about-section'),
      () => document.querySelector('.mission-section'),
      () => document.querySelector('.features-section')
    ];
    
    for (const getTarget of aboutTargets) {
      const target = getTarget();
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    
    // Fallback: scroll down by viewport height
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
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
          <p className="hero-subtitle">Effortless inventory &amp; request management.</p>
          <button className="cta" onClick={scrollToAbout}>About us</button>
        </div>
      <div className="hero-right">
        <div className="analytics-screen-container">
          <div className="screen-frame">
            <div className="screen-header">
              <div className="screen-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="screen-title">Analytics Dashboard</span>
            </div>
            <div className="screen-content">
              <div className="charts-container">
                <div className="bar-chart-section">
                  <div className="bar-graph">
                    <div className="bar" style={{ '--height': '65%', '--color': '#3ba7f2', '--delay': '0.1s' }}>
                      <span className="bar-value">65%</span>
                    </div>
                    <div className="bar" style={{ '--height': '85%', '--color': '#7FE7D6', '--delay': '0.3s' }}>
                      <span className="bar-value">85%</span>
                    </div>
                    <div className="bar" style={{ '--height': '45%', '--color': '#f97316', '--delay': '0.5s' }}>
                      <span className="bar-value">45%</span>
                    </div>
                    <div className="bar" style={{ '--height': '75%', '--color': '#8b5cf6', '--delay': '0.7s' }}>
                      <span className="bar-value">75%</span>
                    </div>
                    <div className="bar" style={{ '--height': '55%', '--color': '#06b6d4', '--delay': '0.9s' }}>
                      <span className="bar-value">55%</span>
                    </div>
                    <div className="bar" style={{ '--height': '90%', '--color': '#ec4899', '--delay': '1.1s' }}>
                      <span className="bar-value">90%</span>
                    </div>
                  </div>
                  <div className="bar-labels">
                    <span>Inv</span>
                    <span>Req</span>
                    <span>HR</span>
                    <span>Sales</span>
                    <span>Rep</span>
                    <span>Usr</span>
                  </div>
                </div>
                <div className="pie-chart-section">
                  <div className="pie-chart">
                    <svg viewBox="0 0 120 120" className="pie-svg">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#3ba7f2" strokeWidth="20"
                        strokeDasharray="78.5 314" strokeDashoffset="0" className="pie-slice" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#7FE7D6" strokeWidth="20"
                        strokeDasharray="62.8 314" strokeDashoffset="-78.5" className="pie-slice" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f97316" strokeWidth="20"
                        strokeDasharray="47.1 314" strokeDashoffset="-141.3" className="pie-slice" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#8b5cf6" strokeWidth="20"
                        strokeDasharray="31.4 314" strokeDashoffset="-188.4" className="pie-slice" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#06b6d4" strokeWidth="20"
                        strokeDasharray="94.2 314" strokeDashoffset="-219.8" className="pie-slice" />
                    </svg>
                    <div className="pie-center">
                      <span className="pie-total">100%</span>
                    </div>
                  </div>
                  <div className="pie-legend">
                    <div className="legend-item"><span className="legend-color" style={{ background: '#3ba7f2' }}></span>Store A 25%</div>
                    <div className="legend-item"><span className="legend-color" style={{ background: '#7FE7D6' }}></span>Store B 20%</div>
                    <div className="legend-item"><span className="legend-color" style={{ background: '#f97316' }}></span>Online 15%</div>
                    <div className="legend-item"><span className="legend-color" style={{ background: '#8b5cf6' }}></span>Other 10%</div>
                    <div className="legend-item"><span className="legend-color" style={{ background: '#06b6d4' }}></span>New 30%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Spacer to push About section down */}
      <div style={{ height: '100px', backgroundColor: 'transparent' }}></div>


      {/* Enhanced Header Section */}
      <header className="about-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="about-main-title">About Vascom Store Management</h1>
            <p className="about-subtitle">
              Empowering efficient operations through innovative technology and dedicated service
            </p>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Years of Excellence</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">System Reliability</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support Available</span>
              </div>
            </div>
          </div>
          <div className="header-visual">
            <div className="visual-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        </div>
      </header>


      {/* Mission & Vision Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3>Our Mission</h3>
              <p>
                To provide cutting-edge store management solutions that streamline operations, 
                enhance employee productivity, and deliver exceptional value to our organization.
              </p>
            </div>
            <div className="mission-card">
              <div className="card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <line x1="8" y1="21" x2="8" y2="21" />
                </svg>
              </div>
              <h3>Our Vision</h3>
              <p>
                To be the leading provider of innovative store management systems, 
                setting industry standards for efficiency and user experience.
              </p>
            </div>
            <div className="mission-card">
              <div className="card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Our Values</h3>
              <p>
                Innovation, reliability, customer satisfaction, and continuous improvement 
                drive everything we do in our pursuit of excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section" ref={featuresRef}>
        <div className="container">
          <div className="section-header">
            <h2>Key Features</h2>
            <p className="section-subtitle">
              Discover the powerful capabilities that make our system the preferred choice 
              for modern store management
            </p>
          </div>
          
          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2">
                  <rect x="4" y="5" width="16" height="14" />
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="13" x2="20" y2="13" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </div>
              <h3>Real-time Inventory Management</h3>
              <p>Track every item in real-time with automatic stock updates, low inventory alerts, and comprehensive reporting tools.</p>
              <div className="feature-badges">
                <span className="badge">Live Updates</span>
                <span className="badge">Auto Alerts</span>
                <span className="badge">Analytics</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3>Streamlined Request System</h3>
              <p>Empower employees with an intuitive request system featuring approval workflows and status tracking.</p>
              <div className="feature-badges">
                <span className="badge">Easy Requests</span>
                <span className="badge">Approval Flow</span>
                <span className="badge">Status Tracking</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#0b3D91">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                </svg>
              </div>
              <h3>Comprehensive HR Management</h3>
              <p>Complete employee lifecycle management from onboarding to offboarding with secure access controls.</p>
              <div className="feature-badges">
                <span className="badge">Employee Records</span>
                <span className="badge">Access Control</span>
                <span className="badge">Onboarding</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-5 5-2-2-4 4" />
                </svg>
              </div>
              <h3>Advanced Analytics & Reporting</h3>
              <p>Gain valuable insights with detailed reports on inventory usage, request patterns, and system performance.</p>
              <div className="feature-badges">
                <span className="badge">Data Insights</span>
                <span className="badge">Custom Reports</span>
                <span className="badge">Performance Metrics</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3>Secure & Scalable</h3>
              <p>Enterprise-grade security with scalable architecture that grows with your business needs.</p>
              <div className="feature-badges">
                <span className="badge">Secure</span>
                <span className="badge">Scalable</span>
                <span className="badge">Reliable</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <h3>24/7 Support</h3>
              <p>Dedicated support team available around the clock to ensure your operations run smoothly.</p>
              <div className="feature-badges">
                <span className="badge">24/7 Support</span>
                <span className="badge">Quick Response</span>
                <span className="badge">Expert Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2">
                  <rect x="4" y="5" width="16" height="14" />
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="13" x2="20" y2="13" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{counters.items.toLocaleString()}+</h3>
                <p>Items Managed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#0b3D91">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{counters.employees}+</h3>
                <p>Employees Served</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 2 12 12 16 16" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{counters.uptime}%</h3>
                <p>System Uptime</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0b3D91" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>15+</h3>
                <p>Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

     

    
    </div>
  );
}