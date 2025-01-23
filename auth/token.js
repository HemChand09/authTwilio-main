const jwt = require("jsonwebtoken");
const generateToken = (user) => {
  return jwt.sign({ phoneNumber: user.phoneNumber }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const athenticateHandler = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    req.user = decoded; // Attach decoded user data to request
    next(); // Proceed to next middleware
  });
};

module.exports = { generateToken, athenticateHandler };
