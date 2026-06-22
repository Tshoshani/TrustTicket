/**
 * routes/favoriteRoutes.js
 * REST endpoints for the favorites junction table.
 *
 * Base path: /api/favorites
 */

const express = require('express');
const router = express.Router();

const favoriteController = require('../controllers/favoriteController');
const authorize = require('../middleware/auth');

// POST /api/favorites - Add a ticket to user's favorites
router.post(
    '/',
    authorize(['user', 'admin', 'manager']),
    favoriteController.addFavorite
);

// GET /api/favorites/user/:userId - Get all favorite tickets for a user
router.get(
    '/user/:userId',
    authorize(['user', 'admin', 'manager']),
    favoriteController.getFavoritesByUserId
);

// GET /api/favorites/ticket/:ticketId - Get all users who favorited a ticket
router.get(
    '/ticket/:ticketId',
    authorize(['admin', 'manager']),
    favoriteController.getUsersByFavoriteTicketId
);

// DELETE /api/favorites/:userId/:ticketId - Remove favorite
router.delete(
    '/:userId/:ticketId',
    authorize(['user', 'admin', 'manager']),
    favoriteController.removeFavorite
);

module.exports = router;