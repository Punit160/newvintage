// const mongoose = require('mongoose');

// const symptomSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   },
//   symptoms: [{
//     name: {
//       type: String,
//       required: true
//     },
//     severity: {
//       type: Number,
//       min: 1,
//       max: 10,
//       required: true
//     },
//     notes: String
//   }],
//   mood: {
//     type: Number,
//     min: 1,
//     max: 10
//   },
//   energyLevel: {
//     type: Number,
//     min: 1,
//     max: 10
//   },
//   sleepQuality: {
//     type: Number,
//     min: 1,
//     max: 10
//   }
// }, {
//   timestamps: true
// });

// // Ensure one entry per user per day
// symptomSchema.index({ user: 1, date: 1 }, { unique: true });

// module.exports = mongoose.model('Symptom', symptomSchema);
const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Optional: ensure no duplicate date per user
journalSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Journal', journalSchema);
