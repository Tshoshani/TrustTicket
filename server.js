// server.js
const express = require('express');
const app = express();
const logger = require('./middleware/logger');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes'); // Make sure the file in routes is named ticketRoutes.js

// Server configuration
const PORT = 3000;

// Global Middleware
app.use(express.json()); // Middleware to parse JSON bodies[cite: 7, 15]
app.use(logger); // Middleware to log every incoming request[cite: 15]

// API Routes setup[cite: 15]
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

// Root health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: { message: "Welcome to Trust Ticket API" },
        error: null
    });
});

// Global Error Handling Middleware[cite: 15]
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        data: null,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong on the server.",
            details: err.message
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`[Trust Ticket] Server is running on http://localhost:${PORT}`);
});