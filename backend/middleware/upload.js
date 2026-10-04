const multer = require("multer");
const path = require("path");

// Storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const type = String(file.mimetype || "").toLowerCase();
    const name = String(file.originalname || "").toLowerCase();
    const allowed = /^image\/(jpeg|jpg|pjpeg|png|webp|gif)$/.test(type) || /\.(jpe?g|png|webp|gif)$/.test(name);
    if (allowed) return cb(null, true);
    if (type.includes("heic") || type.includes("heif") || /\.hei[cf]$/.test(name)) {
      return cb(new Error("iPhone HEIC photos cannot be uploaded. Save the photo as a JPEG and try again."));
    }
    cb(new Error("Profile photo must be a JPEG, PNG, WebP, or GIF under 5 MB"));
  },
});

module.exports = upload;
