const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

// In-memory store for notifications (in production, this should be a database table)
let notifications = [];

// @route   POST /api/notifications
// @desc    Send notification to store manager when HR approves a request
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { message, type, itemId, itemName, employeeName } = req.body;

        // Validate required fields
        if (!message || !type) {
            return res.status(400).json({
                success: false,
                message: 'Please provide message and type'
            });
        }

        // Create notification object
        const notification = {
            id: Date.now().toString(),
            message,
            type,
            itemId,
            itemName,
            employeeName,
            timestamp: new Date().toISOString(),
            read: false
        };

        // Add to in-memory store
        notifications.push(notification);

        // Also store in database for persistence (optional, but recommended)
        try {
            await db.execute(
                'INSERT INTO notifications (message, type, item_id, item_name, employee_name, timestamp, read_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [message, type, itemId, itemName, employeeName, new Date(), false]
            );
        } catch (dbError) {
            console.warn('Failed to save notification to database:', dbError.message);
        }

        res.json({
            success: true,
            message: 'Notification sent successfully',
            data: notification
        });

    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/notifications
// @desc    Get all notifications for store manager
// @access  Private
router.get('/', async (req, res) => {
    try {
        // Get notifications from database if available, otherwise use in-memory store
        let dbNotifications = [];
        try {
            const [rows] = await db.execute(
                'SELECT * FROM notifications ORDER BY timestamp DESC'
            );
            dbNotifications = rows;
        } catch (dbError) {
            console.warn('Failed to fetch notifications from database:', dbError.message);
        }

        // Merge with in-memory notifications (for real-time updates)
        const allNotifications = [...notifications, ...dbNotifications];

        // Remove duplicates and sort by timestamp
        const uniqueNotifications = allNotifications
            .filter((notification, index, self) =>
                index === self.findIndex(n => n.id === notification.id)
            )
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            count: uniqueNotifications.length,
            data: uniqueNotifications
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', async (req, res) => {
    try {
        const notificationId = req.params.id;

        // Update in-memory store
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }

        // Update in database
        try {
            await db.execute(
                'UPDATE notifications SET read_status = ? WHERE id = ?',
                [true, notificationId]
            );
        } catch (dbError) {
            console.warn('Failed to update notification read status in database:', dbError.message);
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const notificationId = req.params.id;

        // Remove from in-memory store
        notifications = notifications.filter(n => n.id !== notificationId);

        // Remove from database
        try {
            await db.execute(
                'DELETE FROM notifications WHERE id = ?',
                [notificationId]
            );
        } catch (dbError) {
            console.warn('Failed to delete notification from database:', dbError.message);
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/notifications/clear
// @desc    Clear all notifications
// @access  Private
router.delete('/clear', async (req, res) => {
    try {
        // Clear in-memory store
        notifications = [];

        // Clear database
        try {
            await db.execute('DELETE FROM notifications');
        } catch (dbError) {
            console.warn('Failed to clear notifications from database:', dbError.message);
        }

        res.json({
            success: true,
            message: 'All notifications cleared successfully'
        });

    } catch (error) {
        console.error('Clear notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Initialize notifications table if it doesn't exist
async function initNotificationsTable() {
    try {
        await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        item_id INT,
        item_name VARCHAR(255),
        employee_name VARCHAR(255),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_status BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Notifications table initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing notifications table:', error.message);
    }
}

// Initialize the table when module loads
initNotificationsTable();

module.exports = router;