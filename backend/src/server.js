/**
 * server.js - Main entry point for the TrustTicket backend API.
 * Sets up Express, registers global middleware, mounts route handlers,
 * and starts listening on the configured port.
 */
const { sequelize, User, Ticket, Transaction, Favorite } = require('../models');const express = require('express');
const cors = require('cors'); // Enables cross-origin requests from the React frontend (different port)
const app = express(); // Create the Express application instance

// Import custom middleware
const logger = require('../middleware/logger');
 // Logs every incoming request (method, URL, status, duration)

// Import route modules (each handles a specific resource)
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const ticketRoutes = require('../routes/ticketRoutes');
const transactionRoutes = require('../routes/transactionRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');
const settingsRoutes = require('../routes/settingsRoutes');
const favoriteRoutes = require('../routes/favoriteRoutes');

// Server configuration - the port the API will listen on
const PORT = 3000;

// Global Middleware
// CORS lets the frontend (http://localhost:5173) call this API from the browser.
// Allow the custom headers the frontend sends for the simulated auth.
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from the frontend dev server
    allowedHeaders: ['Content-Type', 'x-user-role', 'x-user-id']
}));
// express.json() parses incoming JSON request bodies so we can access req.body
app.use(express.json());
// Logger middleware runs on every request and prints request info to the console
app.use(logger);

// API Route Mounting
// All endpoints live under the /api base path (e.g. /api/auth/login, /api/users/me),
// matching the API contract defined in the assignment.
app.use('/api/auth', authRoutes);            // Authentication endpoints (login / logout)
app.use('/api/users', userRoutes);           // User-related endpoints
app.use('/api/tickets', ticketRoutes);       // Ticket-related endpoints
app.use('/api/transactions', transactionRoutes); // Transaction-related endpoints
app.use('/api/dashboard', dashboardRoutes);  // User dashboard summaries
app.use('/api/settings', settingsRoutes);    // Per-user settings
app.use('/api/favorites', favoriteRoutes);  // User favorites (junction table) endpoints

// Root route - simple health-check to verify the server is running
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: { message: "Welcome to Trust Ticket API" },
        error: null
    });
});

app.get('/api/db-test', async (req, res) => {
    try {
        await sequelize.authenticate();

        res.json({
            success: true,
            data: {
                message: "Database connected successfully"
            },
            error: null
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "DB_CONNECTION_ERROR",
                message: "Could not connect to database",
                details: {
                    reason: err.message
                }
            }
        });
    }
});


app.get('/api/orm-test', async (req, res) => {
    try {
        const users = await User.findAll();
        const tickets = await Ticket.findAll({
            include: [
                {
                    model: User,
                    as: "seller",
                    attributes: ["userId", "firstName", "lastName", "trustRating", "verifiedSeller"]
                }
            ]
        });
        const transactions = await Transaction.findAll();
        const favorites = await Favorite.findAll();

        res.json({
            success: true,
            data: {
                usersCount: users.length,
                ticketsCount: tickets.length,
                transactionsCount: transactions.length,
                favoritesCount: favorites.length,
                sampleTicketWithSeller: tickets[0]
            },
            error: null
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "ORM_TEST_FAILED",
                message: "ORM test failed",
                details: {
                    reason: err.message
                }
            }
        });
    }
});

// Catch-all route for unknown endpoints
app.use((req, res) => {
    res.status(404).json({
        success: false,
        data: null,
        error: {
            code: "NOT_FOUND",
            message: "Route not found",
            details: {}
        }
    });
});

/**
 * Global Error Handling Middleware.
 * Express calls this when next(err) is invoked or an unhandled error occurs.
 * Must have 4 parameters (err, req, res, next) so Express recognizes it as an error handler.
 * Returns a generic 500 response to avoid leaking internal details to the client.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        data: null,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong on the server.",
            details: {}
        }
    });
});

// Start the server and listen for incoming connections
app.listen(PORT, () => {
    console.log(`[Trust Ticket] Server is running on http://localhost:${PORT}`);
});

module.exports = app;
