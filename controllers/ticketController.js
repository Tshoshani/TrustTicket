/**
 * controllers/ticketController.js — Business logic for Ticket endpoints.
 * Handles CRUD operations for event tickets in the TrustTicket marketplace.
 * All responses follow the standard format: { success, data, error }.
 */

// Import the in-memory tickets array (mock database)
let tickets = require('../models/tickets');

const ticketController = {

    /**
     * GET /tickets
     * Returns all tickets, with optional filtering via query parameters.
     * Supported filters:
     *   ?eventType=Concert  — filter by event category (case-insensitive)
     *   ?status=available    — filter by ticket status (case-insensitive)
     * Filters can be combined: ?eventType=Concert&status=available
     */
    getAllTickets: (req, res) => {
        let result = tickets; // Start with the full list

        // Apply eventType filter if provided in the query string
        if (req.query.eventType) {
            result = result.filter(t => t.eventType.toLowerCase() === req.query.eventType.toLowerCase());
        }
        // Apply status filter if provided in the query string
        if (req.query.status) {
            result = result.filter(t => t.status.toLowerCase() === req.query.status.toLowerCase());
        }

        res.status(200).json({ success: true, data: result, error: null });
    },

    /**
     * GET /tickets/:id
     * Returns a single ticket by its numeric ID.
     * Validates that :id is a valid number before searching.
     */
    getTicketById: (req, res) => {
        const id = parseInt(req.params.id); // Convert URL param to integer

        // Validate the ID parameter
        if (isNaN(id)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID. Must be a number.", details: { field: "id" } }
            });
        }

        const ticket = tickets.find(t => t.ticketId === id);
        if (!ticket) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `Ticket with ID ${id} not found`, details: {} }
            });
        }

        res.status(200).json({ success: true, data: ticket, error: null });
    },

    /**
     * POST /tickets
     * Creates a new ticket listing in the marketplace.
     * Required fields: eventName, eventType, eventDate, barcode, salePrice, sellerId.
     * Optional fields: venue, originalPrice.
     * Auto-generates ticketId (starting from 101), status ("available"), and timestamps.
     */
    createTicket: (req, res) => {
        // Destructure all possible fields from the request body
        const { eventName, eventType, eventDate, venue, barcode, originalPrice, salePrice, sellerId } = req.body;

        // Validate that all required fields are present
        if (!eventName || !eventType || !eventDate || !barcode || !salePrice || !sellerId) {
            // Collect which specific fields are missing for a helpful error response
            const missing = [];
            if (!eventName) missing.push("eventName");
            if (!eventType) missing.push("eventType");
            if (!eventDate) missing.push("eventDate");
            if (!barcode) missing.push("barcode");
            if (!salePrice) missing.push("salePrice");
            if (!sellerId) missing.push("sellerId");
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: `Missing required field(s): ${missing.join(", ")}`, details: { missing } }
            });
        }

        // Build the new ticket object with auto-generated fields
        const newTicket = {
            // Generate a unique ID: find the highest existing ID and add 1, or start at 101 if empty
            ticketId: tickets.length > 0 ? Math.max(...tickets.map(t => t.ticketId)) + 1 : 101,
            eventName,
            eventType,
            eventDate,
            venue: venue || null,             // Optional — defaults to null if not provided
            barcode,
            originalPrice: originalPrice || null, // Optional — the original purchase price
            salePrice,                         // The resale price set by the seller
            sellerId,                          // ID of the user listing the ticket
            status: "available",               // New listings always start as "available"
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };

        tickets.push(newTicket); // Add to in-memory array
        res.status(201).json({ success: true, data: { ticketId: newTicket.ticketId }, error: null });
    },

    /**
     * PUT /tickets/:id
     * Updates an existing ticket's fields with values from the request body.
     * Uses spread operator to merge: existing fields are kept, provided fields are overwritten.
     * The updateDate is automatically refreshed.
     */
    updateTicket: (req, res) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID. Must be a number.", details: { field: "id" } }
            });
        }

        const index = tickets.findIndex(t => t.ticketId === id);
        if (index === -1) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `Ticket with ID ${id} not found`, details: {} }
            });
        }

        // Spread the old ticket, then override with any new fields from req.body,
        // and always update the timestamp
        tickets[index] = { ...tickets[index], ...req.body, updateDate: new Date().toISOString() };
        res.status(200).json({ success: true, data: { ticketId: id }, error: null });
    },

    /**
     * DELETE /tickets/:id
     * Removes a ticket listing from the marketplace by its ID.
     */
    deleteTicket: (req, res) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID. Must be a number.", details: { field: "id" } }
            });
        }

        const index = tickets.findIndex(t => t.ticketId === id);
        if (index === -1) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `Ticket with ID ${id} not found`, details: {} }
            });
        }

        tickets.splice(index, 1); // Remove 1 element at the found index
        res.status(200).json({ success: true, data: { ticketId: id }, error: null });
    }
};

module.exports = ticketController;
