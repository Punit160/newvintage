// // models/BlockedDate.js
// const mongoose = require("mongoose");

// const blockedDateSchema = new mongoose.Schema(
//   {
//     fromDate: { type: Date, required: true },
//     toDate: { type: Date, required: true },
//     reason: { type: String }, // optional
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("BlockedDate", blockedDateSchema);


const mongoose = require("mongoose");

const blockedSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["single", "range", "weekday"],
      required: true,
    },

    // 📅 date types
    date: Date,
    fromDate: Date,
    toDate: Date,
    daysOfWeek: [Number], // 0-6

    // ⏰ time block (optional)
    startTime: String, // "HH:mm"
    endTime: String,   // "HH:mm"

    reason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockedDate", blockedSchema);