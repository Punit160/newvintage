const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const Wellness = require("../models/Wellness");
const { adminAuth } = require("../middleware/auth");

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (_req, file, cb) => {
      cb(null, `thought-${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Image must be a JPEG, PNG, WebP, or GIF"));
  },
});

const acceptImage = (req, res, next) => {
  imageUpload.single("image")(req, res, (err) => {
    if (!err) return next();
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "Image must be under 5 MB"
      : err.message || "Could not upload the image";
    res.status(400).json({ success: false, message });
  });
};

const readWellness = (req, res, next) => {
  const contentType = String(req.headers["content-type"] || "");
  if (contentType.includes("multipart/form-data")) return acceptImage(req, res, next);
  next();
};

// ✅ Create a new wellness item
router.post("/", adminAuth, readWellness, async (req, res) => {
  try {
    const wellness = new Wellness({
      title: req.body.title,
      subtitle: req.body.subtitle,
      detail: req.body.detail,
      color: req.body.color,
      icon: req.body.icon || "",
      ...(req.file ? { image: `/uploads/${req.file.filename}` } : req.body.image ? { image: req.body.image } : {}),
    });
    await wellness.save();
    res.status(201).json({ success: true, data: wellness });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ Get all wellness items
router.get("/", async (req, res) => {
  try {
    const wellnessList = await Wellness.find().sort({ createdAt: -1 });
    res.json({ success: true, data: wellnessList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get single wellness item
router.get("/:id", async (req, res) => {
  try {
    const wellness = await Wellness.findById(req.params.id);
    if (!wellness) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: wellness });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Update a wellness item
router.put("/:id", adminAuth, readWellness, async (req, res) => {
  try {
    const update = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      detail: req.body.detail,
      color: req.body.color,
      icon: req.body.icon || "",
    };
    if (req.file) update.image = `/uploads/${req.file.filename}`;
    else if (req.body.image) update.image = req.body.image;
    const updated = await Wellness.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ Delete a wellness item
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await Wellness.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
