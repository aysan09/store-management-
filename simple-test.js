// Simple test to check if backend is working
const http = require('http');

function testBackend() {
  console.log('Testing backend connectivity...\n');
  
  // Test health check endpoint
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      const data = JSON.parse(chunk);
      console.log('Response:', data);
      if (data.status === 'healthy') {
        console.log('✅ Backend is working correctly!');
      } else {
        console.log('❌ Backend is not healthy');
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Error:', error.message);
    console.log('This usually means the backend server is not running.');
    console.log('Please start the backend server with: node backend/server.js');
  });

  req.end();
}

testBackend();