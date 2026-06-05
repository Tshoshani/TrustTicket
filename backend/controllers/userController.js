/**
 * controllers/userController.js - Business logic for User endpoints.
 * Each method handles one route action (get all, get by ID, create, update, delete).
 * All responses follow the standard format: { success, data, error }.
 */

// Import the in-memory users array (mock database)
// Using 'let' because the reference could change, though here we mutate the array in-place
let users = require('../models/users');

const userController = {

  /**
   * GET /users
   * Returns the full list of all users.
   */
  getAllUsers: (req, res) => {
    res.status(200).json({ success: true, data: users, error: null });
  },

  /**
   * GET /users/:id
   * Returns a single user matching the given ID.
   * Validates that :id is a valid number before searching.
   */
  getUserById: (req, res) => {
    const id = parseInt(req.params.id); // Convert the URL param from string to integer

    // Validation: ensure the ID is a valid number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: "Invalid user ID. Must be a number.", details: { field: "id" } }
      });
    }

    // Search for the user in the in-memory array
    const user = users.find(u => u.userId === id);
    if (!user) {
      return res.status(404).json({
        success: false, data: null,
        error: { code: "NOT_FOUND", message: `User with ID ${id} not found`, details: {} }
      });
    }

    res.status(200).json({ success: true, data: user, error: null });
  },

  /**
   * POST /users
   * Creates a new user from the request body.
   * Required fields: firstName, lastName, userRole.
   * Auto-generates userId, createDate, and updateDate.
   */
  createUser: (req, res) => {
    // Destructure expected fields from the request body
    const { firstName, lastName, userRole } = req.body;

    // Validate that all required fields are present
    if (!firstName || !lastName || !userRole) {
      // Build a list of which specific fields are missing for a helpful error message
      const missing = [];
      if (!firstName) missing.push("firstName");
      if (!lastName) missing.push("lastName");
      if (!userRole) missing.push("userRole");
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: `Missing required field(s): ${missing.join(", ")}`, details: { missing } }
      });
    }

    // Generate a new unique ID by finding the current max ID and adding 1.
    // This avoids duplicate IDs even after deletions (unlike users.length + 1).
    const newUser = {
      userId: users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1,
      firstName,
      lastName,
      userRole,
      createDate: new Date().toISOString(), // Timestamp of creation
      updateDate: new Date().toISOString()  // Same as createDate initially
    };

    users.push(newUser); // Add the new user to the in-memory array
    res.status(201).json({ success: true, data: { userId: newUser.userId }, error: null });
  },

  /**
   * PUT /users/:id
   * Updates an existing user's firstName, lastName, and userRole.
   * All three fields are required in the request body.
   * Automatically refreshes the updateDate timestamp.
   */
  updateUser: (req, res) => {
    const id = parseInt(req.params.id);

    // Validate that the ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: "Invalid user ID. Must be a number.", details: { field: "id" } }
      });
    }

    // Find the user's position in the array
    const index = users.findIndex(u => u.userId === id);
    if (index === -1) {
      return res.status(404).json({
        success: false, data: null,
        error: { code: "NOT_FOUND", message: `User with ID ${id} not found`, details: {} }
      });
    }

    // Validate the update body - all fields are required for a full update (PUT)
    const { firstName, lastName, userRole } = req.body;
    if (!firstName || !lastName || !userRole) {
      const missing = [];
      if (!firstName) missing.push("firstName");
      if (!lastName) missing.push("lastName");
      if (!userRole) missing.push("userRole");
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: `Missing required field(s): ${missing.join(", ")}`, details: { missing } }
      });
    }

    // Merge old data with new fields using spread operator; update the timestamp
    users[index] = { ...users[index], firstName, lastName, userRole, updateDate: new Date().toISOString() };
    res.status(200).json({ success: true, data: { userId: id }, error: null });
  },

  /**
   * DELETE /users/:id
   * Removes a user from the in-memory array by their ID.
   */
  deleteUser: (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: "Invalid user ID. Must be a number.", details: { field: "id" } }
      });
    }

    const index = users.findIndex(u => u.userId === id);
    if (index === -1) {
      return res.status(404).json({
        success: false, data: null,
        error: { code: "NOT_FOUND", message: "User not found", details: {} }
      });
    }

    users.splice(index, 1); // Remove 1 element at the found index
    res.status(200).json({ success: true, data: { userId: id }, error: null });
  }
};

module.exports = userController;
