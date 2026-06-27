/**
 * routes/aiRoutes.js - REST endpoints for the AI Ticket Advisor feature.
 * The frontend reaches the AI feature exclusively through these backend routes.
 *
 * Base path: /api/ai (mounted in server.js)
 */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authorize = require('../middleware/auth'); // Role-check middleware

// POST /api/ai/ticket-advice - Get an AI pricing & trust recommendation for a ticket.
// Available to any authenticated role (sellers, buyers, staff).
router.post(
    '/ticket-advice',
    authorize(['user', 'admin', 'manager']),
    aiController.getTicketAdvice
);

module.exports = router;
