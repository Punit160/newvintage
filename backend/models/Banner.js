// const mongoose = require('mongoose');

// const bannerSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   videoPath: { type: String, required: true },
//   fileHash: { type: String, required: true, unique: true }, // prevents duplicates
// }, { timestamps: true });

// module.exports = mongoose.model('Banner', bannerSchema);



// models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoPath: {
    type: String,
    required: true
  },
  fileHash: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure _id is included
bannerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Banner', bannerSchema);