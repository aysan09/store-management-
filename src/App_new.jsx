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
import SQLWorkbench from './SQLWorkbench';
import HREmployees from './HREmployees';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { notifySuccess, notifyError, notifyWarning } from './utils/toastUtils';
import './styles.css';
import './styles/toast-styles.css';

export default function App() {
  const [view, setView] = useState('hero');
  const [user, setUser] = useState(null);

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

  // Function to show toast notifications
  const showToast = {
    success: (message, duration) => {
      // This will be implemented when we wrap the app with ToastProvider
      console.log('Success:', message);
    },
    error: (message, duration) => {
      // This will be implemented when we wrap the app with ToastProvider
      console.log('Error:', message);
    },
    warning: (message, duration) => {
      // This will be implemented when we wrap the app with ToastProvider
      console.log('Warning:', message);
    },
    info: (message, duration) => {
      // This will be implemented when we wrap the app with ToastProvider
      console.log('Info:', message);
    }
  };

  // Fetch items, requests, and employees from database on app initialization
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from database...');

        // Fetch items
        const itemsResponse = await fetch('/api/items');
        console.log('Items response status:', itemsResponse.status);
        if (itemsResponse.ok) {
          const itemsResult = await itemsResponse.json();
          console.log('Items result:', itemsResult);
          if (itemsResult.success) {
            setInventory(itemsResult.data);
            console.log('Inventory updated with:', itemsResult.data.length, 'items');
          }
        } else {
          console.error('Failed to fetch items:', itemsResponse.status);
        }

        // Fetch requests
        const requestsResponse = await fetch('/api/requests');
        console.log('Requests response status:', requestsResponse.status);
        if (requestsResponse.ok) {
          const requestsResult = await requestsResponse.json();
          console.log('Requests result:', requestsResult);
          if (requestsResult.success) {
            // Backend already returns camelCase field names, no transformation needed
            setRequests(requestsResult.data);
            console.log('Requests updated with:', requestsResult.data.length, 'requests');
          }
        } else {
          console.error('Failed to fetch requests:', requestsResponse.status);
        }

        // Fetch employees
        const employeesResponse = await fetch('/api/employees');
        console.log('Employees response status:', employeesResponse.status);
        if (employeesResponse.ok) {
          const employeesResult = await employeesResponse.json();
          console.log('Employees result:', employeesResult);
          if (employeesResult.success) {
            // Transform database field names to frontend field names
            const transformedEmployees = employeesResult.data.map(emp => ({
              id: emp.id,
              name: emp.name,
              department: emp.department,
              position: emp.position,
              employeeId: emp.employee_id,
              dateCreated: emp.date_created
            }));
            setEmployees(transformedEmployees);
            console.log('Employees updated with:', transformedEmployees.length, 'employees');
          }
        } else {
          console.error('Failed to fetch employees:', employeesResponse.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Function to mark a request as finished
  const markRequestFinished = async (employeeName, itemName, quantity) => {
    try {
      console.log('markRequestFinished called with:', { employeeName, itemName, quantity });
      console.log('Current requests:', requests);
      
      // Find the request to get its ID
      const request = requests.find(req => 
        req.employeeName === employeeName && 
        req.itemName === itemName && 
        req.quantity === quantity
      );

      console.log('Found request:', request);

      if (!request) {
        notifyWarning('Request not found. Please try again.');
        return;
      }

      // Update status in database - move from approved to finished
      const response = await fetch(`/api/requests/${request.id}/finish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response is HTML (indicates 404 or server error)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        notifyError('Server error. Please check if the backend server is running and try again.');
        return;
      }
      
      const result = await response.json();
      console.log('Response result:', result);
      
      if (result.success) {
        // Update local state
        const currentDate = new Date().toISOString().split('T')[0];
        setRequests(prev => prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'Finished', dateFinished: currentDate }
            : req
        ));
        notifySuccess('Request marked as finished successfully!');
      } else {
        notifyError('Error marking request as finished: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error marking request as finished:', error);
      notifyError('Error marking request as finished. Please check your connection and try again.');
    }
  };

  // Function to add a new employee
  const handleAddEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  // Logic to handle login and role redirection
  const handleLoginSuccess = async (userData) => {
    // Validate input data
    if (!userData || !userData.id || !userData.password) {
      notifyWarning('Please enter both employee ID and password.');
      return;
    }
    
    try {
      // Authenticate against the backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: userData.id,
          password: userData.password
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const employee = result.data;
          setUser(employee);
          
          // Role-based navigation based on employee position/department
          const position = employee.position.toLowerCase().trim();
          const department = employee.department.toLowerCase().trim();
          
          // Determine role and navigate accordingly
          let targetView = 'store'; // Default view for regular employees
          
          if (department.includes('hr') || position.includes('hr')) {
            targetView = 'hr-reviews';
          } else if (department.includes('store') && position.includes('manager')) {
            targetView = 'store-manager';
          }
          
          setView(targetView);
        } else {
          notifyError(result.message || 'Invalid employee ID or password. Please try again.');
        }
      } else {
        // Fallback to local authentication if API is not available
        const employee = employees.find(emp => {
          const employeeId = emp.employeeId || emp.employee_id;
          return employeeId === userData.id;
        });
        
        if (employee && employee.password === userData.password) {
          setUser(employee);
          
          const position = employee.position.toLowerCase().trim();
          const department = employee.department.toLowerCase().trim();
          
          let targetView = 'store';
          
          if (department.includes('hr') || position.includes('hr')) {
            targetView = 'hr-reviews';
          } else if (department.includes('store') && position.includes('manager')) {
            targetView = 'store-manager';
          }
          
          setView(targetView);
        } else {
          notifyError('Invalid employee ID or password. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      notifyError('Login failed. Please check your connection and try again.');
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
    return (
      <>
        <Login onBack={() => setView('hero')} onLoginSuccess={handleLoginSuccess} />
        <ToastContainer />
      </>
    );
  }

  // Employee Views
  if (view === 'store') {
    return (
      <>
        <StorePage 
          onBack={handleLogout} 
          onRequest={() => setView('request-form')} 
          items={inventory} 
          isManager={false}
        />
        <ToastContainer />
      </>
    );
  }

  // Store Manager View
  if (view === 'store-manager') {
    return (
      <>
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
        <ToastContainer />
      </>
    );
  }

  if (view === 'add-item') {
    return (
      <>
        <AddItemPage 
          onBack={() => setView('store-manager')} 
          onSave={(newItem) => {
            setInventory([...inventory, newItem]);
            setView('store-manager');
          }}
          onViewRequests={() => setView('approved-requests')}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === 'approved-requests') {
    return (
      <>
        <ApprovedRequests 
          onBack={() => setView('add-item')}
          approvedRequests={requests.filter(req => req.status === 'Approved')}
          onMarkFinished={markRequestFinished}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === 'finished-requests') {
    return (
      <>
        <FinishedRequests 
          onBack={() => setView('store-manager')}
          finishedRequests={requests.filter(req => req.status === 'Finished')}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === 'request-form') {
    return (
      <>
        <RequestForm 
          onBack={() => setView('store')} 
          onViewStatus={() => setView('request-status')}
          items={inventory} 
          user={user}
          onAddRequest={(newRequest) => setRequests([...requests, newRequest])}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === 'request-status') {
    return (
      <>
        <RequestStatus 
          onBack={() => setView('request-form')} 
          requests={requests} 
        />
        <ToastContainer />
      </>
    );
  }

  // HR Manager View

  if (view === 'hr-reviews') {
    return (
      <HRReview 
        onBack={handleLogout} 
        onViewRecords={() => setView('hr-records')}
        onRegisterEmployee={() => setView('employee-registration')}
        onEmployeeManagement={() => setView('employee-management')}
        pendingRequests={requests}
        setRequests={setRequests}
      />
    );
  }

  if (view === 'hr-records') {
    return (
      <>
        <HRRecords 
          onBack={handleLogout} 
          allRequests={requests}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === 'employee-registration') {
    return (
      <>
        <EmployeeRegistration 
          onBack={() => setView('hr-reviews')}
          onAddEmployee={handleAddEmployee}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === 'employee-management') {
    return (
      <>
        <HREmployees 
          onBack={() => setView('hr-reviews')}
        />
        <ToastContainer />
      </>
    );
  }

  // SQL Workbench View
  if (view === 'sql-workbench') {
    return (
      <>
        <SQLWorkbench 
          onBack={handleLogout}
        />
        <ToastContainer />
      </>
    );
  }

  // Default Hero Page
  return (
    <HeroPage onLoginClick={() => setView('login')} />
  );
}
