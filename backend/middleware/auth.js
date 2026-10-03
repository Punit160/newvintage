const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('subscription');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

const portalAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
  });
};

const adminAuth = portalAuth;

const ownerAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Only the account owner can manage settings'
      });
    }
  });
};

module.exports = { auth, adminAuth, ownerAuth };