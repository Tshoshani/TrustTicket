/**
 * routes/userRoutes.js - Defines all REST endpoints for the Users resource.
 * Each route maps an HTTP method + path to a controller function.
 * Protected routes use the authorize() middleware to enforce role-based access.
 *
 * Base path: /users (mounted in server.js)
 */
const express = require('express');
const router = express.Router(); // Create a modular route handler
const userController = require('../controllers/userController'); // Handler logic for each endpoint
const authorize = require('../middleware/auth'); // Role-check middleware

// GET /users - Return a list of all users (restricted to admin and manager roles)
router.get('/', authorize(['admin', 'manager']), userController.getAllUsers);

// GET /users/:id - Return a single user by their numeric ID (no role restriction)
router.get('/:id', userController.getUserById);

// POST /users - Create a new user record (admin only)
router.post('/', authorize(['admin']), userController.createUser);

// PUT /users/:id - Update all fields of an existing user (admin and manager only)
router.put('/:id', authorize(['admin', 'manager']), userController.updateUser);

// DELETE /users/:id - Permanently remove a user (admin only)
router.delete('/:id', authorize(['admin']), userController.deleteUser);

module.exports = router;
