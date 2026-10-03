const mongoose = require('mongoose');

// Subcategory schema
const SubCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  shortDescription: { type: String },
  detailedContent: [{ type: String }]
}, { _id: false });

// Category schema
const CategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String },
  color: { type: String, default: '#000000' },
  description: { type: String },
  detailedContent: { type: String },
  subcategories: [SubCategorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
