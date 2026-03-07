import React, { useState, useEffect } from 'react';
import Login from './Login';
import StorePage from './StorePage';
import StoreManagerPage from './StoreManagerPage';
import AddItemPage from './AddItemPage';
import RequestForm from './RequestForm';
import RequestStatus from './RequestStatus';
import HRReview from './HRReview';
import HRRecords from './HRRecords';
import ApprovedRequests from './approvedrequests';
import FinishedRequests from './FinishedRequests';
import HeroPage from './HeroPage';
import EmployeeRegistration from './EmployeeRegistration';
import HREmployees from './HREmployees';

export default function App() {
  const [view, setView] = useState('hero');
  const [user, setUser] = useState(null);

  // Handle URL hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setView(hash);
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial view from hash if present
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      setView(initialHash);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Source of truth for inventory items
  const [inventory, setInventory] = useState([]);

  // State to track requests submitted by employees
  const [requests, setRequests] = useState([]);

  // State to track registered employees
  const [employees, setEmployees] = useState([
    // Default employees for testing
    { id: 1, name: "HR Manager", department: "HR", position: "Manager", employeeId: "HR100", password: "hr123", dateCreated: "2024-02-26" },
    { id: 2, name: "Store Manager", department: "Store", position: "Manager", employeeId: "STORE100", password: "store123", dateCreated: "2024-02-26" }
  ]);

  // Function to mark a request as finished
  const markRequestFinished = (employeeName, itemName, quantity) => {
    const currentDate = new Date().toISOString().split('T')[0];
    setRequests(prev => prev.map(req => 
      req.employeeName === employeeName && req.itemName === itemName && req.quantity === quantity 
        ? { ...req, status: 'Finished', dateFinished: currentDate }
        : req
    ));
  };

  // Function to add a new employee
  const handleAddEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  // Logic to handle login and role redirection
  const handleLoginSuccess = async (userData) => {
    try {
      // Use the proper authentication endpoint
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_Id: userData.id,
          password: userData.password
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const employee = result.data;
        setUser(employee);
        
        // Role-based navigation based on employee position/department
        if (employee.position.toLowerCase().includes('hr') || employee.department.toLowerCase().includes('hr')) {
          setView('hr-reviews');
        } else if (employee.position.toLowerCase().includes('manager') && employee.department.toLowerCase().includes('store')) {
          setView('store-manager');
        } else {
          setView('store');
        }
      } else {
        alert(result.message || 'Invalid employee ID or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check if the server is running.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('hero');
    window.location.hash = '';
  };

  const navigateTo = (viewName) => {
    setView(viewName);
    window.location.hash = viewName;
  };

  // --- View Rendering Logic ---
  console.log('Current view:', view);

  if (view === 'login') {
    console.log('Rendering login page');
    return <Login onBack={() => setView('hero')} onLoginSuccess={handleLoginSuccess} />;
  }

  // Employee Views
  if (view === 'store') {
    return (
      <StorePage 
        onBack={handleLogout} 
        onRequest={() => setView('request-form')} 
        items={inventory} 
        isManager={false}
      />
    );
  }

  // Store Manager View
  if (view === 'store-manager') {
    return (
      <StoreManagerPage 
        onBack={handleLogout} 
        inventory={inventory} 
        setInventory={setInventory}
        onViewRequests={() => setView('hr-reviews')}
        onAddItem={() => setView('add-item')}
        onViewFinished={() => setView('finished-requests')}
        approvedRequests={requests.filter(req => req.status === 'Approved')}
        onMarkFinished={markRequestFinished}
      />
    );
  }

  if (view === 'add-item') {
    return (
      <AddItemPage 
        onBack={() => setView('store-manager')} 
        onSave={(newItem) => {
          setInventory([...inventory, newItem]);
          setView('store-manager');
        }}
        onViewRequests={() => setView('approved-requests')}
      />
    );
  }

  if (view === 'approved-requests') {
    return (
      <ApprovedRequests 
        onBack={() => setView('add-item')}
        approvedRequests={requests.filter(req => req.status === 'Approved')}
        onMarkFinished={markRequestFinished}
      />
    );
  }

  if (view === 'finished-requests') {
    return (
      <FinishedRequests 
        onBack={() => setView('store-manager')}
        finishedRequests={requests.filter(req => req.status === 'Finished')}
      />
    );
  }

  if (view === 'request-form') {
    return (
      <RequestForm 
        onBack={() => setView('store')} 
        onViewStatus={() => setView('request-status')}
        items={inventory} 
        onAddRequest={(newRequest) => setRequests([...requests, newRequest])}
      />
    );
  }

  if (view === 'request-status') {
    return (
      <RequestStatus 
        onBack={() => setView('request-form')} 
        requests={requests} 
      />
    );
  }

  // HR Manager View

  if (view === 'hr-reviews') {
    return (
      <HRReview 
        onBack={handleLogout} 
        onViewRecords={() => navigateTo('hr-records')}
        onRegisterEmployee={() => navigateTo('employee-registration')}
        pendingRequests={requests}
        setRequests={setRequests}
      />
    );
  }

  if (view === 'hr-records') {
    return (
      <HRRecords 
        onBack={handleLogout} 
        allRequests={requests}
      />
    );
  }

  if (view === 'employee-management') {
    return (
      <HREmployees 
        onBack={() => setView('hr-reviews')}
      />
    );
  }

  if (view === 'employee-registration') {
    return (
      <EmployeeRegistration 
        onBack={() => setView('hr-reviews')}
        onAddEmployee={handleAddEmployee}
      />
    );
  }

  // Default Hero Page
  return (
    <HeroPage onLoginClick={() => setView('login')} />
  );
}
