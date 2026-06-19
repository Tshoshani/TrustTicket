/**
 * routes/authRoutes.js - Authentication endpoints.
 *
 * Base path: /auth (mounted in server.js)
 *
 * POST /auth/login  - Validate credentials, return user + mock token.
 * POST /auth/logout - Acknowledge logout (stateless mock).
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
