const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const userModel = require("../models/user.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ------------------ REGISTER ------------------
router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/register",
  body("email").trim().isEmail().withMessage("Invalid email"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("username").trim().notEmpty().withMessage("Username is required"),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "invalid data",
      });
    }

    try {
      const { email, username, password } = req.body;

      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = await userModel.create({
        email,
        username,
        password: hashPassword,
      });

      const token = jwt.sign(
        {
          userId: newUser._id,
          email: newUser.email,
          username: newUser.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ COOKIE SET HERE (REGISTER) - FIXED FOR DEPLOY
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd, // ✅ Render HTTPS => true
        sameSite: isProd ? "none" : "lax", // ✅ cross-site cookie allow in prod
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: "registered successfully",
        token,
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Username or Email already exists",
        });
      }

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// ------------------ LOGIN ------------------
router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "invalid data",
      });
    }

    try {
      const { username, password } = req.body;

      const user = await userModel.findOne({ username });

      if (!user) {
        return res.status(400).json({
          message: "username or password is incorrect",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "username or password is incorrect",
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ COOKIE SET HERE (LOGIN) - FIXED FOR DEPLOY
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect("/");
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// ------------------ LOGOUT ------------------
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "logout done" });
});

module.exports = router;
