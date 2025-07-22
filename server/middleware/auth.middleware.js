const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (don't include the password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({
            message: "[System] Error: User not found. Authorization denied.",
          });
      }

      next();
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ message: "[System] Error: Not authorized, token failed." });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ message: "[System] Error: Not authorized, no token." });
  }
};

module.exports = { protect };
