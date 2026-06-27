/**
 * controllers/transactionController.js
 * Transaction controller using MySQL + Sequelize ORM.
 * Replaces the old in-memory transactions array while keeping the same API contract.
 */

const { Transaction, Ticket, User } = require('../models');

function getMissingFields(body, requiredFields) {
    return requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === "");
}

function calculateFee(totalPrice, rate) {
    const amount = Number(totalPrice);
    return Number.isNaN(amount) ? 0 : Number((amount * rate).toFixed(2));
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

const ticketInclude = {
    model: Ticket,
    as: "ticket",
    attributes: [
        "ticketId",
        "eventName",
        "eventType",
        "eventDate",
        "venue",
        "salePrice",
        "status",
        "verified"
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
        "trustRating",
        "verifiedSeller"
    ]
};

const sellerInclude = {
    model: User,
    as: "seller",
    attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "trustRating",
        "verifiedSeller"
    ]
};

const transactionController = {

    /**
     * GET /transactions
     * Returns all transactions from MySQL.
     */
    getAllTransactions: async (req, res) => {
        try {
            const transactions = await Transaction.findAll({
                include: [ticketInclude, buyerInclude, sellerInclude],
                order: [["transactionId", "ASC"]]
            });

            return res.status(200).json({
                success: true,
                data: transactions,
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TRANSACTIONS_FETCH_FAILED", "Failed to load transactions", err);
        }
    },

    /**
     * GET /transactions/:id
     * Returns one transaction by ID.
     */
    getTransactionById: async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid transaction ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            const transaction = await Transaction.findByPk(id, {
                include: [ticketInclude, buyerInclude, sellerInclude]
            });

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "NOT_FOUND",
                        message: `Transaction with ID ${id} not found`,
                        details: {}
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: transaction,
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TRANSACTION_FETCH_FAILED", "Failed to load transaction", err);
        }
    },

    /**
     * POST /transactions
     * Creates a new transaction in MySQL.
     * Required fields: ticketId, buyerId, sellerId, totalPrice.
     */
    createTransaction: async (req, res) => {
        try {
            const requiredFields = ["ticketId", "buyerId", "sellerId", "totalPrice"];
            const body = req.body || {};
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

            const {
                ticketId,
                buyerId,
                sellerId,
                totalPrice,
                status,
                ticketReleased,
                buyerFee,
                sellerFee
            } = body;

            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "TICKET_NOT_FOUND",
                        message: `Ticket with ID ${ticketId} not found`,
                        details: { ticketId }
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

            const newTransaction = await Transaction.create({
                ticketId,
                buyerId,
                sellerId,
                status: status || "escrow_pending",
                ticketReleased: ticketReleased === undefined ? false : Boolean(ticketReleased),
                buyerFee: buyerFee === undefined ? calculateFee(totalPrice, 0.05) : buyerFee,
                sellerFee: sellerFee === undefined ? calculateFee(totalPrice, 0.03) : sellerFee,
                totalPrice,
                createDate: new Date(),
                updateDate: new Date()
            });

            return res.status(201).json({
                success: true,
                data: {
                    transactionId: newTransaction.transactionId
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TRANSACTION_CREATE_FAILED", "Failed to create transaction", err);
        }
    },

    /**
     * PUT /transactions/:id
     * Updates an existing transaction in MySQL.
     */
    updateTransaction: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const body = req.body || {};

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid transaction ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            const transaction = await Transaction.findByPk(id);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "NOT_FOUND",
                        message: `Transaction with ID ${id} not found`,
                        details: {}
                    }
                });
            }

            const requiredFields = ["ticketId", "buyerId", "sellerId", "totalPrice", "status", "ticketReleased"];
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

            const ticket = await Ticket.findByPk(body.ticketId);
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "TICKET_NOT_FOUND",
                        message: `Ticket with ID ${body.ticketId} not found`,
                        details: { ticketId: body.ticketId }
                    }
                });
            }

            const buyer = await User.findByPk(body.buyerId);
            if (!buyer) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "BUYER_NOT_FOUND",
                        message: `Buyer with ID ${body.buyerId} not found`,
                        details: { buyerId: body.buyerId }
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

            await transaction.update({
                ticketId: body.ticketId,
                buyerId: body.buyerId,
                sellerId: body.sellerId,
                status: body.status,
                ticketReleased: Boolean(body.ticketReleased),
                buyerFee: body.buyerFee === undefined ? calculateFee(body.totalPrice, 0.05) : body.buyerFee,
                sellerFee: body.sellerFee === undefined ? calculateFee(body.totalPrice, 0.03) : body.sellerFee,
                totalPrice: body.totalPrice,
                updateDate: new Date()
            });

            return res.status(200).json({
                success: true,
                data: {
                    transactionId: id
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TRANSACTION_UPDATE_FAILED", "Failed to update transaction", err);
        }
    },

    /**
     * DELETE /transactions/:id
     * Deletes a transaction from MySQL.
     */
    deleteTransaction: async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid transaction ID. Must be a number.",
                        details: { field: "id" }
                    }
                });
            }

            const transaction = await Transaction.findByPk(id);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "NOT_FOUND",
                        message: `Transaction with ID ${id} not found`,
                        details: {}
                    }
                });
            }

            await transaction.destroy();

            return res.status(200).json({
                success: true,
                data: {
                    transactionId: id
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "TRANSACTION_DELETE_FAILED", "Failed to delete transaction", err);
        }
    }
};

module.exports = transactionController;