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
     * POST /api/auth/register
     * Public self-registration. Creates a new "user" role account and returns
     * the same { user, token } shape as login, so the frontend can log the
     * new user straight in.
     *
     * Body: { firstName, lastName, email, password }
     */
    register: async (req, res) => {
        try {
            const { firstName, lastName, email, password } = req.body || {};

            // Field-level validation with a clear "missing fields" list.
            const missing = [];
            if (!firstName || !String(firstName).trim()) missing.push("firstName");
            if (!lastName || !String(lastName).trim()) missing.push("lastName");
            if (!email || !String(email).trim()) missing.push("email");
            if (!password) missing.push("password");

            if (missing.length) {
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

            // Basic email + password rules (mirrors the frontend validation).
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Please provide a valid email address.",
                        details: { field: "email" }
                    }
                });
            }

            if (String(password).length < 6) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Password must be at least 6 characters.",
                        details: { field: "password" }
                    }
                });
            }

            const newUser = await User.create({
                firstName: String(firstName).trim(),
                lastName: String(lastName).trim(),
                email: String(email).trim().toLowerCase(),
                password,
                userRole: "user",
                trustRating: 0,
                ratingCount: 0,
                successfulDeals: 0,
                verifiedSeller: false,
                createDate: new Date(),
                updateDate: new Date()
            });

            return res.status(201).json({
                success: true,
                data: {
                    user: toPublicUser(newUser),
                    token: `demo-token-user-${newUser.userId}`
                },
                error: null
            });
        } catch (err) {
            if (err.name === "SequelizeUniqueConstraintError") {
                return res.status(409).json({
                    success: false,
                    data: null,
                    error: {
                        code: "DUPLICATE_EMAIL",
                        message: "A user with this email already exists.",
                        details: { field: "email" }
                    }
                });
            }
            return handleServerError(res, "REGISTER_FAILED", "Failed to register", err);
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
