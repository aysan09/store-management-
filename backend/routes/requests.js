const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

// @route   GET /api/requests
// @desc    Get all requests (from unified table)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, employee_name AS employeeName, item_name AS itemName, quantity, purpose, date_added AS dateAdded, date_approved AS dateApproved, date_finished AS dateFinished, status FROM requests ORDER BY date_added DESC'
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/requests/status/:status
// @desc    Get requests by status (from unified table)
// @access  Private
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Finished'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Approved, or Finished'
      });
    }

    const [rows] = await db.execute(
      'SELECT id, employee_name AS employeeName, item_name AS itemName, quantity, purpose, date_added AS dateAdded, date_approved AS dateApproved, date_finished AS dateFinished, status FROM requests WHERE status = ? ORDER BY date_added DESC',
      [status]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Get requests by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/requests
// @desc    Add new request (defaults to Pending status)
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { employeeName, itemName, quantity, purpose } = req.body;

    // Validate required fields
    if (!employeeName || !itemName || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee name, item name, and quantity'
      });
    }

    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    const [result] = await db.execute(
      'INSERT INTO requests (employee_name, item_name, quantity, purpose, status) VALUES (?, ?, ?, ?, ?)',
      [employeeName, itemName, parseInt(quantity), purpose || null, 'Pending']
    );

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: {
        id: result.insertId,
        employeeName,
        itemName,
        quantity: parseInt(quantity),
        purpose: purpose || null,
        status: 'Pending',
        date_added: new Date()
      }
    });

  } catch (error) {
    console.error('Add request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/requests/:id/approve
// @desc    Approve request (change status to Approved)
// @access  Private
router.put('/:id/approve', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Get the request
    const [rows] = await db.execute(
      'SELECT * FROM requests WHERE id = ?',
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = rows[0];

    // Check if already approved or finished
    if (request.status === 'Approved' || request.status === 'Finished') {
      return res.status(400).json({
        success: false,
        message: 'Request is already approved or finished'
      });
    }

    // Update status to Approved and set date_approved
    await db.execute(
      'UPDATE requests SET status = ?, date_approved = NOW() WHERE id = ?',
      ['Approved', requestId]
    );

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: {
        id: requestId,
        employeeName: request.employee_name,
        itemName: request.item_name,
        quantity: request.quantity,
        purpose: request.purpose,
        status: 'Approved',
        date_added: request.date_added,
        date_approved: new Date()
      }
    });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/requests/:id/finish
// @desc    Finish request (change status to Finished and decrease item quantity)
// @access  Private
router.put('/:id/finish', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Get the request
    const [rows] = await db.execute(
      'SELECT * FROM requests WHERE id = ?',
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = rows[0];

    // Check if already finished
    if (request.status === 'Finished') {
      return res.status(400).json({
        success: false,
        message: 'Request is already finished'
      });
    }

    // Check if request is approved (only approved requests can be finished)
    if (request.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved requests can be marked as finished'
      });
    }

    // Get the item to check quantity
    const [itemRows] = await db.execute(
      'SELECT * FROM items WHERE model = ?',
      [request.item_name]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in inventory'
      });
    }

    const item = itemRows[0];

    // Check if there's enough quantity
    if (item.quantity < request.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity. Available: ${item.quantity}, Requested: ${request.quantity}`
      });
    }

    // Update item quantity (decrease by request quantity)
    await db.execute(
      'UPDATE items SET quantity = quantity - ? WHERE model = ?',
      [request.quantity, request.item_name]
    );

    // Update request status to Finished and set date_finished
    await db.execute(
      'UPDATE requests SET status = ?, date_finished = NOW() WHERE id = ?',
      ['Finished', requestId]
    );

    res.json({
      success: true,
      message: 'Request finished successfully and item quantity updated',
      data: {
        id: requestId,
        employeeName: request.employee_name,
        itemName: request.item_name,
        quantity: request.quantity,
        purpose: request.purpose,
        status: 'Finished',
        date_added: request.date_added,
        date_approved: request.date_approved,
        date_finished: new Date()
      }
    });

  } catch (error) {
    console.error('Finish request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete request
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if request exists
    const [rows] = await db.execute(
      'SELECT * FROM requests WHERE id = ?',
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    await db.execute(
      'DELETE FROM requests WHERE id = ?',
      [requestId]
    );

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/requests/:id/reject
// @desc    Reject request (delete it)
// @access  Private
router.delete('/:id/reject', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if request exists
    const [rows] = await db.execute(
      'SELECT * FROM requests WHERE id = ?',
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    await db.execute(
      'DELETE FROM requests WHERE id = ?',
      [requestId]
    );

    res.json({
      success: true,
      message: 'Request rejected successfully'
    });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


module.exports = router;