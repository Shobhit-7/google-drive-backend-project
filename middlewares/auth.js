const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect("/user/login?error=login_required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.redirect("/user/login?error=invalid_token");
  }
}

module.exports = isLoggedIn;
