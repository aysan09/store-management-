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
import { loadSession, saveSession, clearSession, isSessionValid, updateLastActivity } from './utils/sessionUtils';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { notifySuccess, notifyError } from './utils/toastUtils';
import './styles.css';
import './styles/mobile-styles.css';

export default function App() {
  const [view, setView] = useState('hero');
  const [user, setUser] = useState(null);

  // Load user from localStorage on app initialization with session validation
  useEffect(() => {
    if (isSessionValid()) {
      const sessionUser = loadSession();
      if (sessionUser) {
        setUser(sessionUser);
        updateLastActivity();

        const position = sessionUser.position.toLowerCase().trim();
        const department = sessionUser.department.toLowerCase().trim();

        let targetView = 'store';

        if (department.includes('hr') || position.includes('hr')) {
          targetView = 'hr-reviews';
        } else if (department.includes('store') && position.includes('manager')) {
          targetView = 'store-manager';
        }

        const currentHash = window.location.hash.replace('#', '');
        if (!currentHash || currentHash === 'hero') {
          setView(targetView);
          window.location.hash = targetView;
        }
      }
    } else {
      clearSession();
      setUser(null);
    }
  }, []);

  // Enhanced session persistence - save user state on user change
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, [user]);

  // Handle page visibility changes to maintain session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Handle URL hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setView(hash);
      } else {
        setView('hero');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      setView(initialHash);
    } else {
      setView('hero');
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Source of truth for inventory items
  const [inventory, setInventory] = useState([]);

  // Item chosen from the employee inventory page for the next request
  const [requestedItemId, setRequestedItemId] = useState(null);

  // State to track requests submitted by employees
  const [requests, setRequests] = useState([]);

  // State to track registered employees
  const [employees, setEmployees] = useState([
    { id: 1, name: "HR Manager", department: "HR", position: "Manager", employeeId: "HR100", password: "hr123", dateCreated: "2024-02-26" },
    { id: 2, name: "Store Manager", department: "Store", position: "Manager", employeeId: "STORE100", password: "store123", dateCreated: "2024-02-26" }
  ]);

  // Fetch items, requests, and employees from database on app initialization
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from database...');

        // Fetch items
        const itemsResponse = await fetch('/api/items');
        if (itemsResponse.ok) {
          const itemsResult = await itemsResponse.json();
          if (itemsResult.success) {
            setInventory(itemsResult.data);
          }
        } else {
          console.error('Failed to fetch items:', itemsResponse.status);
        }

        // Fetch requests
        const requestsResponse = await fetch('/api/requests');
        if (requestsResponse.ok) {
          const requestsResult = await requestsResponse.json();
          if (requestsResult.success) {
            const requestList = Array.isArray(requestsResult.data)
              ? requestsResult.data
              : (requestsResult.data?.requests || []);
            setRequests(requestList);
          }
        } else {
          console.error('Failed to fetch requests:', requestsResponse.status);
        }

        // Fetch employees
        const employeesResponse = await fetch('/api/employees');
        if (employeesResponse.ok) {
          const employeesResult = await employeesResponse.json();
          if (employeesResult.success) {
            const transformedEmployees = employeesResult.data.map(emp => ({
              id: emp.id,
              name: emp.name,
              department: emp.department,
              position: emp.position,
              employeeId: emp.employee_id,
              dateCreated: emp.date_created
            }));
            setEmployees(transformedEmployees);
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
      const request = requests.find(req =>
        req.employeeName === employeeName &&
        req.itemName === itemName &&
        req.quantity === quantity
      );

      if (!request) {
        notifyError('Request not found. Please try again.');
        return;
      }

      const item = inventory.find(invItem =>
        invItem.model === itemName &&
        invItem.brand === (request.itemBrand || request.brand || invItem.brand)
      );

      if (!item) {
        notifyError('Item not found in inventory. Please check the item name and brand.');
        return;
      }

      if (item.quantity < quantity) {
        notifyError(`Insufficient stock! Only ${item.quantity} ${itemName}(s) available, but ${quantity} requested.`);
        return;
      }

      const response = await fetch(`/api/requests/${request.id}/finish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        notifyError('Server error. Please check if the backend server is running and try again.');
        return;
      }

      const result = await response.json();

      if (result.success) {
        const currentDate = new Date().toISOString().split('T')[0];
        setRequests(prev => prev.map(req =>
          req.id === request.id
            ? { ...req, status: 'Finished', dateFinished: currentDate }
            : req
        ));
        setInventory(prev => prev.map(invItem =>
          invItem.id === item.id
            ? { ...invItem, quantity: invItem.quantity - quantity }
            : invItem
        ));
        notifySuccess(`Request marked as finished successfully! ${quantity} ${itemName}(s) have been deducted from inventory.`);
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
    if (!userData || !userData.id || !userData.password) {
      notifyError('Please enter both employee ID and password.');
      return;
    }
    
    try {
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
          
          localStorage.setItem('currentUser', JSON.stringify(employee));
          
          const position = employee.position.toLowerCase().trim();
          const department = employee.department.toLowerCase().trim();
          
          let targetView = 'store';
          
          if (department.includes('hr') || position.includes('hr')) {
            targetView = 'hr-reviews';
          } else if (department.includes('store') && position.includes('manager')) {
            targetView = 'store-manager';
          }
          
          notifySuccess(`Welcome back, ${employee.name || 'User'}!`);
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
          
          localStorage.setItem('currentUser', JSON.stringify(employee));
          
          const position = employee.position.toLowerCase().trim();
          const department = employee.department.toLowerCase().trim();
          
          let targetView = 'store';
          
          if (department.includes('hr') || position.includes('hr')) {
            targetView = 'hr-reviews';
          } else if (department.includes('store') && position.includes('manager')) {
            targetView = 'store-manager';
          }
          
          notifySuccess(`Welcome back, ${employee.name || 'User'}!`);
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
    window.location.hash = '';
    localStorage.removeItem('currentUser');
  };

  const navigateTo = (viewName) => {
    setView(viewName);
    window.location.hash = viewName;
  };

  // Helper function to render active view
  const renderCurrentView = () => {
    if (view === 'login') {
      return <Login onBack={() => setView('hero')} onLoginSuccess={handleLoginSuccess} />;
    }

    if (view === 'store') {
      const handleStoreRequest = (selectedItem) => {
        setRequestedItemId(selectedItem?.id ?? null);
        setView('request-form');
        window.location.hash = 'request-form';
      };
      
      return (
        <StorePage 
          onBack={handleLogout} 
          onRequest={handleStoreRequest} 
          items={inventory} 
          isManager={false}
        />
      );
    }

    if (view === 'store-manager') {
      return (
        <StoreManagerPage 
          onBack={handleLogout} 
          inventory={inventory} 
          setInventory={setInventory}
          onViewRequests={() => setView('hr-reviews')}
          onAddItem={() => setView('add-item')}
          onViewFinished={() => navigateTo('finished-requests')}
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
          preselectedItemId={requestedItemId}
          user={user}
          onAddRequest={(newRequest) => setRequests(previous => [...previous, newRequest])}
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

    if (view === 'hr-reviews') {
      return (
        <HRReview 
          onBack={handleLogout} 
          onViewRecords={() => navigateTo('hr-records')}
          onRegisterEmployee={() => navigateTo('employee-registration')}
          onEmployeeManagement={() => navigateTo('employee-management')}
          pendingRequests={requests}
          setRequests={setRequests}
        />
      );
    }

    if (view === 'hr-records') {
      return (
        <HRRecords 
          onBack={() => setView('hr-reviews')} 
          allRequests={requests}
          onGoToHRReview={() => setView('hr-reviews')}
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

    return <HeroPage onLoginClick={() => setView('login')} onAboutClick={() => setView('about')} />;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {renderCurrentView()}
    </>
  );
}