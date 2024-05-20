const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "your_secret_key";

// Generate a token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, secret, {
    expiresIn: "1h",
  });
};

// Middleware to authenticate token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, secret);
    req.auth = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { generateToken, authenticate };
