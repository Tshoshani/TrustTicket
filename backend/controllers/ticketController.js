/**
 * controllers/ticketController.js
 * Ticket controller using MySQL + Sequelize ORM.
 * Replaces the old in-memory tickets array while keeping the same API response format.
 */

const { Ticket, User, Transaction } = require('../models');
const {
    emitTicketCreated,
    emitTicketUpdated,
    emitTicketPurchased
} = require('../src/socket');

const FEE_RATE = 0.025;

function getMissingFields(body, requiredFields) {
    return requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === "");
}

function money(amount) {
    const n = Number(amount);
    return Number.isNaN(n) ? 0 : Number(n.toFixed(2));
}

function buildFeeBreakdown(salePrice) {
    const base = money(salePrice);
    const buyerFee = money(base * FEE_RATE);
    const sellerFee = money(base * FEE_RATE);

    return {
        salePrice: base,
        buyerFee,
        sellerFee,
        buyerPays: money(base + buyerFee),
        sellerReceives: money(base - sellerFee),
        platformRevenue: money(buyerFee + sellerFee)
    };
}

function handleServerError(res, code, message, err) {
    return res.status(500).json({
        success: false,
        data: null,
        error: {
            code,
            message,
            details: {
                reason: err.message
            }
        }
    });
}

const sellerInclude = {
    model: User,
    as: "seller",
    attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "trustRating",
        "ratingCount",
        "successfulDeals",
        "verifiedSeller"
    ]
};

const buyerInclude = {
    model: User,
    as: "buyer",
    attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "trustRating"
    ]
};

const ticketController = {
    /**
     * GET /tickets
     * Returns all tickets from MySQL.
     * Supports filters:
     * ?eventType=
     * ?status=
     * ?search=
     * ?date=
     * ?minPrice=
     * ?maxPrice=
     */
    getAllTickets: async (req, res) => {
        try {
            const tickets = await Ticket.findAll({
                include: [sellerInclude, buyerInclude],
                order: [["ticketId", "ASC"]]
            });

            let result = tickets.map(ticket => ticket.toJSON());

            if (req.query.eventType) {
                result = result.filter(t =>
                    t.eventType &&
                    t.eventType.toLowerCase() === req.query.eventType.toLowerCase()
                );
            }

            if (req.query.status) {
                result = result.filter(t =>
                    t.status &&
                    t.status.toLowerCase() === req.query.status.toLowerCase()
                );
            }

            if (req.query.search) {
                const q = req.query.search.toLowerCase();
                result = result.filter(t =>
                    (t.eventName && t.eventName.toLowerCase().includes(q)) ||
                    (t.venue && t.venue.toLowerCase().includes(q))
                );
            }

            if (req.query.date) {
                result = result.filter(t => t.eventDate === req.query.date);
            }

            if (req.query.minPrice !== undefined && req.query.minPrice !== "") {
                const min = Number(req.query.minPrice);
                if (!Number.isNaN(min)) {
                    result = result.filter(t => Number(t.salePrice) >= min);
                }
            }

            if (req.query.maxPrice !== undefined && req.query.maxPrice !== "") {
                const max = Number(req.query.maxPrice);
                if (!Number.isNaN(max)) {
                    result = result.filter(t => Number(t.salePrice) <= max);
                }
            }

            return res.status(200).json({
                success: true,
                data: result,
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TICKETS_FETCH_FAILED", "Failed to load tickets", err);
        }
    },

    /**
     * GET /tickets/:id
     */
    getTicketById: async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid ticket ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            const ticket = await Ticket.findByPk(id, {
                include: [sellerInclude, buyerInclude]
            });

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

            return res.status(200).json({
                success: true,
                data: ticket,
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TICKET_FETCH_FAILED", "Failed to load ticket", err);
        }
    },

    /**
     * POST /tickets
     */
    createTicket: async (req, res) => {
        try {
            const {
                eventName,
                eventType,
                eventDate,
                venue,
                barcode,
                originalPrice,
                salePrice,
                sellerId
            } = req.body;

            if (!eventName || !eventType || !eventDate || !barcode || !salePrice || !sellerId) {
                const missing = [];
                if (!eventName) missing.push("eventName");
                if (!eventType) missing.push("eventType");
                if (!eventDate) missing.push("eventDate");
                if (!barcode) missing.push("barcode");
                if (!salePrice) missing.push("salePrice");
                if (!sellerId) missing.push("sellerId");

                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: `Missing required field(s): ${missing.join(", ")}`,
                        details: { missing }
                    }
                });
            }

            const seller = await User.findByPk(sellerId);

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "SELLER_NOT_FOUND",
                        message: `Seller with ID ${sellerId} not found`,
                        details: { sellerId }
                    }
                });
            }

            const newTicket = await Ticket.create({
                eventName,
                eventType,
                eventDate,
                venue: venue || "Unknown venue",
                barcode,
                originalPrice: originalPrice || salePrice,
                salePrice,
                sellerId,
                status: "pending",
                verified: false,
                buyerId: null,
                createDate: new Date(),
                updateDate: new Date()
            });

            // Real-time: tell every connected client a new listing appeared.
            emitTicketCreated({
                ticketId: newTicket.ticketId,
                eventName: newTicket.eventName,
                eventType: newTicket.eventType,
                venue: newTicket.venue,
                salePrice: newTicket.salePrice,
                status: newTicket.status,
                sellerId: newTicket.sellerId
            });

            return res.status(201).json({
                success: true,
                data: {
                    ticketId: newTicket.ticketId
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TICKET_CREATE_FAILED", "Failed to create ticket", err);
        }
    },

    /**
     * PUT /tickets/:id
     */
    updateTicket: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const body = req.body || {};

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid ticket ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            const ticket = await Ticket.findByPk(id);

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

            const requiredFields = ["eventName", "eventType", "eventDate", "barcode", "salePrice", "sellerId"];
            const missing = getMissingFields(body, requiredFields);

            if (missing.length > 0) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: `Missing required field(s): ${missing.join(", ")}`,
                        details: { missing }
                    }
                });
            }

            const seller = await User.findByPk(body.sellerId);

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "SELLER_NOT_FOUND",
                        message: `Seller with ID ${body.sellerId} not found`,
                        details: { sellerId: body.sellerId }
                    }
                });
            }

            await ticket.update({
                ...body,
                venue: body.venue || "Unknown venue",
                originalPrice: body.originalPrice || body.salePrice,
                updateDate: new Date()
            });

            // Real-time: notify clients the listing changed.
            emitTicketUpdated({
                ticketId: ticket.ticketId,
                eventName: ticket.eventName,
                eventType: ticket.eventType,
                venue: ticket.venue,
                salePrice: ticket.salePrice,
                status: ticket.status
            });

            return res.status(200).json({
                success: true,
                data: {
                    ticketId: id
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TICKET_UPDATE_FAILED", "Failed to update ticket", err);
        }
    },

    /**
     * DELETE /tickets/:id
     */
    deleteTicket: async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid ticket ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            const ticket = await Ticket.findByPk(id);

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

            // Ownership check: a regular 'user' may delete only their own listing;
            // admin/manager may delete any ticket. Identity comes from the
            // simulated-auth headers set by the frontend.
            const role = req.headers["x-user-role"];
            const requesterId = parseInt(req.headers["x-user-id"], 10);
            const isPrivileged = role === "admin" || role === "manager";

            if (!isPrivileged && ticket.sellerId !== requesterId) {
                return res.status(403).json({
                    success: false,
                    data: null,
                    error: {
                        code: "FORBIDDEN",
                        message: "You can only delete your own ticket listings.",
                        details: {}
                    }
                });
            }

            await ticket.destroy();

            return res.status(200).json({
                success: true,
                data: {
                    ticketId: id
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TICKET_DELETE_FAILED", "Failed to delete ticket", err);
        }
    },

    /**
     * POST /tickets/:id/verify
     */
    verifyTicket: async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid ticket ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            const ticket = await Ticket.findByPk(id);

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

            if (ticket.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: `Only tickets that are pending verification can be verified (current status: ${ticket.status}).`,
                        details: { status: ticket.status }
                    }
                });
            }

            await ticket.update({
                verified: true,
                status: "available",
                updateDate: new Date()
            });

            // Real-time: a ticket becoming verified/available is a meaningful update.
            emitTicketUpdated({
                ticketId: ticket.ticketId,
                eventName: ticket.eventName,
                eventType: ticket.eventType,
                venue: ticket.venue,
                salePrice: ticket.salePrice,
                status: ticket.status,
                verified: ticket.verified
            });

            return res.status(200).json({
                success: true,
                data: ticket,
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TICKET_VERIFY_FAILED", "Failed to verify ticket", err);
        }
    },

    /**
     * POST /tickets/:id/purchase
     */
    purchaseTicket: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const buyerId = parseInt(req.headers["x-user-id"]);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid ticket ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            if (isNaN(buyerId)) {
                return res.status(401).json({
                    success: false,
                    data: null,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Missing or invalid x-user-id header (buyer not identified).",
                        details: {}
                    }
                });
            }

            const buyer = await User.findByPk(buyerId);

            if (!buyer) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "BUYER_NOT_FOUND",
                        message: `Buyer with ID ${buyerId} not found`,
                        details: { buyerId }
                    }
                });
            }

            const ticket = await Ticket.findByPk(id);

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

            if (!ticket.verified || ticket.status !== "available") {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: `This ticket is not available for purchase (status: ${ticket.status}, verified: ${ticket.verified}).`,
                        details: {
                            status: ticket.status,
                            verified: ticket.verified
                        }
                    }
                });
            }

            if (Number(ticket.sellerId) === buyerId) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "You cannot buy your own ticket.",
                        details: {}
                    }
                });
            }

            await ticket.update({
                buyerId,
                status: "reserved",
                updateDate: new Date()
            });

            const fees = buildFeeBreakdown(ticket.salePrice);

            const newTransaction = await Transaction.create({
                ticketId: ticket.ticketId,
                buyerId,
                sellerId: ticket.sellerId,
                status: "escrow_pending",
                ticketReleased: true,
                buyerFee: fees.buyerFee,
                sellerFee: fees.sellerFee,
                totalPrice: fees.salePrice,
                createDate: new Date(),
                updateDate: new Date()
            });

            // Real-time: announce the purchase to every connected client.
            emitTicketPurchased({
                ticketId: ticket.ticketId,
                eventName: ticket.eventName,
                status: ticket.status,
                buyerId,
                sellerId: ticket.sellerId,
                salePrice: fees.salePrice
            });

            return res.status(201).json({
                success: true,
                data: {
                    ticketId: ticket.ticketId,
                    transactionId: newTransaction.transactionId,
                    status: ticket.status,
                    fees
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TICKET_PURCHASE_FAILED", "Failed to purchase ticket", err);
        }
    },

    /**
     * POST /tickets/:id/redeem
     */
    redeemTicket: async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid ticket ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            const ticket = await Ticket.findByPk(id);

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

            if (ticket.status !== "reserved") {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: `Only reserved (in-escrow) tickets can be redeemed (current status: ${ticket.status}).`,
                        details: { status: ticket.status }
                    }
                });
            }

            await ticket.update({
                status: "completed",
                updateDate: new Date()
            });

            const fees = buildFeeBreakdown(ticket.salePrice);

            const transaction = await Transaction.findOne({
                where: {
                    ticketId: ticket.ticketId,
                    status: "escrow_pending"
                },
                order: [["transactionId", "DESC"]]
            });

            if (transaction) {
                await transaction.update({
                    status: "completed",
                    ticketReleased: true,
                    updateDate: new Date()
                });
            }

            const seller = await User.findByPk(ticket.sellerId);

            if (seller) {
                const currentSuccessfulDeals = Number(seller.successfulDeals || 0);
                const currentRatingCount = Number(seller.ratingCount || 0);
                const currentTrustRating = Number(seller.trustRating || 0);

                await seller.update({
                    successfulDeals: currentSuccessfulDeals + 1,
                    ratingCount: currentRatingCount + 1,
                    trustRating: Math.min(5, Number((currentTrustRating + 0.05).toFixed(2))),
                    updateDate: new Date()
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    ticketId: ticket.ticketId,
                    status: ticket.status,
                    fees,
                    payoutToSeller: fees.sellerReceives
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TICKET_REDEEM_FAILED", "Failed to redeem ticket", err);
        }
    }
};

module.exports = ticketController;