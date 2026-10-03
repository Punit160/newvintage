const mongoose = require("mongoose");

const extraFeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin user
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date }
});

// Add performance indexes
extraFeeSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("ExtraFeeRequest", extraFeeSchema);
