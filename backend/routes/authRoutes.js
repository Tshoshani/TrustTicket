/**
 * routes/authRoutes.js - Authentication endpoints.
 *
 * Base path: /auth (mounted in server.js)
 *
 * POST /auth/register - Public self-registration, returns user + mock token.
 * POST /auth/login    - Validate credentials, return user + mock token.
 * POST /auth/logout   - Acknowledge logout (stateless mock).
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
