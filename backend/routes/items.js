const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/db');
const ExcelJS = require('exceljs');

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

// @route   GET /api/items/export
// @desc    Export items to Excel file
// @access  Public
router.get('/export', async (req, res) => {
  try {
    // Get all items (no pagination for export)
    const [rows] = await db.execute(
      'SELECT * FROM items ORDER BY date_added DESC'
    );

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Items');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Model', key: 'model', width: 20 },
      { header: 'Brand', key: 'brand', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Photo', key: 'photo', width: 25 },
      { header: 'Date Added', key: 'date_added', width: 20 },
      { header: 'Updated At', key: 'updated_at', width: 20 }
    ];

    // Add data rows
    rows.forEach(row => {
      worksheet.addRow({
        id: row.id,
        model: row.model,
        brand: row.brand,
        category: row.category,
        quantity: row.quantity,
        photo: row.photo || '',
        date_added: row.date_added ? new Date(row.date_added).toLocaleString() : '',
        updated_at: row.updated_at ? new Date(row.updated_at).toLocaleString() : ''
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF4E6' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Set content type and headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="items_export_${new Date().toISOString().split('T')[0]}.xlsx"`
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export items error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export items',
        code: 'EXPORT_ITEMS_ERROR',
        statusCode: 500
      }
    });
  }
});

// @route   GET /api/items
// @desc    Get all items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT *, DATE_FORMAT(date_added, "%Y-%m-%d %H:%i:%s") as date_added_formatted FROM items ORDER BY date_added DESC'
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
    const [rows] = await db.execute(
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

    const [result] = await db.execute(
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
    const [existingRows] = await db.execute(
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

    const [result] = await db.execute(
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
    const [existingRows] = await db.execute(
      'SELECT * FROM items WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await db.execute(
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