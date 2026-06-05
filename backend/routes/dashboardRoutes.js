/**
 * routes/dashboardRoutes.js - Defines dashboard endpoints.
 *
 * Base path: /dashboard (mounted in server.js)
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authorize = require('../middleware/auth');

// GET /dashboard/:userId - Return a personal dashboard summary (admin and user roles)
router.get('/:userId', authorize(['admin', 'user']), dashboardController.getDashboardByUserId);

module.exports = router;
