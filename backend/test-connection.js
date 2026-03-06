const mysql = require('mysql2/promise');

async function testDirectConnection() {
  try {
    console.log('Testing MySQL connection...');
    console.log('Host:', 'localhost');
    console.log('Port:', 3306);
    console.log('User:', 'root');
    console.log('Password:', '');
    console.log('Database:', 'store_management');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306
    });
    
    console.log('✅ Direct connection successful!');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query executed successfully:', rows);
    
    await connection.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
  }
}

testDirectConnection();
