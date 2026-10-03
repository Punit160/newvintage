const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Category = require('../models/Category');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category retrieved successfully', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/categories
// @desc    Add new category
// @access  Private
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title } = req.body;

    // Check for duplicate
    const existing = await Category.findOne({ title });
    if (existing) return res.status(400).json({ success: false, message: 'Category already exists' });

    const category = new Category(req.body);
    await category.save();

    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title } = req.body;

    // Optional: check for duplicate title on update
    if (title) {
      const existing = await Category.findOne({ title, _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ success: false, message: 'Another category with this title already exists' });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    res.json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    res.json({ success: true, message: 'Category deleted successfully', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;
