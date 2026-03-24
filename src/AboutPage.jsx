import React, { useState, useEffect, useRef } from 'react';
import './styles/enhanced-about-page-styles.css';

export default function AboutPage({ onBack }) {
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
    const observer = new IntersectionObserver(
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

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Team members data
  const teamData = [
    {
      name: "Sarah Johnson",
      role: "Store Manager",
      department: "Operations",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      bio: "10 years of experience in retail operations and inventory management."
    },
    {
      name: "Michael Chen",
      role: "HR Manager", 
      department: "Human Resources",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Specialist in employee relations and system implementation."
    },
    {
      name: "Emily Rodriguez",
      role: "IT Administrator",
      department: "Technology",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      bio: "Ensures system security and optimal performance."
    },
    {
      name: "David Kim",
      role: "Inventory Specialist",
      department: "Operations",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      bio: "Expert in stock management and supply chain optimization."
    }
  ];

  return (
    <div className="about-page">
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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#1e40af">
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#1e40af">
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

      {/* Team Section */}
      <section className="team-section" ref={teamRef}>
        <div className="container">
          <div className="section-header">
            <h2>Our Dedicated Team</h2>
            <p className="section-subtitle">
              Meet the passionate professionals behind our success
            </p>
          </div>
          
          <div className="team-grid">
            {teamData.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                  <div className="image-overlay">
                    <span className="department-badge">{member.department}</span>
                  </div>
                </div>
                <div className="team-info">
                  <h4>{member.name}</h4>
                  <p className="role">{member.role}</p>
                  <p className="bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Store Operations?</h2>
            <p>Join hundreds of satisfied clients who have streamlined their operations with our comprehensive store management solution.</p>
            <div className="cta-buttons">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
