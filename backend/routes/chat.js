// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const Chat = require('../models/Chat');
// const UserSubscription = require('../models/UserSubscription');
// const { auth, adminAuth } = require('../middleware/auth');
// const moment = require('moment');

// const router = express.Router();

// // Helper function to check chat eligibility
// const checkChatEligibilityMain = async (userId) => {
//   const subscription = await UserSubscription.findOne({
//     user: userId,
//     isActive: true,
//     endDate: { $gt: new Date() }
//   }).populate('subscription');

//   if (!subscription) {
//     return { eligible: false, message: 'No active subscription found' };
//   }

//   const currentDate = new Date();
//   const currentWeek = moment(currentDate).week();
//   const currentMonth = currentDate.getMonth() + 1;
//   const currentYear = currentDate.getFullYear();

//   let query = { user: userId };
  
//   if (subscription.subscription.features.chatFrequency === 'weekly') {
//     query.weekNumber = currentWeek;
//     query.year = currentYear;
//   } else {
//     query.month = currentMonth;
//     query.year = currentYear;
//   }

//   const existingChat = await Chat.findOne(query);
  
//   if (existingChat) {
//     return { eligible: false, message: `You have already used your ${subscription.subscription.features.chatFrequency} chat session` };
//   }

//   return { eligible: true, subscription };
// };
// const checkChatEligibility = async (userId) => {
//   const subscription = await UserSubscription.findOne({
//     user: userId,
//     isActive: true,
//     endDate: { $gt: new Date() }
//   }).populate('subscription');

//   const currentDate = new Date();
//   const currentWeek = moment(currentDate).week();
//   const currentMonth = currentDate.getMonth() + 1;
//   const currentYear = currentDate.getFullYear();

//   let query = { user: userId, status: 'active' };

//   // Check if user already has any chat
//   const totalChats = await Chat.countDocuments({ user: userId });
//   if (totalChats === 0) {
//     // First-time user => allow free chat
//     return { eligible: true, subscription: null, free: true };
//   }

//   // If user has subscription, check usage based on chat frequency
//   if (!subscription) {
//     return { eligible: false, message: 'No active subscription found' };
//   }

//   if (subscription.subscription.features.chatFrequency === 'weekly') {
//     query.weekNumber = currentWeek;
//     query.year = currentYear;
//   } else {
//     query.month = currentMonth;
//     query.year = currentYear;
//   }

//   const existingChat = await Chat.findOne(query);
//   if (existingChat) {
//     return { eligible: false, message: `You have already used your ${subscription.subscription.features.chatFrequency} chat session` };
//   }

//   return { eligible: true, subscription };
// };


// // @route   POST /api/chat/start
// // @desc    Start a new chat session
// // @access  Private
// router.post('/startMain', auth, async (req, res) => {
//   try {
//     const eligibility = await checkChatEligibility(req.user._id);
    
//     if (!eligibility.eligible) {
//       return res.status(400).json({
//         success: false,
//         message: eligibility.message
//       });
//     }

//     const currentDate = new Date();
//     const chatData = {
//       user: req.user._id,
//       messages: [],
//       weekNumber: moment(currentDate).week(),
//       month: currentDate.getMonth() + 1,
//       year: currentDate.getFullYear()
//     };

//     const chat = await Chat.create(chatData);

//     res.status(201).json({
//       success: true,
//       message: 'Chat session started successfully',
//       data: chat
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error starting chat session'
//     });
//   }
// });
// router.post('/start', auth, async (req, res) => {
//   try {
//     const eligibility = await checkChatEligibility(req.user._id);

//     if (!eligibility.eligible) {
//       return res.status(400).json({
//         success: false,
//         message: eligibility.message
//       });
//     }

//     const currentDate = new Date();
//     const chatData = {
//       user: req.user._id,
//       messages: [],
//       weekNumber: moment(currentDate).week(),
//       month: currentDate.getMonth() + 1,
//       year: currentDate.getFullYear(),
//       freeAccess: eligibility.free || false, // mark free access if first chat
//     };

//     const chat = await Chat.create(chatData);

//     res.status(201).json({
//       success: true,
//       message: eligibility.free
//         ? 'First-time free chat started successfully'
//         : 'Chat session started successfully',
//       data: chat
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error starting chat session'
//     });
//   }
// });

// // @route   POST /api/chat/:chatId/message
// // @desc    Send a message in chat
// // @access  Private
// router.post('/:chatId/message', [
//   auth,
//   body('message').notEmpty().withMessage('Message is required')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     //Chat restriction 
//     //     const eligibility = await checkChatEligibility(req.user._id);

//     // if (!eligibility.eligible) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: eligibility.message
//     //   });
//     // }
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { message } = req.body;
//     const { chatId } = req.params;

//     const chat = await Chat.findOne({
//       _id: chatId,
//       user: req.user._id,
//       status: 'active'
//     });

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat session not found or inactive'
//       });
//     }

//     chat.messages.push({
//       sender: 'user',
//       message
//     });

//     await chat.save();

//     res.json({
//       success: true,
//       message: 'Message sent successfully',
//       data: chat
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error sending message'
//     });
//   }
// });

// // @route   GET /api/chat/my-chats
// // @desc    Get user's chat history
// // @access  Private
// router.get('/my-chats', auth, async (req, res) => {
//   try {
//     const chats = await Chat.find({ user: req.user._id })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     res.json({
//       success: true,
//       message: 'Chat history retrieved successfully',
//       data: chats
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving chat history'
//     });
//   }
// });

// // @route   GET /api/chat/:chatId
// // @desc    Get specific chat session
// // @access  Private
// router.get('/:chatId', auth, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({
//       _id: req.params.chatId,
//       user: req.user._id
//     });

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat session not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Chat session retrieved successfully',
//       data: chat
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving chat session'
//     });
//   }
// });

// // Admin routes
// // @route   GET /api/chat/admin/all
// // @desc    Get all chat sessions
// // @access  Admin
// router.get('/admin/all', adminAuth, async (req, res) => {
//   try {
//     const chats = await Chat.find()
//       .populate('user', 'name email')
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       message: 'All chats retrieved successfully',
//       data: chats
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving chats'
//     });
//   }
// });

// // @route   POST /api/chat/admin/:chatId/reply
// // @desc    Admin reply to chat
// // @access  Admin
// router.post('/admin/:chatId/reply', [
//   adminAuth,
//   body('message').notEmpty().withMessage('Message is required')
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

//     const { message } = req.body;
//     const { chatId } = req.params;

//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat session not found'
//       });
//     }

//     chat.messages.push({
//       sender: 'admin',
//       message
//     });

//     await chat.save();

//     res.json({
//       success: true,
//       message: 'Reply sent successfully',
//       data: chat
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error sending reply'
//     });
//   }
// });
// // @route   DELETE /api/chat/admin/:chatId
// // @desc    Delete a chat session (admin only)
// // @access  Admin
// router.delete('/admin/:chatId', adminAuth, async (req, res) => {
//   try {
//     const chat = await Chat.findByIdAndDelete(req.params.chatId);

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat session not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Chat session deleted successfully by admin'
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error deleting chat session'
//     });
//   }
// });

// // @route   PATCH /api/chat/admin/:chatId/message/:index
// // @desc    Edit admin message
// // @access  Admin
// // @route   PATCH /api/chat/admin/:chatId/message/:index
// // @desc    Edit admin message only
// // @access  Admin
// router.patch(
//   '/admin/:chatId/message/:index',
//   adminAuth,
//   body('message').notEmpty(),
//   async (req, res) => {
//     try {
//       const { chatId, index } = req.params;
//       const { message } = req.body;

//       const chat = await Chat.findById(chatId);
//       if (!chat) {
//         return res.status(404).json({
//           success: false,
//           message: 'Chat not found'
//         });
//       }

//       const msg = chat.messages[index];

//       if (!msg || msg.sender !== 'admin') {
//         return res.status(403).json({
//           success: false,
//           message: 'Only admin messages can be edited'
//         });
//       }

//       // ✅ EDIT MESSAGE
//       msg.message = message;
//       msg.edited = true;          // 🔥 REQUIRED
//       msg.editedAt = new Date();  // optional (future use)

//       await chat.save();

//       res.json({
//         success: true,
//         data: chat
//       });
//     } catch (err) {
//       res.status(500).json({
//         success: false,
//         message: 'Server error editing message'
//       });
//     }
//   }
// );

// // @route   DELETE /api/chat/admin/:chatId/message/:index
// // @desc    Delete single admin message
// // @access  Admin
// router.delete(
//   '/admin/:chatId/message/:index',
//   adminAuth,
//   async (req, res) => {
//     try {
//       const { chatId, index } = req.params;

//       const chat = await Chat.findById(chatId);
//       if (!chat) {
//         return res.status(404).json({
//           success: false,
//           message: 'Chat not found',
//         });
//       }

      
// //     const msg = chat.messages[index];

// // if (!msg || msg.sender !== 'admin') {
// //   return res.status(403).json({
// //     success: false,
// //     message: 'Only admin messages can be deleted',
// //   });
// // }

// // // ✅ SOFT DELETE INSTEAD OF REMOVE
// // msg.isDeleted = true;
// // msg.deletedAt = new Date();
// // msg.message = "This message was deleted";

// // await chat.save();
//       const msg = chat.messages[index];

//       if (!msg || msg.sender !== 'admin') {
//         return res.status(403).json({
//           success: false,
//           message: 'Only admin messages can be deleted',
//         });
//       }

//       // ✅ REMOVE MESSAGE
//       chat.messages.splice(index, 1);
//       await chat.save();

//       res.json({
//         success: true,
//         data: chat,
//       });
//     } catch (err) {
//       res.status(500).json({
//         success: false,
//         message: 'Server error deleting message',
//       });
//     }
//   }
// );


// module.exports = router;


const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const UserSubscription = require('../models/UserSubscription');
const { auth, adminAuth } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Helper function to check chat eligibility
const checkChatEligibilityMain = async (userId) => {
  const subscription = await UserSubscription.findOne({
    user: userId,
    isActive: true,
    endDate: { $gt: new Date() }
  }).populate('subscription');

  if (!subscription) {
    return { eligible: false, message: 'No active subscription found' };
  }

  const currentDate = new Date();
  const currentWeek = moment(currentDate).week();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  let query = { user: userId };
  
  if (subscription.subscription.features.chatFrequency === 'weekly') {
    query.weekNumber = currentWeek;
    query.year = currentYear;
  } else {
    query.month = currentMonth;
    query.year = currentYear;
  }

  const existingChat = await Chat.findOne(query);
  
  if (existingChat) {
    return { eligible: false, message: `You have already used your ${subscription.subscription.features.chatFrequency} chat session` };
  }

  return { eligible: true, subscription };
};
const checkChatEligibility = async (userId) => {
  const subscription = await UserSubscription.findOne({
    user: userId,
    isActive: true,
    endDate: { $gt: new Date() }
  }).populate('subscription');

  const currentDate = new Date();
  const currentWeek = moment(currentDate).week();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  let query = { user: userId, status: 'active' };

  // Check if user already has any chat
  const totalChats = await Chat.countDocuments({ user: userId });
  if (totalChats === 0) {
    // First-time user => allow free chat
    return { eligible: true, subscription: null, free: true };
  }

  // If user has subscription, check usage based on chat frequency
  if (!subscription) {
    return { eligible: false, message: 'No active subscription found' };
  }

  if (subscription.subscription.features.chatFrequency === 'weekly') {
    query.weekNumber = currentWeek;
    query.year = currentYear;
  } else {
    query.month = currentMonth;
    query.year = currentYear;
  }

  const existingChat = await Chat.findOne(query);
  if (existingChat) {
    return { eligible: false, message: `You have already used your ${subscription.subscription.features.chatFrequency} chat session` };
  }

  return { eligible: true, subscription };
};


// @route   POST /api/chat/start
// @desc    Start a new chat session
// @access  Private
router.post('/startMain', auth, async (req, res) => {
  try {
    const eligibility = await checkChatEligibility(req.user._id);
    
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.message
      });
    }

    const currentDate = new Date();
    const chatData = {
      user: req.user._id,
      messages: [],
      weekNumber: moment(currentDate).week(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear()
    };

    const chat = await Chat.create(chatData);

    res.status(201).json({
      success: true,
      message: 'Chat session started successfully',
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error starting chat session'
    });
  }
});
router.post('/start', auth, async (req, res) => {
  try {
    const eligibility = await checkChatEligibility(req.user._id);

    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.message
      });
    }

    const currentDate = new Date();
    const chatData = {
      user: req.user._id,
      messages: [],
      weekNumber: moment(currentDate).week(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      freeAccess: eligibility.free || false, // mark free access if first chat
    };

    const chat = await Chat.create(chatData);

    res.status(201).json({
      success: true,
      message: eligibility.free
        ? 'First-time free chat started successfully'
        : 'Chat session started successfully',
      data: chat
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error starting chat session'
    });
  }
});

// @route   POST /api/chat/:chatId/message
// @desc    Send a message in chat
// @access  Private
router.post('/:chatId/message', [
  auth,
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    //Chat restriction 
    //     const eligibility = await checkChatEligibility(req.user._id);

    // if (!eligibility.eligible) {
    //   return res.status(400).json({
    //     success: false,
    //     message: eligibility.message
    //   });
    // }


    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message } = req.body;
    const { chatId } = req.params;
    if (!chatId || chatId === "null") {
  return res.status(400).json({
    success: false,
    message: "Invalid chat session"
  });
}
    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user._id,
      status: 'active'
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found or inactive'
      });
    }

    chat.messages.push({
      sender: 'user',
      message
    });

    await chat.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
});

// @route   GET /api/chat/my-chats
// @desc    Get user's chat history
// @access  Private
router.get('/my-chats', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chat history'
    });
  }
});

// @route   GET /api/chat/:chatId
// @desc    Get specific chat session
// @access  Private
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session retrieved successfully',
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chat session'
    });
  }
});

// Admin routes
// @route   GET /api/chat/admin/all
// @desc    Get all chat sessions
// @access  Admin
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'All chats retrieved successfully',
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chats'
    });
  }
});

// @route   POST /api/chat/admin/:chatId/reply
// @desc    Admin reply to chat
// @access  Admin
router.post('/admin/:chatId/reply', [
  adminAuth,
  body('message').notEmpty().withMessage('Message is required')
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

    const { message } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    chat.messages.push({
      sender: 'admin',
      message
    });

    await chat.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error sending reply'
    });
  }
});
// @route   DELETE /api/chat/admin/:chatId
// @desc    Delete a chat session (admin only)
// @access  Admin
router.delete('/admin/:chatId', adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully by admin'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting chat session'
    });
  }
});

router.patch(
  '/admin/:chatId/message/:index',
  adminAuth,
  body('message').notEmpty(),
  async (req, res) => {
    try {
      const { chatId, index } = req.params;
      const { message } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      const msg = chat.messages[index];

      if (!msg || msg.sender !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin messages can be edited'
        });
      }

      // ✅ EDIT
      msg.message = message;
      msg.edited = true;
      msg.editedAt = new Date();

      await chat.save();

      // 🔥 SOCKET EMIT (MISSING PART)
      const io = req.app.get("io");
      const userSocketMap = req.app.get("userSocketMap");

      const userId = chat.user.toString();

      const userSocket = userSocketMap[userId];
      const adminSocket = userSocketMap["admin"];

      const payload = {
        chatId,
        index,
        message
      };

      if (userSocket) {
        io.to(userSocket).emit("messageEdited", payload);
      }

      if (adminSocket) {
        io.to(adminSocket).emit("messageEdited", payload);
      }

      res.json({
        success: true,
        data: chat
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error editing message'
      });
    }
  }
);




router.delete(
  '/admin/:chatId/message/:index',
  adminAuth,
  async (req, res) => {
    try {
      const { chatId, index } = req.params;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
      }

      const msg = chat.messages[index];

      if (!msg || msg.sender !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin messages can be deleted',
        });
      }

      // ✅ Soft delete
      msg.isDeleted = true;
      msg.deletedAt = new Date();
      msg.message = "This message was deleted";

      await chat.save();

      // 🔥 SOCKET EMIT
      const io = req.app.get("io");
      const userSocketMap = req.app.get("userSocketMap");

      const userId = chat.user.toString();

      const userSocket = userSocketMap[userId];
      const adminSocket = userSocketMap["admin"]; // using string for now

      const payload = {
        chatId,
        index
      };

      if (userSocket) {
        io.to(userSocket).emit("messageDeleted", payload);
      }

      if (adminSocket) {
        io.to(adminSocket).emit("messageDeleted", payload);
      }

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error deleting message',
      });
    }
  }
);

module.exports = router;