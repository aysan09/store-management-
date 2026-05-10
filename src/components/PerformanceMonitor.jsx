import React, { useState, useEffect } from 'react';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    connectionType: 'unknown'
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !localStorage.getItem('enablePerformanceMonitor')) {
      return;
    }

    const updateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const resource = performance.getEntriesByType('resource');

      // Basic performance metrics
      const loadTime = navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0;
      const domContentLoaded = navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0;
      
      const firstPaint = paint.find(entry => entry.name === 'first-paint');
      const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint');

      // Memory usage (if available)
      const memory = performance.memory;
      const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0; // MB

      // Network connection type
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const connectionType = connection ? connection.effectiveType : 'unknown';

      setMetrics({
        loadTime,
        domContentLoaded,
        firstPaint: firstPaint ? Math.round(firstPaint.startTime) : 0,
        firstContentfulPaint: firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : 0,
        largestContentfulPaint: 0, // Will be updated by observer
        cumulativeLayoutShift: 0, // Will be updated by observer
        firstInputDelay: 0, // Will be updated by observer
        memoryUsage,
        connectionType
      });
    };

    // Web Vitals monitoring
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({
            ...prev,
            largestContentfulPaint: Math.round(lastEntry.startTime)
          }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          setMetrics(prev => ({
            ...prev,
            cumulativeLayoutShift: Math.round(clsValue * 1000) / 1000
          }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            setMetrics(prev => ({
              ...prev,
              firstInputDelay: Math.round(entry.processingStart - entry.startTime)
            }));
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        return () => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          fidObserver.disconnect();
        };
      }
    };

    // Initial metrics
    updateMetrics();
    
    // Observe Web Vitals
    const cleanup = observeWebVitals();

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, []);

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="performance-metrics">
      <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
        Performance Metrics
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
        <div>Load Time:</div>
        <div style={{ color: metrics.loadTime > 3000 ? '#ef4444' : metrics.loadTime > 1000 ? '#f59e0b' : '#10b981' }}>
          {metrics.loadTime}ms
        </div>
        
        <div>DOM Content:</div>
        <div style={{ color: metrics.domContentLoaded > 1500 ? '#ef4444' : metrics.domContentLoaded > 800 ? '#f59e0b' : '#10b981' }}>
          {metrics.domContentLoaded}ms
        </div>
        
        <div>First Paint:</div>
        <div style={{ color: metrics.firstPaint > 1500 ? '#ef4444' : metrics.firstPaint > 800 ? '#f59e0b' : '#10b981' }}>
          {metrics.firstPaint}ms
        </div>
        
        <div>FCP:</div>
        <div style={{ color: metrics.firstContentfulPaint > 1800 ? '#ef4444' : metrics.firstContentfulPaint > 1200 ? '#f59e0b' : '#10b981' }}>
          {metrics.firstContentfulPaint}ms
        </div>
        
        <div>LCP:</div>
        <div style={{ color: metrics.largestContentfulPaint > 4000 ? '#ef4444' : metrics.largestContentfulPaint > 2500 ? '#f59e0b' : '#10b981' }}>
          {metrics.largestContentfulPaint}ms
        </div>
        
        <div>CLS:</div>
        <div style={{ color: metrics.cumulativeLayoutShift > 0.25 ? '#ef4444' : metrics.cumulativeLayoutShift > 0.1 ? '#f59e0b' : '#10b981' }}>
          {metrics.cumulativeLayoutShift}
        </div>
        
        <div>FID:</div>
        <div style={{ color: metrics.firstInputDelay > 300 ? '#ef4444' : metrics.firstInputDelay > 100 ? '#f59e0b' : '#10b981' }}>
          {metrics.firstInputDelay}ms
        </div>
        
        <div>Memory:</div>
        <div style={{ color: metrics.memoryUsage > 100 ? '#ef4444' : metrics.memoryUsage > 50 ? '#f59e0b' : '#10b981' }}>
          {metrics.memoryUsage}MB
        </div>
        
        <div>Connection:</div>
        <div style={{ color: metrics.connectionType === '4g' ? '#10b981' : metrics.connectionType === '3g' ? '#f59e0b' : '#ef4444' }}>
          {metrics.connectionType}
        </div>
      </div>
      
      <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center' }}>
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;