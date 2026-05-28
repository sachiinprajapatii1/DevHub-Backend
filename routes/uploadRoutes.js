// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../middlewares/authmiddleware");

const router = express.Router();

// ── uploads/ folder auto-create ──────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Multer config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique naam: timestamp + random + original extension
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});

// File size limit: 10MB per file
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Sirf executable/script files block karo — baaki sab allow
    const blocked = [
      "application/x-msdownload",   // .exe
      "application/x-sh",           // .sh
      "application/x-bat",          // .bat
      "application/x-php",          // .php
      "application/javascript",     // .js (server-side)
    ];
    // Extension se bhi check karo
    const blockedExt = [".exe", ".sh", ".bat", ".php", ".cmd", ".vbs", ".ps1"];
    const ext = require("path").extname(file.originalname).toLowerCase();

    if (blocked.includes(file.mimetype) || blockedExt.includes(ext)) {
      cb(new Error(`File type not allowed: ${ext || file.mimetype}`));
    } else {
      cb(null, true);
    }
  }
});

// ── POST /api/upload ──────────────────────────────────────────────────────────
// Frontend se: FormData mein field name "files" hona chahiye
// Returns: { success: true, files: [{ name, url, size, type }] }
router.post("/", protect, upload.array("files", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const files = req.files.map((file) => ({
      name: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
      size: file.size,
      type: file.mimetype,
    }));

    res.status(200).json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Error handler (multer errors) ────────────────────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File too large. Max 10MB allowed." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;