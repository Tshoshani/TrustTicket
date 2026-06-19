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
     * The updateDate is automatically refreshed.
     */
    updateTicket: (req, res) => {
        const id = parseInt(req.params.id);
        const body = req.body || {};

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

        const requiredFields = ["eventName", "eventType", "eventDate", "barcode", "salePrice", "sellerId"];
        const missing = getMissingFields(body, requiredFields);
        if (missing.length > 0) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: `Missing required field(s): ${missing.join(", ")}`, details: { missing } }
            });
        }

        // Spread the old ticket, then override with fields from req.body,
        // and always update the timestamp
        tickets[index] = { ...tickets[index], ...body, updateDate: new Date().toISOString() };
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
    },

    /**
     * POST /tickets/:id/verify
     * Simulates the "AI verification" step. In a real system an AI service would
     * inspect the ticket/barcode for authenticity. Here we just approve any
     * "pending" ticket and move it to "available" so it appears in the marketplace.
     */
    verifyTicket: (req, res) => {
        const id = parseInt(req.params.id);
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

        if (ticket.status !== "pending") {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: `Only tickets that are pending verification can be verified (current status: ${ticket.status}).`, details: { status: ticket.status } }
            });
        }

        // Mock AI approval - mark verified and list it for sale.
        ticket.verified = true;
        ticket.status = "available";
        ticket.updateDate = new Date().toISOString();

        res.status(200).json({ success: true, data: ticket, error: null });
    },

    /**
     * POST /tickets/:id/purchase
     * A buyer purchases a verified ticket. Money is "held in escrow" and the
     * ticket is released to the buyer (status -> "reserved"). A mock escrow
     * transaction is created with the 2.5% buyer / 2.5% seller fee breakdown.
     * The buyer is identified by the x-user-id header.
     */
    purchaseTicket: (req, res) => {
        const id = parseInt(req.params.id);
        const buyerId = parseInt(req.headers['x-user-id']);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID. Must be a number.", details: { field: "id" } }
            });
        }
        if (isNaN(buyerId)) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "Missing or invalid x-user-id header (buyer not identified).", details: {} }
            });
        }

        const ticket = tickets.find(t => t.ticketId === id);
        if (!ticket) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `Ticket with ID ${id} not found`, details: {} }
            });
        }

        if (!ticket.verified || ticket.status !== "available") {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: `This ticket is not available for purchase (status: ${ticket.status}, verified: ${ticket.verified}).`, details: { status: ticket.status, verified: ticket.verified } }
            });
        }
        if (ticket.sellerId === buyerId) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "You cannot buy your own ticket.", details: {} }
            });
        }

        // Release the verified/trusted ticket to the buyer; hold money in escrow.
        ticket.buyerId = buyerId;
        ticket.status = "reserved";
        ticket.updateDate = new Date().toISOString();

        const fees = buildFeeBreakdown(ticket.salePrice);

        // Record the mock escrow transaction.
        const now = new Date().toISOString();
        const newTransaction = {
            transactionId: transactions.length > 0 ? Math.max(...transactions.map(t => t.transactionId)) + 1 : 1001,
            ticketId: ticket.ticketId,
            buyerId,
            sellerId: ticket.sellerId,
            status: "escrow_pending",   // money held until the barcode is used
            ticketReleased: true,        // verified ticket released to the buyer
            buyerFee: fees.buyerFee,
            sellerFee: fees.sellerFee,
            totalPrice: fees.salePrice,
            createDate: now,
            updateDate: now
        };
        transactions.push(newTransaction);

        res.status(201).json({
            success: true,
            data: { ticketId: ticket.ticketId, transactionId: newTransaction.transactionId, status: ticket.status, fees },
            error: null
        });
    },

    /**
     * POST /tickets/:id/redeem
     * Simulates the buyer "using" the barcode at the event. This finalizes the
     * escrow: status -> "completed", the matching transaction is marked completed,
     * the money is released to the seller (minus fees), and the seller's
     * successful-deal count / trust rating are bumped.
     */
    redeemTicket: (req, res) => {
        const id = parseInt(req.params.id);
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

        if (ticket.status !== "reserved") {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: `Only reserved (in-escrow) tickets can be redeemed (current status: ${ticket.status}).`, details: { status: ticket.status } }
            });
        }

        // Barcode used -> complete the sale.
        ticket.status = "completed";
        ticket.updateDate = new Date().toISOString();

        const fees = buildFeeBreakdown(ticket.salePrice);

        // Finalize the most recent escrow transaction for this ticket.
        const txn = [...transactions].reverse().find(t => t.ticketId === ticket.ticketId && t.status === "escrow_pending");
        if (txn) {
            txn.status = "completed";
            txn.ticketReleased = true;
            txn.updateDate = new Date().toISOString();
        }

        // Reward the seller: one more successful deal (and a tiny trust bump, capped at 5.0).
        const seller = users.find(u => u.userId === ticket.sellerId);
        if (seller) {
            seller.successfulDeals = (seller.successfulDeals || 0) + 1;
            seller.ratingCount = (seller.ratingCount || 0) + 1; // buyer leaves a star rating
            if (typeof seller.trustRating === "number") {
                seller.trustRating = Math.min(5, Number((seller.trustRating + 0.05).toFixed(2)));
            }
        }

        res.status(200).json({
            success: true,
            data: { ticketId: ticket.ticketId, status: ticket.status, fees, payoutToSeller: fees.sellerReceives },
            error: null
        });
    }
};

module.exports = ticketController;
