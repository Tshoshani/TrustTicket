/**
 * routes/settingsRoutes.js - Per-user settings endpoints.
 *
 * Base path: /settings (mounted in server.js)
 *
 * GET /settings - Return the logged-in user's settings (or defaults).
 * PUT /settings - Validate and save the logged-in user's settings.
 */
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

module.exports = router;
