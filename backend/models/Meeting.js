// const mongoose = require('mongoose');

// const meetingSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   scheduledDate: {
//     type: Date,
//     required: true
//   },
//   duration: {
//     type: Number,
//     default: 30 // minutes
//   },
//   status: {
//     type: String,
//     enum: ['scheduled', 'completed', 'cancelled'],
//     default: 'scheduled'
//   },
//   notes: String,
//   meetingLink: String,
//   month: Number,
//   year: Number
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Meeting', meetingSchema);
// const mongoose = require("mongoose");

// const meetingSchema = new mongoose.Schema({
//   topic: String,
//   userId: String,
//   status: { type: String, default: "pending" },
//   channelName: String,
//   token: String,
//   meetingUrl: String,
// }, { timestamps: true });

// module.exports = mongoose.model("Meeting", meetingSchema);

//  const mongoose = require("mongoose");

// const meetingSchema = new mongoose.Schema(
//   {
//     topic: { type: String, required: true },
//     userId: { 
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",   // tells MongoDB where to populate from
//       required: true 
//     },
//     status: { type: String, default: "pending" }, 
//     channelName: { type: String },
//     token: { type: String },
//     appId: { type: String },
//     meetingUrl: { type: String },
//     startTime: { type: Date },
//     declinedAt: { type: Date },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Meeting", meetingSchema);

const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled", "ended", "expired"],
      default: "pending",
    },

    channelName: String,
    token: String,
    appId: String,
    meetingUrl: String,

    startTime: { type: Date, required: true },

    // 🔥 EXPIRATION FIELD (NO INDEX HERE)
    expireAt: {
      type: Date,
    }
    ,reminderSent: {
  type: Boolean,
  default: false
},

    // Tracking timestamps
    acceptedAt: Date,
    declinedAt: Date,
    cancelledAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

// 🧨 TTL Index - auto delete when date passes
meetingSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Meeting", meetingSchema);
