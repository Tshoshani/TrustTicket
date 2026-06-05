/**
 * controllers/dashboardController.js - Builds personal user dashboard summaries.
 * The dashboard combines mock users, tickets, and transactions data.
 */

const users = require('../models/users');
const tickets = require('../models/tickets');
const transactions = require('../models/transactions');

function toMoney(amount) {
    return Number(amount.toFixed(2));
}

function getSellerNet(transaction) {
    return Number(transaction.totalPrice || 0) - Number(transaction.sellerFee || 0);
}

const dashboardController = {

    /**
     * GET /dashboard/:userId
     * Returns a personal dashboard for a single user.
     */
    getDashboardByUserId: (req, res) => {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "Invalid user ID. Must be a number.", details: { field: "userId" } }
            });
        }

        const user = users.find(u => u.userId === userId);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `User with ID ${userId} not found`, details: {} }
            });
        }

        const activeListings = tickets.filter(ticket => ticket.sellerId === userId && ticket.status === "available");
        const relatedTransactions = transactions.filter(transaction =>
            transaction.buyerId === userId || transaction.sellerId === userId
        );
        const openTransactions = relatedTransactions.filter(transaction =>
            transaction.status !== "completed" && transaction.status !== "cancelled"
        );
        const purchaseHistory = transactions.filter(transaction =>
            transaction.buyerId === userId && transaction.status === "completed"
        );
        const salesHistory = transactions.filter(transaction =>
            transaction.sellerId === userId && transaction.status === "completed"
        );
        const pendingEscrowBalance = openTransactions
            .filter(transaction => transaction.sellerId === userId && !transaction.ticketReleased)
            .reduce((sum, transaction) => sum + getSellerNet(transaction), 0);
        const releasedEarnings = salesHistory
            .filter(transaction => transaction.ticketReleased)
            .reduce((sum, transaction) => sum + getSellerNet(transaction), 0);

        const dashboard = {
            userId,
            activeListings,
            openTransactions,
            purchaseHistory,
            salesHistory,
            pendingEscrowBalance: toMoney(pendingEscrowBalance),
            releasedEarnings: toMoney(releasedEarnings),
            successfulTransactions: relatedTransactions.filter(transaction => transaction.status === "completed").length
        };

        if (user.rating !== undefined) {
            dashboard.rating = user.rating;
        }

        res.status(200).json({ success: true, data: dashboard, error: null });
    }
};

module.exports = dashboardController;
