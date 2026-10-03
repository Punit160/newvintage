// const mongoose = require('mongoose');

// const chatSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   messages: [{
//     sender: {
//       type: String,
//       enum: ['user', 'admin'],
//       required: true
//     },
//     message: {
//       type: String,
//       required: true
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   status: {
//     type: String,
//     enum: ['active', 'closed'],
//     default: 'active'
//   },
//   weekNumber: Number,
//   month: Number,
//   year: Number
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Chat', chatSchema);
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
      },
      message: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },

      // ✅ ADD THESE TWO FIELDS
      edited: {
        type: Boolean,
        default: false
      },
      editedAt: {
        type: Date
      },
        isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
    }
  ],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  weekNumber: Number,
  month: Number,
  year: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
