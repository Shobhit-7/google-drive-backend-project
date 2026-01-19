const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies?.token;

    // ✅ No token => go to register first
    if (!token) {
      return res.redirect("/user/register?error=register_first");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // ✅ Invalid token => go to login
    return res.redirect("/user/login?error=invalid_token");
  }
}

module.exports = isLoggedIn;
