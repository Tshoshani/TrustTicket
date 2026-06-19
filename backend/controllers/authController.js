/**
 * controllers/authController.js - Business logic for authentication endpoints.
 *
 * Authentication is simulated (mock data, no real JWT/session store):
 *   - login validates an email + password against the in-memory users array.
 *   - On success it returns the user's public fields plus a mock token.
 *   - logout is a no-op on the server (the client just clears its stored token),
 *     but the endpoint exists so the frontend can call POST /auth/logout.
 *
 * All responses follow the standard format: { success, data, error }.
 */

const users = require('../models/users');

// Remove sensitive fields (password) before sending a user back to the client.
const toPublicUser = (user) => {
  const { password, ...publicUser } = user;
  return publicUser;
};

const authController = {

  /**
   * POST /auth/login
   * Body: { email, password }
   * Looks up the user by email and verifies the password.
   * Returns the public user object plus a mock token on success.
   */
  login: (req, res) => {
    const { email, password } = req.body;

    // Validate that both fields are present
    if (!email || !password) {
      const missing = [];
      if (!email) missing.push("email");
      if (!password) missing.push("password");
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: `Missing required field(s): ${missing.join(", ")}`, details: { missing } }
      });
    }

    // Find the user by email (case-insensitive) and check the password
    const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false, data: null,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password.", details: {} }
      });
    }

    // Mock token - not a real JWT, just enough for the frontend to store/identify the session
    const token = `mock-token-${user.userId}`;

    res.status(200).json({
      success: true,
      data: { user: toPublicUser(user), token },
      error: null
    });
  },

  /**
   * POST /auth/logout
   * Stateless on the server side - the client clears its stored token.
   * Returns a simple success acknowledgement.
   */
  logout: (req, res) => {
    res.status(200).json({ success: true, data: { message: "Logged out successfully" }, error: null });
  }
};

module.exports = authController;
