/**
 * server.js - Main entry point for the TrustTicket backend API.
 * Sets up Express, registers global middleware, mounts route handlers,
 * and starts listening on the configured port.
 */

const express = require('express');
const app = express(); // Create the Express application instance

// Import custom middleware
const logger = require('./middleware/logger'); // Logs every incoming request (method, URL, status, duration)

// Import route modules (each handles a specific resource)
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Server configuration - the port the API will listen on
const PORT = 3000;

// Global Middleware
// express.json() parses incoming JSON request bodies so we can access req.body
app.use(express.json());
// Logger middleware runs on every request and prints request info to the console
app.use(logger);

// API Route Mounting
// All user-related endpoints are handled under /users
app.use('/users', userRoutes);
// All ticket-related endpoints are handled under /tickets
app.use('/tickets', ticketRoutes);
// All transaction-related endpoints are handled under /transactions
app.use('/transactions', transactionRoutes);
// User dashboard summaries are handled under /dashboard
app.use('/dashboard', dashboardRoutes);

// Root route - simple health-check to verify the server is running
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: { message: "Welcome to Trust Ticket API" },
        error: null
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
