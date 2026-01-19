const express = require("express");
const router = express.Router();

const cloudinary = require("../config/cloudinary");
const File = require("../models/file.model");
const isLoggedIn = require("../middlewares/auth");

router.post("/delete-file/:id", isLoggedIn, async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await File.findOne({ _id: fileId, userId: req.user.userId });
    if (!file) {
      return res.redirect("/?error=file_not_found");
    }

    // ✅ delete from cloudinary
    await cloudinary.uploader.destroy(file.public_id, {
      resource_type: "auto",
    });

    // ✅ delete from db
    await File.deleteOne({ _id: fileId });

    return res.redirect("/?success=deleted");
  } catch (error) {
    console.log("DELETE ERROR:", error.message);
    return res.redirect("/?error=delete_failed");
  }
});

module.exports = router;
