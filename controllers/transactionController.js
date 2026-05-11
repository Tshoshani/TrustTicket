/**
 * controllers/transactionController.js - Business logic for Transaction endpoints.
 * Transactions are mock records that simulate TrustTicket's escrow flow.
 * All responses follow the standard format: { success, data, error }.
 */

let transactions = require('../models/transactions');

function getMissingFields(body, requiredFields) {
    return requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === "");
}

function calculateFee(totalPrice, rate) {
    const amount = Number(totalPrice);
    return Number.isNaN(amount) ? 0 : Number((amount * rate).toFixed(2));
}

const transactionController = {

    /**
     * GET /transactions
     * Returns the full list of mock transactions.
     */
    getAllTransactions: (req, res) => {
        res.status(200).json({ success: true, data: transactions, error: null });
    },

    /**
     * GET /transactions/:id
     * Returns a single transaction by its numeric ID.
     */
    getTransactionById: (req, res) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Invalid transaction ID. Must be a number.", details: { field: "id" } }
            });
        }

        const transaction = transactions.find(t => t.transactionId === id);
        if (!transaction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `Transaction with ID ${id} not found`, details: {} }
            });
        }

        res.status(200).json({ success: true, data: transaction, error: null });
    },

    /**
     * POST /transactions
     * Creates a new mock escrow transaction.
     * Required fields: ticketId, buyerId, sellerId, totalPrice.
     */
    createTransaction: (req, res) => {
        const requiredFields = ["ticketId", "buyerId", "sellerId", "totalPrice"];
        const body = req.body || {};
        const missing = getMissingFields(body, requiredFields);

        if (missing.length > 0) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: `Missing required field(s): ${missing.join(", ")}`, details: { missing } }
            });
        }

        const { ticketId, buyerId, sellerId, totalPrice, status, ticketReleased, buyerFee, sellerFee } = body;
        const now = new Date().toISOString();
        const newTransaction = {
            transactionId: transactions.length > 0 ? Math.max(...transactions.map(t => t.transactionId)) + 1 : 1001,
            ticketId,
            buyerId,
            sellerId,
            status: status || "escrow_pending",
            ticketReleased: ticketReleased === undefined ? false : Boolean(ticketReleased),
            buyerFee: buyerFee === undefined ? calculateFee(totalPrice, 0.05) : buyerFee,
            sellerFee: sellerFee === undefined ? calculateFee(totalPrice, 0.03) : sellerFee,
            totalPrice,
            createDate: now,
            updateDate: now
        };

        transactions.push(newTransaction);
        res.status(201).json({ success: true, data: { transactionId: newTransaction.transactionId }, error: null });
    },

    /**
     * PUT /transactions/:id
     * Updates an existing mock transaction with provided fields.
     */
    updateTransaction: (req, res) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Invalid transaction ID. Must be a number.", details: { field: "id" } }
            });
        }

        const index = transactions.findIndex(t => t.transactionId === id);
        if (index === -1) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `Transaction with ID ${id} not found`, details: {} }
            });
        }

        transactions[index] = { ...transactions[index], ...req.body, updateDate: new Date().toISOString() };
        res.status(200).json({ success: true, data: { transactionId: id }, error: null });
    },

    /**
     * DELETE /transactions/:id
     * Removes a mock transaction by its ID.
     */
    deleteTransaction: (req, res) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Invalid transaction ID. Must be a number.", details: { field: "id" } }
            });
        }

        const index = transactions.findIndex(t => t.transactionId === id);
        if (index === -1) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `Transaction with ID ${id} not found`, details: {} }
            });
        }

        transactions.splice(index, 1);
        res.status(200).json({ success: true, data: { transactionId: id }, error: null });
    }
};

module.exports = transactionController;
