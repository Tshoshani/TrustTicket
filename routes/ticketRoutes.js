/**
 * routes/ticketRoutes.js - Defines all REST endpoints for the Tickets resource.
 * Tickets represent event tickets listed for resale on the TrustTicket marketplace.
 * Protected routes require an appropriate role via the authorize() middleware.
 *
 * Base path: /tickets (mounted in server.js)
 */
const express = require('express');
const router = express.Router(); // Create a modular route handler
const ticketController = require('../controllers/ticketController'); // Handler logic for each endpoint
const authorize = require('../middleware/auth'); // Role-check middleware

// GET /tickets - List all tickets. Supports optional query filters: ?eventType=Concert&status=available
// No role restriction - anyone can browse the marketplace
router.get('/', ticketController.getAllTickets);

// GET /tickets/:id - Get a single ticket's full details by its numeric ID
router.get('/:id', ticketController.getTicketById);

// POST /tickets - Create a new ticket listing (sellers with role 'user' or 'admin')
router.post('/', authorize(['user', 'admin']), ticketController.createTicket);

// PUT /tickets/:id - Update an existing ticket's info (seller or admin)
router.put('/:id', authorize(['user', 'admin']), ticketController.updateTicket);

// DELETE /tickets/:id - Remove a ticket listing permanently (admin only)
router.delete('/:id', authorize(['admin']), ticketController.deleteTicket);

module.exports = router;
