const express = require("express");
const router = express.Router();

const cloudinary = require("../config/cloudinary");
const upload = require("../middlewares/multer");
const File = require("../models/file.model");
const isLoggedIn = require("../middlewares/auth");

function bufferToBase64(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

router.post("/upload-file", isLoggedIn, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect("/?error=no_file");
    }

    // ✅ file size limit (example: 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.redirect("/?error=file_too_large");
    }

    
    const result = await cloudinary.uploader.upload(bufferToBase64(req.file), {
      folder: `men-drive/${req.user.username}`, // user folder
      resource_type: "auto",
    });

    
    await File.create({
      userId: req.user.userId,
      originalName: req.file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    return res.redirect(`/?success=1&url=${encodeURIComponent(result.secure_url)}`);
  } catch (error) {
    console.log("UPLOAD ERROR:", error.message);
    return res.redirect("/?error=upload_failed");
  }
});

module.exports = router;
