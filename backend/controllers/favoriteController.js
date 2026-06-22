/**
 * controllers/favoriteController.js
 * Favorites controller using MySQL + Sequelize ORM.
 * Demonstrates the favorites junction table and many-to-many relationship:
 * User <-> Ticket through Favorite.
 */

const { User, Ticket, Favorite } = require('../models');

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
        "verifiedSeller"
    ]
};

const favoriteController = {
    /**
     * POST /api/favorites
     * Body:
     * {
     *   "userId": 1,
     *   "ticketId": 101
     * }
     */
    addFavorite: async (req, res) => {
        try {
            const { userId, ticketId } = req.body || {};

            if (!userId || !ticketId) {
                const missing = [];
                if (!userId) missing.push("userId");
                if (!ticketId) missing.push("ticketId");

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

            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "USER_NOT_FOUND",
                        message: `User with ID ${userId} not found`,
                        details: { userId }
                    }
                });
            }

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

            const existingFavorite = await Favorite.findOne({
                where: {
                    userId,
                    ticketId
                }
            });

            if (existingFavorite) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "FAVORITE_ALREADY_EXISTS",
                        message: "This ticket is already in the user's favorites.",
                        details: { userId, ticketId }
                    }
                });
            }

            const favorite = await Favorite.create({
                userId,
                ticketId,
                createDate: new Date()
            });

            return res.status(201).json({
                success: true,
                data: {
                    userId: favorite.userId,
                    ticketId: favorite.ticketId
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "FAVORITE_CREATE_FAILED", "Failed to add favorite", err);
        }
    },

    /**
     * GET /api/favorites/user/:userId
     * Returns all favorite tickets for a user.
     * Uses the many-to-many relationship:
     * User belongsToMany Ticket through Favorite.
     */
    getFavoritesByUserId: async (req, res) => {
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
                        code: "USER_NOT_FOUND",
                        message: `User with ID ${userId} not found`,
                        details: { userId }
                    }
                });
            }

            const favoriteTickets = await user.getFavoriteTickets({
                include: [sellerInclude],
                joinTableAttributes: ["createDate"],
                order: [["ticketId", "ASC"]]
            });

            return res.status(200).json({
                success: true,
                data: favoriteTickets,
                error: null
            });
        } catch (err) {
            return handleServerError(res, "FAVORITES_FETCH_FAILED", "Failed to load favorites", err);
        }
    },

    /**
     * GET /api/favorites/ticket/:ticketId
     * Optional helper endpoint:
     * Returns users who favorited a ticket.
     * This proves the relationship works in the opposite direction too.
     */
    getUsersByFavoriteTicketId: async (req, res) => {
        try {
            const ticketId = parseInt(req.params.ticketId);

            if (isNaN(ticketId)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid ticket ID. Must be a number.",
                        details: { field: "ticketId" }
                    }
                });
            }

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

            const users = await ticket.getFavoritedByUsers({
                attributes: [
                    "userId",
                    "firstName",
                    "lastName",
                    "email",
                    "trustRating",
                    "verifiedSeller"
                ],
                joinTableAttributes: ["createDate"],
                order: [["userId", "ASC"]]
            });

            return res.status(200).json({
                success: true,
                data: users,
                error: null
            });
        } catch (err) {
            return handleServerError(res, "FAVORITE_USERS_FETCH_FAILED", "Failed to load users who favorited this ticket", err);
        }
    },

    /**
     * DELETE /api/favorites/:userId/:ticketId
     */
    removeFavorite: async (req, res) => {
        try {
            const userId = parseInt(req.params.userId);
            const ticketId = parseInt(req.params.ticketId);

            if (isNaN(userId) || isNaN(ticketId)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid user ID or ticket ID. Both must be numbers.",
                        details: { userId: req.params.userId, ticketId: req.params.ticketId }
                    }
                });
            }

            const favorite = await Favorite.findOne({
                where: {
                    userId,
                    ticketId
                }
            });

            if (!favorite) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        code: "FAVORITE_NOT_FOUND",
                        message: "Favorite record not found.",
                        details: { userId, ticketId }
                    }
                });
            }

            await favorite.destroy();

            return res.status(200).json({
                success: true,
                data: {
                    userId,
                    ticketId
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "FAVORITE_DELETE_FAILED", "Failed to remove favorite", err);
        }
    }
};

module.exports = favoriteController;