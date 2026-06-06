/**
 * controllers/ticketController.js - Business logic for Ticket endpoints.
 * Handles CRUD operations for event tickets in the TrustTicket marketplace.
 * All responses follow the standard format: { success, data, error }.
 */

// Import the in-memory tickets array (mock database)
let tickets = require('../models/tickets');
// Users (for seller trust ratings) and transactions (for the mock escrow records)
let users = require('../models/users');
let transactions = require('../models/transactions');

// Platform fee taken from BOTH sides of a sale (2.5% buyer + 2.5% seller = 5% total).
const FEE_RATE = 0.025;

function getMissingFields(body, requiredFields) {
    return requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === "");
}

// Round a money amount to 2 decimal places.
function money(amount) {
    const n = Number(amount);
    return Number.isNaN(n) ? 0 : Number(n.toFixed(2));
}

// Build the buyer/seller fee breakdown for a given sale price (MVP - no real money).
function buildFeeBreakdown(salePrice) {
    const base = money(salePrice);
    const buyerFee = money(base * FEE_RATE);
    const sellerFee = money(base * FEE_RATE);
    return {
        salePrice: base,
        buyerFee,
        sellerFee,
        buyerPays: money(base + buyerFee),   // buyer is charged price + their 2.5%
        sellerReceives: money(base - sellerFee), // seller gets price minus their 2.5%
        platformRevenue: money(buyerFee + sellerFee)
    };
}

const ticketController = {

    /**
     * GET /tickets
     * Returns all tickets, with optional filtering via query parameters.
     * Supported filters:
     *   ?eventType=Concert    - filter by event category (case-insensitive)
     *   ?status=available      - filter by ticket status (case-insensitive)
     *   ?search=omer           - text search across eventName and venue
     *   ?date=2026-07-20       - exact event date (YYYY-MM-DD)
     *   ?minPrice=100          - sale price greater than or equal to this
     *   ?maxPrice=300          - sale price less than or equal to this
     * Filters can be combined: ?eventType=Concert&minPrice=100&maxPrice=300
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
        // Free-text search across event name and venue
        if (req.query.search) {
            const q = req.query.search.toLowerCase();
            result = result.filter(t =>
                (t.eventName && t.eventName.toLowerCase().includes(q)) ||
                (t.venue && t.venue.toLowerCase().includes(q))
            );
        }
        // Exact event date filter
        if (req.query.date) {
            result = result.filter(t => t.eventDate === req.query.date);
        }
        // Minimum sale price
        if (req.query.minPrice !== undefined && req.query.minPrice !== "") {
            const min = Number(req.query.minPrice);
            if (!Number.isNaN(min)) result = result.filter(t => Number(t.salePrice) >= min);
        }
        // Maximum sale price
        if (req.query.maxPrice !== undefined && req.query.maxPrice !== "") {
            const max = Number(req.query.maxPrice);
            if (!Number.isNaN(max)) result = result.filter(t => Number(t.salePrice) <= max);
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
            venue: venue || null,             // Optional - defaults to null if not provided
            barcode,
            originalPrice: originalPrice || null, // Optional - the original purchase price
            salePrice,                         // The resale price set by the seller
            sellerId,                          // ID of the user listing the ticket
            status: "pending",                 // New listings await mock AI verification
            verified: false,                   // Becomes true after the AI check passes
            buyerId: null,                     // No buyer yet
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };

        tickets.push(newTicket); // Add to in-memory array
        res.status(201).json({ success: true, data: { ticketId: newTicket.ticketId }, error: null });
    },

    /**
     * PUT /tickets/:id
     * Updates an existing ticket's core fields with values from the request body.
     * Required fields: eventName, eventType, eventDate, barcode, salePrice, sellerId.
     *