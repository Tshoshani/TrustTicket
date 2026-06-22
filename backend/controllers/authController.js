/**
 * controllers/authController.js
 * Authentication controller using MySQL + Sequelize ORM.
 * Keeps the simple Assignment 2/3 simulated auth behavior.
 */

const { User } = require('../models');

function toPublicUser(userInstance) {
    const user = userInstance.toJSON ? userInstance.toJSON() : userInstance;
    const { password, ...publicUser } = user;
    return publicUser;
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

const authController = {
    /**
     * POST /api/auth/login
     * Body:
     * {
     *   "email": "...",
     *   "password": "..."
     * }
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body || {};

            if (!email || !password) {
                const missing = [];
                if (!email) missing.push("email");
                if (!password) missing.push("password");

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

            const user = await User.findOne({
                where: { email }
            });

            if (!user || user.password !== password) {
                return res.status(401).json({
                    success: false,
                    data: null,
                    error: {
                        code: "INVALID_CREDENTIALS",
                        message: "Invalid email or password.",
                        details: {}
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    user: toPublicUser(user),
                    token: `demo-token-user-${user.userId}`
                },
                error: null
            });
        } catch (err) {
            return handleServerError(res, "LOGIN_FAILED", "Failed to login", err);
        }
    },

    /**
     * POST /api/auth/logout
     * Keeps simple simulated logout.
     */
    logout: async (req, res) => {
        return res.status(200).json({
            success: true,
            data: {
                message: "Logged out successfully"
            },
            error: null
        });
    }
};

module.exports = authController;
