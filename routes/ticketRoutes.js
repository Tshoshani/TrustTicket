// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authorize = require('../middleware/auth');

// GET /api/tickets - List all available tickets[cite: 15]
router.get('/', ticketController.getAllTickets);

// GET /api/tickets/:id - Get specific ticket details[cite: 15]
router.get('/:id', ticketController.getTicketById);

// POST /api/tickets - Create a new ticket listing (User/Seller role)[cite: 15]
router.post('/', authorize(['user', 'admin']), ticketController.createTicket);

// PUT /api/tickets/:id - Update ticket info (Seller or Admin)[cite: 15]
router.put('/:id', authorize(['user', 'admin']), ticketController.updateTicket);

// DELETE /api/tickets/:id - Remove a listing (Admin only as per requirement)[cite: 15]
router.delete('/:id', authorize(['admin']), ticketController.deleteTicket);

module.exports = router;