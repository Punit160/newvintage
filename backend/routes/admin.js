// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const User = require('../models/User');
// const Subscription = require('../models/Subscription');
// const UserSubscription = require('../models/UserSubscription');
// const Chat = require('../models/Chat');
// const Meeting = require('../models/Meeting');
// const Symptom = require('../models/Symptom');
// const { adminAuth } = require('../middleware/auth');

// const router = express.Router();

// // @route   GET /api/admin/dashboard
// // @desc    Get admin dashboard statistics
// // @access  Admin
// // router.get('/dashboard', adminAuth, async (req, res) => {
// //   try {
// //     const [
// //       totalUsers,
// //       activeUsers,
// //       totalSubscriptions,
// //       activeChats,
// //       scheduledMeetings,
// //       totalSymptomEntries
// //     ] = await Promise.all([
// //       User.countDocuments({ role: 'user' }),
// //       User.countDocuments({ role: 'user', isActive: true }),
// //       UserSubscription.countDocuments({ isActive: true }),
// //       Chat.countDocuments({ status: 'active' }),
// //       Meeting.countDocuments({ status: 'scheduled' }),
// //       Symptom.countDocuments()
// //     ]);

// //     const stats = {
// //       users: {
// //         total: totalUsers,
// //         active: activeUsers,
// //         inactive: totalUsers - activeUsers
// //       },
// //       subscriptions: {
// //         active: totalSubscriptions
// //       },
// //       chats: {
// //         active: activeChats
// //       },
// //       meetings: {
// //         scheduled: scheduledMeetings
// //       },
// //       symptoms: {
// //         totalEntries: totalSymptomEntries
// //       }
// //     };

// //     res.json({
// //       success: true,
// //       message: 'Dashboard statistics retrieved successfully',
// //       data: stats
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Server error retrieving dashboard statistics'
// //     });
// //   }
// // });
// router.get('/dashboard', adminAuth, async (req, res) => {
//   try {
//     const [
//       totalUsers,
//       activeUsers,
//       activeSubscriptions,
//       activeChats,
//       scheduledMeetings,
//       totalSymptomEntries,
//       recentUsers,
//       recentChats
//     ] = await Promise.all([
//       User.countDocuments({ role: 'user' }),
//       User.countDocuments({ role: 'user', isActive: true }),

//       // Fetch full subscription documents (not just count)
//       UserSubscription.find({ isActive: true })
//         .populate('subscription', 'name price')
//         .lean(),

//       Chat.countDocuments({ status: 'active' }),
//       Meeting.countDocuments({ status: 'scheduled' }),
//       Symptom.countDocuments(),

//       User.find({ role: 'user' })
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select('name email createdAt')
//         .lean(),

//       Chat.find()
//         .sort({ updatedAt: -1 })
//         .limit(5)
//         .populate('user', 'name email')
//         .lean()
//     ]);

//     // 🧮 Calculate total revenue dynamically
//     const totalRevenue = activeSubscriptions.reduce(
//       (sum, sub) => sum + (sub.subscription?.price || 0),
//       0
//     );

//     // Attach subscription info to recent users
//     for (let user of recentUsers) {
//       const sub = await UserSubscription.findOne({ user: user._id, isActive: true })
//         .populate('subscription', 'name')
//         .lean();
//       user.subscription = sub ? sub.subscription.name : 'No Active Plan';
//     }

//     // Chat formatting remains same
//     const formattedChats = recentChats.map(chat => {
//       const lastMsg = chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1] : null;
//       return {
//         userName: chat.user?.name || 'Unknown',
//         userEmail: chat.user?.email || 'unknown',
//         lastMessage: lastMsg ? lastMsg.message : 'No messages yet',
//         status: lastMsg && lastMsg.sender === 'user' ? 'unread' : 'read',
//         updatedAt: chat.updatedAt
//       };
//     });

//     const stats = {
//       users: {
//         total: totalUsers,
//         active: activeUsers,
//         inactive: totalUsers - activeUsers
//       },
//       subscriptions: {
//         active: activeSubscriptions.length
//       },
//       revenue: {
//         total: totalRevenue
//       },
//       chats: {
//         active: activeChats
//       },
//       meetings: {
//         scheduled: scheduledMeetings
//       },
//       symptoms: {
//         totalEntries: totalSymptomEntries
//       },
//       recentUsers,
//       recentChats: formattedChats
//     };

//     res.json({
//       success: true,
//       message: 'Dashboard statistics retrieved successfully',
//       data: stats
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving dashboard statistics'
//     });
//   }
// });


// // @route   GET /api/admin/users
// // @desc    Get all users
// // @access  Admin
// router.get('/users', adminAuth, async (req, res) => {
//   try {
//     const { page = 1, limit = 20, search } = req.query;
    
//     let query = { role: 'user' };
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const users = await User.find(query)
//       .populate('subscription')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await User.countDocuments(query);

//     res.json({
//       success: true,
//       message: 'Users retrieved successfully',
//       data: {
//         users,
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         totalUsers: total
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving users'
//     });
//   }
// });

// // @route   GET /api/admin/users/:userId
// // @desc    Get specific user details
// // @access  Admin
// router.get('/users/:userId', adminAuth, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId).populate('subscription');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Get user's recent activity
//     const [recentChats, recentMeetings, recentSymptoms] = await Promise.all([
//       Chat.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
//       Meeting.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
//       Symptom.find({ user: user._id }).sort({ date: -1 }).limit(5)
//     ]);

//     const userDetails = {
//       user,
//       activity: {
//         recentChats,
//         recentMeetings,
//         recentSymptoms
//       }
//     };

//     res.json({
//       success: true,
//       message: 'User details retrieved successfully',
//       data: userDetails
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving user details'
//     });
//   }
// });

// // @route   PUT /api/admin/users/:userId/status
// // @desc    Update user status
// // @access  Admin
// router.put('/users/:userId/status', [
//   adminAuth,
//   body('isActive').isBoolean().withMessage('Status must be boolean')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { isActive } = req.body;
    
//     const user = await User.findByIdAndUpdate(
//       req.params.userId,
//       { isActive },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
//       data: user
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error updating user status'
//     });
//   }
// });

// // @route   GET /api/admin/subscriptions
// // @desc    Get all subscription plans
// // @access  Admin
// router.get('/subscriptions', adminAuth, async (req, res) => {
//   try {
//     const subscriptions = await Subscription.find().sort({ price: 1 });

//     res.json({
//       success: true,
//       message: 'Subscription plans retrieved successfully',
//       data: subscriptions
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving subscription plans'
//     });
//   }
// });

// // @route   POST /api/admin/subscriptions
// // @desc    Create new subscription plan
// // @access  Admin
// router.post('/subscriptions', [
//   adminAuth,
//   body('name').isIn(['Basic', 'Premium', 'Pro', 'Elite']).withMessage('Invalid subscription name'),
//   body('price').isNumeric().withMessage('Price must be a number'),
//   body('features.chatFrequency').isIn(['weekly', 'monthly']).withMessage('Chat frequency must be weekly or monthly'),
//   body('features.videoMeetings').isNumeric().withMessage('Video meetings must be a number')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const subscription = await Subscription.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: 'Subscription plan created successfully',
//       data: subscription
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error creating subscription plan'
//     });
//   }
// });

// router.put('/subscriptions/:id', [
//   adminAuth,
//   body('name').optional().isIn(['Basic', 'Premium', 'Pro', 'Elite']).withMessage('Invalid subscription name'),
//   body('price').optional().isNumeric().withMessage('Price must be a number'),
//   body('features.chatFrequency').optional().isIn(['weekly', 'monthly']).withMessage('Chat frequency must be weekly or monthly'),
//   body('features.videoMeetings').optional().isNumeric().withMessage('Video meetings must be a number')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     if (!subscription) {
//       return res.status(404).json({ success: false, message: 'Subscription not found' });
//     }

//     res.json({
//       success: true,
//       message: 'Subscription plan updated successfully',
//       data: subscription
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error updating subscription plan'
//     });
//   }
// });

// // DELETE a subscription (DELETE)
// router.delete('/subscriptions/:id', adminAuth, async (req, res) => {
//   try {
//     const subscription = await Subscription.findByIdAndDelete(req.params.id);

//     if (!subscription) {
//       return res.status(404).json({ success: false, message: 'Subscription not found' });
//     }

//     res.json({
//       success: true,
//       message: 'Subscription plan deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error deleting subscription plan'
//     });
//   }
// });

// module.exports = router;

const express = require('express');
const path = require('path');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const UserSubscription = require('../models/UserSubscription');
const Chat = require('../models/Chat');
const Meeting = require('../models/Meeting');
const Symptom = require('../models/Symptom');
const ExtraFeeRequest = require('../models/extraFeeSchema');
const { adminAuth, auth, ownerAuth } = require('../middleware/auth');

const router = express.Router();

const photoUpload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (_req, file, cb) => {
      cb(null, `avatar-${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Profile photo must be a JPEG, PNG, WebP, or GIF'));
  },
});

const acceptPhoto = (req, res, next) => {
  photoUpload.single('avatar')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Profile photo must be under 5 MB'
      : err.message || 'Could not upload the photo';
    res.status(400).json({ success: false, message });
  });
};

/* --------------------------------------------
   DASHBOARD
-------------------------------------------- */
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      activeSubscriptions,
      activeChats,
      scheduledMeetings,
      totalSymptomEntries,
      recentUsers,
      recentChats
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      UserSubscription.find({ isActive: true })
        .populate('subscription', 'name price')
        .lean(),
      Chat.countDocuments({ status: 'active' }),
      Meeting.countDocuments({ status: 'scheduled' }),
      Symptom.countDocuments(),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt').lean(),
      Chat.find().sort({ updatedAt: -1 }).limit(5).populate('user', 'name email').lean()
    ]);

    const totalRevenue = activeSubscriptions.reduce(
      (sum, sub) => sum + (sub.subscription?.price || 0),
      0
    );

    for (let user of recentUsers) {
      const sub = await UserSubscription.findOne({ user: user._id, isActive: true })
        .populate('subscription', 'name')
        .lean();
      user.subscription = sub ? sub.subscription.name : 'No Active Plan';
    }

    const formattedChats = recentChats.map(chat => {
      const lastMsg = chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1] : null;
      return {
        userName: chat.user?.name || 'Unknown',
        userEmail: chat.user?.email || 'unknown',
        lastMessage: lastMsg ? lastMsg.message : 'No messages yet',
        status: lastMsg && lastMsg.sender === 'user' ? 'unread' : 'read',
        updatedAt: chat.updatedAt
      };
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      subscriptions: {
        active: activeSubscriptions.length
      },
      revenue: {
        total: totalRevenue
      },
      chats: {
        active: activeChats
      },
      meetings: {
        scheduled: scheduledMeetings
      },
      symptoms: {
        totalEntries: totalSymptomEntries
      },
      recentUsers,
      recentChats: formattedChats
    };

    res.json({ success: true, message: 'Dashboard statistics retrieved successfully', data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard statistics' });
  }
});


/* --------------------------------------------
   USERS
-------------------------------------------- */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('subscription')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
});

router.post('/users/photo', adminAuth, acceptPhoto, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Choose a profile photo' });
  }
  res.json({
    success: true,
    message: 'Photo uploaded',
    data: { avatar: `/uploads/${req.file.filename}` },
  });
});

router.put('/users/:userId', [
  adminAuth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  body('avatar').optional({ checkFalsy: true }).isString().withMessage('Photo link must be text'),
  body('isActive').optional().custom((value) => typeof value === 'boolean').withMessage('Status must be active or inactive'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const { name, email, password, phone, avatar, isActive } = req.body;

    if (email && email !== user.email) {
      const taken = await User.findOne({ email, _id: { $ne: user._id } });
      if (taken) {
        return res.status(400).json({ success: false, message: 'Another account already uses this email' });
      }
      user.email = email;
    }
    if (name) user.name = name;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (password) user.password = password;

    await user.save();

    if (phone === '') {
      await User.updateOne({ _id: user._id }, { $unset: { phone: 1 } });
    }

    const saved = await User.findById(user._id).populate('subscription');
    res.json({ success: true, message: 'Patient updated', data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating patient' });
  }
});

router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await User.deleteOne({ _id: user._id });
    res.json({ success: true, message: 'Patient removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error removing patient' });
  }
});

const teamValidators = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  body('avatar').optional({ checkFalsy: true }).isString().withMessage('Photo must be text'),
  body('isActive').optional().custom((value) => typeof value === 'boolean').withMessage('Status must be active or inactive'),
];

router.get('/settings', ownerAuth, async (req, res) => {
  try {
    const members = await User.find({ role: 'staff' }).sort({ createdAt: -1 });
    res.json({ success: true, data: { profile: req.user, members } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error loading settings' });
  }
});

router.put('/settings', ownerAuth, teamValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const { name, email, password, phone, avatar } = req.body;
    if (email && email !== user.email) {
      const taken = await User.findOne({ email, _id: { $ne: user._id } });
      if (taken) return res.status(400).json({ success: false, message: 'Another account already uses this email' });
      user.email = email;
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (password) user.password = password;
    await user.save();
    if (phone === '') await User.updateOne({ _id: user._id }, { $unset: { phone: 1 } });

    const saved = await User.findById(user._id);
    res.json({ success: true, message: 'Account updated', data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating account' });
  }
});

router.post('/team', ownerAuth, [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ...teamValidators.slice(3),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, phone, avatar, isActive } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Another account already uses this email' });
    }

    const member = await User.create({
      name,
      email,
      password,
      role: 'staff',
      ...(phone ? { phone } : {}),
      ...(avatar ? { avatar } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
    });
    res.status(201).json({ success: true, message: 'Team member added', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding team member' });
  }
});

router.put('/team/:memberId', ownerAuth, teamValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const member = await User.findById(req.params.memberId);
    if (!member || member.role !== 'staff') {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    const { name, email, password, phone, avatar, isActive } = req.body;
    if (email && email !== member.email) {
      const taken = await User.findOne({ email, _id: { $ne: member._id } });
      if (taken) return res.status(400).json({ success: false, message: 'Another account already uses this email' });
      member.email = email;
    }
    if (name) member.name = name;
    if (typeof isActive === 'boolean') member.isActive = isActive;
    if (phone) member.phone = phone;
    if (avatar) member.avatar = avatar;
    if (password) member.password = password;
    await member.save();
    if (phone === '') await User.updateOne({ _id: member._id }, { $unset: { phone: 1 } });

    const saved = await User.findById(member._id);
    res.json({ success: true, message: 'Team member updated', data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating team member' });
  }
});

router.delete('/team/:memberId', ownerAuth, async (req, res) => {
  try {
    const member = await User.findById(req.params.memberId);
    if (!member || member.role !== 'staff') {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    await User.deleteOne({ _id: member._id });
    res.json({ success: true, message: 'Team member removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error removing team member' });
  }
});


/* --------------------------------------------
   EXTRA FEE SYSTEM
-------------------------------------------- */

// CREATE FEE REQUEST
router.post('/extra-fee/:userId', adminAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    const { userId } = req.params;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be > 0" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) return res.status(404).json({ success: false, message: "User not found" });

    const existing = await ExtraFeeRequest.findOne({ userId, status: "pending" });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already has pending fee", request: existing });
    }

    const newRequest = await ExtraFeeRequest.create({
      userId,
      amount,
      createdBy: req.adminId
    });

    res.json({ success: true, message: "Extra fee created", data: newRequest });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error creating extra fee" });
  }
});

// GET ALL EXTRA FEE RECORDS (ADMIN)
router.get('/extra-fee', adminAuth, async (req, res) => {
  try {
    const fees = await ExtraFeeRequest.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: fees });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching fees" });
  }
});

// MARK FEE AS PAID
router.patch('/extra-fee/:feeId/pay', adminAuth, async (req, res) => {
  try {
    const updated = await ExtraFeeRequest.findByIdAndUpdate(
      req.params.feeId,
      { status: "paid", paidAt: new Date() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Fee record not found" });

    res.json({ success: true, message: "Payment confirmed", data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating fee status" });
  }
});
router.patch('/extrafee/:feeId/pay', auth, async (req, res) => {
  try {
    const updated = await ExtraFeeRequest.findByIdAndUpdate(
      req.params.feeId,
      { status: "paid", paidAt: new Date() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Fee record not found" });

    res.json({ success: true, message: "Payment confirmed", data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating fee status" });
  }
});

// CANCEL FEE
router.patch('/extra-fee/:feeId/cancel', adminAuth, async (req, res) => {
  try {
    const updated = await ExtraFeeRequest.findByIdAndUpdate(
      req.params.feeId,
      { status: "cancelled" },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Fee record not found" });

    res.json({ success: true, message: "Fee cancelled", data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error canceling fee" });
  }
});


/* --------------------------------------------
   MOBILE CHECK FEE STATUS
-------------------------------------------- */
router.get('/user/extra-fee/latest', auth, async (req, res) => {
  try {
    const pendingFee = await ExtraFeeRequest.findOne({
      userId: req.user.id,
      status: "pending"
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: pendingFee });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking fee" });
  }
});
// @route   GET /api/admin/subscriptions
// @desc    Get all subscription plans
// @access  Admin
router.get('/subscriptions', adminAuth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ price: 1 });

    res.json({
      success: true,
      message: 'Subscription plans retrieved successfully',
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving subscription plans'
    });
  }
});

// @route   POST /api/admin/subscriptions
// @desc    Create new subscription plan
// @access  Admin
router.post('/subscriptions', [
  adminAuth,
  body('name').isIn(['Basic', 'Premium', 'Pro', 'Elite']).withMessage('Invalid subscription name'),
  body('price').isNumeric().withMessage('Price must be a number'),
    body('extraAmount').optional().isNumeric().withMessage('Extra amount must be a number'),
  body('features.chatFrequency').isIn(['weekly', 'monthly']).withMessage('Chat frequency must be weekly or monthly'),
  body('features.videoMeetings').isNumeric().withMessage('Video meetings must be a number')
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

    const subscription = await Subscription.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating subscription plan'
    });
  }
});

router.put('/subscriptions/:id', [
  adminAuth,
  body('name').optional().isIn(['Basic', 'Premium', 'Pro', 'Elite']).withMessage('Invalid subscription name'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('extraAmount').optional().isNumeric().withMessage('Extra amount must be a number'),
  body('extraAmountT').optional().isString().withMessage('Extra amount text must be a string'),
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

    // 🛠 Fetch existing subscription
    const existing = await Subscription.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // 🧠 Use old values if not updated
    const price = req.body.price !== undefined
      ? Number(req.body.price)
      : existing.price;

    const extraAmount = req.body.extraAmount !== undefined
      ? Number(req.body.extraAmount)
      : existing.extraAmount || 0;

    const totalAmount = price + extraAmount;

    // 🔥 Update payload with recalculated values
    req.body.price = price;
    req.body.extraAmount = extraAmount;
    req.body.totalAmount = totalAmount;

    // 📌 Store updated data
    const updated = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error updating subscription plan'
    });
  }
});


// DELETE a subscription (DELETE)
router.delete('/subscriptions/:id', adminAuth, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting subscription plan'
    });
  }
});


module.exports = router;
