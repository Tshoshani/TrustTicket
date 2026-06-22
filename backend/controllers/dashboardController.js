/**
 * controllers/dashboardController.js
 * Builds personal user dashboard summaries using MySQL + Sequelize ORM.
 * Replaces the old mock users/tickets/transactions arrays.
 */

const { Op } = require("sequelize");
const { User, Ticket, Transaction } = require('../models');

function toMoney(amount) {
    const n = Number(amount || 0);
    return Number(n.toFixed(2));
}

function getSellerNet(transaction) {
    return Number(transaction.totalPrice || 0) - Number(transaction.sellerFee || 0);
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
        "verified",
        "sellerId",
        "buyerId"
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

const dashboardController = {

    /**
     * GET /dashboard/:userId
     * Returns a personal dashboard for a single user.
     */
    getDashboardByUserId: async (req, res) => {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid user ID. Must be a number.",
                        details: { field: "userId" }
                    }
                });
            }

            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "NOT_FOUND",
                        message: `User with ID ${userId} not found`,
                        details: {}
                    }
                });
            }

            const activeListings = await Ticket.findAll({
                where: {
                    sellerId: userId,
                    status: "available"
                },
                order: [["ticketId", "ASC"]]
            });

            const relatedTransactions = await Transaction.findAll({
                where: {
                    [Op.or]: [
                        { buyerId: userId },
                        { sellerId: userId }
                    ]
                },
                include: [ticketInclude, buyerInclude, sellerInclude],
                order: [["transactionId", "ASC"]]
            });

            const relatedPlain = relatedTransactions.map(t => t.toJSON());

            const openTransactions = relatedPlain.filter(transaction =>
                transaction.status !== "completed" && transaction.status !== "cancelled"
            );

            const purchaseHistory = relatedPlain.filter(transaction =>
                transaction.buyerId === userId && transaction.status === "completed"
            );

            const salesHistory = relatedPlain.filter(transaction =>
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
                activeListings: activeListings.map(ticket => ticket.toJSON()),
                openTransactions,
                purchaseHistory,
                salesHistory,
                pendingEscrowBalance: toMoney(pendingEscrowBalance),
                releasedEarnings: toMoney(releasedEarnings),
                successfulTransactions: relatedPlain.filter(transaction => transaction.status === "completed").length,
                rating: Number(user.trustRating || 0)
            };

            return res.status(200).json({
                success: true,
                data: dashboard,
                error: null
            });
        } catch (err) {
            return handleServerError(res, "DASHBOARD_FETCH_FAILED", "Failed to load dashboard", err);
        }
    }
};

module.exports = dashboardController;