const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'store_management',
    port: process.env.DB_PORT || 3306
});

async function checkData() {
    try {
        console.log('=== Checking Database Data ===');

        // Check items table
        const [items] = await db.execute('SELECT * FROM items');
        console.log('Items in database:');
        items.forEach(item => {
            console.log('- ID:', item.id, '| Model:', item.model, '| Brand:', item.brand, '| Quantity:', item.quantity);
        });

        // Check requests table
        const [requests] = await db.execute('SELECT * FROM requests');
        console.log('\nRequests in database:');
        requests.forEach(req => {
            console.log('- ID:', req.id, '| Employee:', req.employee_name, '| Item:', req.item_name, '| Quantity:', req.quantity, '| Status:', req.status);
        });

        // Check approved requests specifically
        const [approved] = await db.execute('SELECT * FROM requests WHERE status = "Approved"');
        console.log('\nApproved requests:');
        approved.forEach(req => {
            console.log('- ID:', req.id, '| Employee:', req.employee_name, '| Item:', req.item_name, '| Quantity:', req.quantity);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkData();
