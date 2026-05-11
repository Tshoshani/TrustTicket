/**
 * routes/transactionRoutes.js - Defines all REST endpoints for the Transactions resource.
 * Protected routes use the authorize() middleware to enforce role-based access.
 *
 * Base path: /transactions (mounted in server.js)
 */
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authorize = require('../middleware/auth');

// GET /transactions - Return a list of all transactions (admin and user roles)
router.get('/', authorize(['admin', 'user']), transactionController.getAllTransactions);

// GET /transactions/:id - Return a single transaction by ID (admin and user roles)
router.get('/:id', authorize(['admin', 'user']), transactionController.getTransactionById);

// POST /transactions - Create a new mock escrow transaction (admin and user roles)
router.post('/', authorize(['admin', 'user']), transactionController.createTransaction);

// PUT /transactions/:id - Update a transaction (admin only)
router.put('/:id', authorize(['admin']), transactionController.updateTransaction);

// DELETE /transactions/:id - Delete a transaction (admin only)
router.delete('/:id', authorize(['admin']), transactionController.deleteTransaction);

module.exports = router;
