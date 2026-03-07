// Test script to check backend connectivity
const fetch = require('node-fetch').default;

async function testBackend() {
  console.log('Testing backend connectivity...\n');
  
  try {
    // Test health check endpoint
    console.log('1. Testing health check endpoint...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData.message);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    console.log('This usually means the backend server is not running.');
    console.log('Please start the backend server with: node backend/server.js');
  }

  try {
    // Test employees endpoint
    console.log('\n2. Testing employees endpoint...');
    const employeesResponse = await fetch('http://localhost:5000/api/employees');
    if (employeesResponse.ok) {
      const employeesData = await employeesResponse.json();
      console.log('✅ Employees endpoint working, found', employeesData.count, 'employees');
    } else {
      console.log('❌ Employees endpoint failed:', employeesResponse.status);
    }
  } catch (error) {
    console.log('❌ Employees endpoint error:', error.message);
  }

  try {
    // Test POST request to employees
    console.log('\n3. Testing employee registration...');
    const testEmployee = {
      name: 'Test Employee',
      department: 'Test',
      position: 'Tester',
      employeeId: 'TEST123',
      password: 'test123'
    };

    const registerResponse = await fetch('http://localhost:5000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmployee)
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Employee registration successful:', registerData.message);
    } else {
      const errorData = await registerResponse.json().catch(() => ({}));
      console.log('❌ Employee registration failed:', errorData.message || registerResponse.status);
    }
  } catch (error) {
    console.log('❌ Employee registration error:', error.message);
  }
}

testBackend();