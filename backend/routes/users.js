const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const upload = require("../middleware/upload");

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('subscription');
    
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profileMain', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('profile.age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1-120'),
  body('profile.gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('profile.weight').optional().isFloat({ min: 1 }).withMessage('Weight must be a positive number'),
  body('profile.height').optional().isFloat({ min: 1 }).withMessage('Height must be a positive number'),
  body('profile.activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']).withMessage('Invalid activity level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('subscription');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});
router.put(
  "/profile",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const updateData = req.body;

      if (req.file) {
        const cleanPath = req.file.path.replace(/\\/g, "/"); // fix for Windows
        updateData.avatar = `/${cleanPath}`; // store only relative path
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
      );

      res.json({
        success: true,
        message: "Profile updated",
        data: updatedUser,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error updating profile" });
    }
  }
);

// router.put(
//   "/profile",
//   auth,
//   upload.single("avatar"), 
//   async (req, res) => {
//     try {
//       const updateData = req.body;

   
//       if (req.file) {
//   const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  
//   // Always ensure correct clean path format
//   const cleanPath = req.file.path.replace(/\\/g, "/"); // Windows fix

//   // If path already contains uploads/, avoid duplicating
//   updateData.avatar = cleanPath.startsWith("/")
//     ? `${base}${cleanPath}`
//     : `${base}/${cleanPath}`;
// }

//       const updatedUser = await User.findByIdAndUpdate(
//         req.user._id,
//         { $set: updateData },
//         { new: true }
//       );

//       res.json({
//         success: true,
//         message: "Profile updated",
//         data: updatedUser,
//       });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Error updating profile" });
//     }
//   }
// );

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deactivating account'
    });
  }
});

module.exports = router;