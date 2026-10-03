const mongoose = require("mongoose");

const WellnessSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "" },
    image: { type: String, default: "" },
    color: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    detail: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wellness", WellnessSchema);
