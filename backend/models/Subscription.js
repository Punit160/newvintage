const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, enum: ["Basic", "Premium", "Pro", "Elite"], required: true },
  price: { type: Number, required: true },
  yearlyPrice: Number,
  duration: { type: Number, default: 12 }, // months
  description: String,
  features: { type: [String], required: true },
    extraAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  extraAmountT: { type: String },
  extraBenefits: [String],
  color: { type: String, default: "#6B7280" },
  icon: { type: String, default: "star" },
  popular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);


//above code razorpay

// const mongoose = require('mongoose');

// const subscriptionSchema = new mongoose.Schema({
//   id: { type: String, required: true, unique: true }, // e.g., "basic"
//   name: { 
//     type: String, 
//     required: true, 
//     enum: ['Basic', 'Premium', 'Pro', 'Elite'] 
//   },
//   price: { type: Number, required: true },
//   yearlyPrice: { type: Number },
//   description: { type: String },
//   period: { type: String, default: '/month' },
//   savings: { type: String },
//   popular: { type: Boolean, default: false },
//   features: [{ type: String }], // array of strings
//   color: { type: String, default: '#6B7280' },
//   icon: { type: String, default: 'shield' },
//   paymentUrl: { type: String },
//   extraBenefits: [{ type: String }],
//   duration: { type: Number, default: 1 }, // ✅ Added duration (in months)
//   isActive: { type: Boolean, default: true },
//   extraAmount:{type:Number},
//   totalAmount:{type:Number},
//   extraAmountT:{type:String},
// }, { timestamps: true });

// module.exports = mongoose.model('Subscription', subscriptionSchema);
