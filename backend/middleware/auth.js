// ============================================
// AUTH MIDDLEWARE — verifies JWT tokens
// ============================================
// This file exports a function that runs BEFORE any protected route.
// It checks if the request has a valid JWT. If yes, it attaches the
// user's info to req.user so the route can use it. If no, it responds 401.

// Load .env so we can read JWT_SECRET
require('dotenv').config();

// jsonwebtoken lets us verify the token the client sends
const jwt = require('jsonwebtoken');

// Our middleware function
// "next" is a function we call to pass control to the actual route
const authMiddleware = (req, res, next) => {
  // ============================================
  // 1. Read the Authorization header
  // ============================================
  // Frontend sends it like:  Authorization: Bearer eyJhbGci...
  const authHeader = req.headers.authorization;

  // If there's no header, the user isn't logged in
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // The header looks like "Bearer <token>" — split by space and take part [1]
  const token = authHeader.split(' ')[1];

  // If format was wrong, reject
  if (!token) {
    return res.status(401).json({ message: 'Token format invalid' });
  }

  // ============================================
  // 2. Verify the token
  // ============================================
  try {
    // jwt.verify throws an error if the token is fake, expired, or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // "decoded" looks like: { id: 5, role: 'user', iat: ..., exp: ... }
    // Attach it to req so the route handler can read it
    req.user = decoded;

    // Call next() to continue to the actual route
    next();
  } catch (err) {
    // Invalid / expired token
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Export so routes can import this middleware
module.exports = authMiddleware;