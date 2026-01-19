const express = require("express");
const router = express.Router();
const File = require("../models/file.model");
const isLoggedIn = require("../middlewares/auth");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    // ✅ only user files
    const files = await File.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    const success = req.query.success || null;
    const fileUrl = req.query.url || null;
    const error = req.query.error || null;

    res.render("home", {
      success,
      fileUrl,
      error,
      files,
      user: req.user,
    });
  } catch (err) {
    return res.render("home", {
      success: null,
      fileUrl: null,
      error: "home_load_failed",
      files: [],
      user: req.user,
    });
  }
});

module.exports = router;
