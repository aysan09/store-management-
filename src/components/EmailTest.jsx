import React, { useState } from 'react';
import { sendRequestNotification, sendApprovalNotification, sendEmployeeApprovalNotification } from '../services/emailService';

export default function EmailTest() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const testRequestNotification = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, '🧪 Testing request notification...']);
    
    const testRequest = {
      employeeName: 'Test User',
      itemName: 'Test Modem',
      quantity: 2,
      purpose: 'Testing email functionality',
      status: 'Pending'
    };

    try {
      const result = await sendRequestNotification(testRequest);
      setTestResults(prev => [...prev, 
        result.success 
          ? '✅ Request notification test passed' 
          : `❌ Request notification test failed: ${result.message}`
      ]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Request notification error: ${error.message}`]);
    }
    
    setIsLoading(false);
  };

  const testApprovalNotification = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, '🧪 Testing approval notification...']);
    
    const testRequest = {
      employeeName: 'Test User',
      itemName: 'Test Modem',
      quantity: 2,
      purpose: 'Testing email functionality',
      status: 'Approved'
    };

    try {
      const result = await sendApprovalNotification(testRequest);
      setTestResults(prev => [...prev, 
        result.success 
          ? '✅ Approval notification test passed' 
          : `❌ Approval notification test failed: ${result.message}`
      ]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Approval notification error: ${error.message}`]);
    }
    
    setIsLoading(false);
  };

  const testEmployeeApprovalNotification = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, '🧪 Testing employee approval notification...']);
    
    const testRequest = {
      employeeName: 'John Doe',
      itemName: 'Wireless Mouse',
      quantity: 1,
      purpose: 'Replacing broken mouse',
      status: 'Approved'
    };

    try {
      const result = await sendEmployeeApprovalNotification(testRequest);
      setTestResults(prev => [...prev, 
        result.success 
          ? '✅ Employee approval notification test passed' 
          : `❌ Employee approval notification test failed: ${result.message}`
      ]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Employee approval notification error: ${error.message}`]);
    }
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Email Notification Test Suite</h2>
      <p>Test the email notification functionality for request submissions and approvals.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testRequestNotification} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          Test Request Notification
        </button>
        
        <button 
          onClick={testApprovalNotification} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          Test Store Manager Notification
        </button>
        
        <button 
          onClick={testEmployeeApprovalNotification} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          Test Employee Notification
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      {isLoading && (
        <div style={{ marginBottom: '20px', color: '#007bff' }}>
          Testing... Please wait
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Test Results:</h3>
        {testResults.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No tests run yet. Click a test button above to start.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {testResults.map((result, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
        <p><strong>Note:</strong> This is a mock email service for demonstration purposes. 
        In a real application, you would integrate with an actual email service provider.</p>
        <p><strong>Mock Email Recipients:</strong></p>
        <ul>
          <li><strong>HR Managers:</strong> hrmanager@company.com, hrassistant@company.com</li>
        <li><strong>Store Managers:</strong> storemanager@company.com, inventory@company.com</li>
        <li><strong>Employees:</strong> Generated from employee names (e.g., john.doe@company.com)</li>
        </ul>
      </div>
    </div>
  );
}