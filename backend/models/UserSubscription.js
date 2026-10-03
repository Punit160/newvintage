

const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  chatUsed: {
    type: Number,
    default: 0
  },
  meetingsUsed: {
    type: Number,
    default: 0
  },

  // ✅ STRIPE FIELDS
  stripe_payment_intent: { type: String, unique: true },
  stripe_session_id: String,

  // (optional – only if you still use Razorpay)
  razorpay_order_id: String,
  razorpay_payment_id: String

}, { timestamps: true });

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);

// // above code razor pay
// const mongoose = require('mongoose');

// const userSubscriptionSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   subscription: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Subscription',
//     required: true
//   },
//   startDate: {
//     type: Date,
//     default: Date.now
//   },
//   endDate: {
//     type: Date,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   chatUsed: {
//     type: Number,
//     default: 0
//   },
//   meetingsUsed: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);