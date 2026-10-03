const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  body('avatar').optional({ checkFalsy: true }).isString().withMessage('Photo link must be text')
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

    const { name, email, password, phone, avatar, isActive } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      ...(phone ? { phone } : {}),
      ...(avatar ? { avatar } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
    });
    
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email }).populate('subscription');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This account is disabled'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});


router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    });

    return res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});




router.post('/reset-password', async (req, res) => {
  try {
    let { email, otp, password } = req.body;

    email = email?.trim().toLowerCase();
    otp = otp?.toString().trim();

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: 'Please fill in all required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.',
      });
    }

    const user = await User.findOne({ email });

    // User or OTP not available
    if (!user || !user.resetOtp || !user.resetOtpExpire) {
      return res.status(400).json({
        message: 'The OTP you entered is invalid or has expired.',
      });
    }

    // OTP mismatch
    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: 'The OTP you entered is incorrect.',
      });
    }

    // OTP expired
    if (user.resetOtpExpire < Date.now()) {
      return res.status(400).json({
        message: 'The OTP has expired. Please request a new one.',
      });
    }

    // Update password
    user.password = password;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    return res.json({
      message: 'Your password has been changed successfully.',
    });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again later.',
    });
  }
});

module.exports = router;