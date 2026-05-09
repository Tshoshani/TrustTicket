// controllers/ticketController.js
let tickets = require('../models/tickets'); // Import mock ticket data

const ticketController = {
    // GET /tickets - Retrieve all tickets
    getAllTickets: (req, res) => {
        res.status(200).json({ success: true, data: tickets, error: null });
    },

    // GET /tickets/:id - Retrieve a specific ticket by its ID
    getTicketById: (req, res) => {
        const id = parseInt(req.params.id);
        const ticket = tickets.find(t => t.ticketId === id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: `Ticket with ID ${id} not found`,
                    details: {}
                }
            });
        }
        res.status(200).json({ success: true, data: ticket, error: null });
    },

    // POST /tickets - Create a new ticket listing[cite: 15]
    createTicket: (req, res) => {
        const { eventType, barcode, salePrice, sellerId } = req.body;

        // Basic validation for required fields as per assignment rules[cite: 15]
        if (!eventType || !barcode || !salePrice || !sellerId) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Missing required fields for ticket creation",
                    details: { required: ["eventType", "barcode", "salePrice", "sellerId"] }
                }
            });
        }

        const newTicket = {
            ticketId: tickets.length > 0 ? Math.max(...tickets.map(t => t.ticketId)) + 1 : 101,
            eventType,
            barcode,
            salePrice,
            sellerId,
            status: "available", // Default status for new listings[cite: 14]
            createDate: new Date().toISOString()
        };

        tickets.push(newTicket);
        res.status(201).json({ success: true, data: { ticketId: newTicket.ticketId }, error: null });
    },

    // PUT /tickets/:id - Update ticket details[cite: 15]
    updateTicket: (req, res) => {
        const id = parseInt(req.params.id);
        const index = tickets.findIndex(t => t.ticketId === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Ticket not found", details: {} }
            });
        }

        // Update existing ticket data with new values from request body
        tickets[index] = { ...tickets[index], ...req.body, updateDate: new Date().toISOString() };
        
        res.status(200).json({ success: true, data: { ticketId: id }, error: null });
    },

    // DELETE /tickets/:id - Remove a ticket from the marketplace[cite: 15]
    deleteTicket: (req, res) => {
        const id = parseInt(req.params.id);
        const index = tickets.findIndex(t => t.ticketId === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Ticket not found", details: {} }
            });
        }

        tickets.splice(index, 1);
        res.status(200).json({ success: true, data: { ticketId: id }, error: null });
    }
};

module.exports = ticketController;