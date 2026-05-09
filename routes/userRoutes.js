// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authorize = require('../middleware/auth');

// GET /api/users - Get all users (Allowed for admin and manager)
router.get('/', authorize(['admin', 'manager']), userController.getAllUsers);

// GET /api/users/:id - Get user by ID (Allowed for everyone)
router.get('/:id', userController.getUserById);

// POST /api/users - Create a new user (Allowed for admin)
router.post('/', authorize(['admin']), userController.createUser);

// DELETE /api/users/:id - Delete a user (Allowed for admin only)[cite: 15]
router.delete('/:id', authorize(['admin']), userController.deleteUser);

module.exports = router;