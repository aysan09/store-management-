import React, { useState } from 'react';
import Login from './Login';
import StorePage from './StorePage';
import StoreManagerPage from './StoreManagerPage';
import AddItemPage from './AddItemPage';
import RequestForm from './RequestForm';
import RequestStatus from './RequestStatus';
import HRReview from './HRReview';
import HRRecords from './HRRecords';
import ApprovedRequests from './approvedrequests';
import HeroPage from './HeroPage';

export default function App() {
  const [view, setView] = useState('hero');
  const [user, setUser] = useState(null);

  // Source of truth for inventory items
  const [inventory, setInventory] = useState([
    {
      id: 1,
      model: "Modem",
      brand: "NETGEAR, Motorola",
      category: "Data Communication",
      quantity: 5,
      photo: "https://via.placeholder.com/150",
      date: "2024-02-25"
    },
    {
      id: 2,
      model: "CCTV wire",
      brand: "D-Link",
      category: "wire",
      quantity: 8,
      photo: "https://via.placeholder.com/150",
      date: "2024-02-24"
    },
    {
      id: 3,
      model: "CCTV wire",
      brand: "D-Link",
      category: "wire",
      quantity: 0,
      photo: "https://via.placeholder.com/150",
      date: "2024-02-23"
    }
  ]);

  // State to track requests submitted by employees
  const [requests, setRequests] = useState([
    { 
      employeeName: "Nati", 
      itemName: "Modem", 
      quantity: 6, 
      purpose: "For developing ict infrastructure", 
      status: "Pending", 
      dateAdded: "2024-02-25",
      dateApproved: null,
      dateFinished: null
    },
    { 
      employeeName: "Nati", 
      itemName: "Modem", 
      quantity: 6, 
      purpose: "For developing ict infrastructure", 
      status: "Approved", 
      dateAdded: "2024-02-24",
      dateApproved: "2024-02-24",
      dateFinished: null
    },
    { 
      employeeName: "Nati", 
      itemName: "Modem", 
      quantity: 6, 
      purpose: "For developing ict infrastructure", 
      status: "Approved", 
      dateAdded: "2024-02-23",
      dateApproved: "2024-02-23",
      dateFinished: null
    }
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

  // Logic to handle login and role redirection
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.id === 'HR100') {
      setView('hr-reviews');
    } else if (userData.id === 'STORE100') {
      setView('store-manager');
    } else {
      setView('store');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('hero');
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
        onViewRecords={() => setView('hr-records')}
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

  // Default Hero Page
  return (
    <HeroPage onLoginClick={() => setView('login')} />
  );
}
