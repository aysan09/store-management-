const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   GET /api/items
// @desc    Get all items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM items ORDER BY date_added DESC'
    );
    
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM items WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/items
// @desc    Add new item
// @access  Private
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { model, brand, category, quantity } = req.body;

    // Validate required fields
    if (!model || !brand || !category || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide model, brand, category, and quantity'
      });
    }

    // Validate quantity
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number'
      });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.execute(
      'INSERT INTO items (model, brand, category, quantity, photo) VALUES (?, ?, ?, ?, ?)',
      [model, brand, category, parseInt(quantity), photo]
    );

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: {
        id: result.insertId,
        model,
        brand,
        category,
        quantity: parseInt(quantity),
        photo,
        date_added: new Date()
      }
    });

  } catch (error) {
    console.error('Add item error:', error);
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed!'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { model, brand, category, quantity } = req.body;

    // Check if item exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM items WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : existingRows[0].photo;

    const [result] = await pool.execute(
      'UPDATE items SET model = ?, brand = ?, category = ?, quantity = ?, photo = ?, updated_at = NOW() WHERE id = ?',
      [model, brand, category, parseInt(quantity), photo, req.params.id]
    );

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: {
        id: req.params.id,
        model,
        brand,
        category,
        quantity: parseInt(quantity),
        photo
      }
    });

  } catch (error) {
    console.error('Update item error:', error);
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed!'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Check if item exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM items WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await pool.execute(
      'DELETE FROM items WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;