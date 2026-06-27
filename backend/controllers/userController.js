/**
 * controllers/userController.js
 * User controller using MySQL + Sequelize ORM.
 * Replaces the old in-memory users array while keeping the same API contract.
 */

const { User, Review } = require('../models');

const toPublicUser = (userInstance) => {
  const user = userInstance.toJSON ? userInstance.toJSON() : userInstance;
  const { password, ...publicUser } = user;
  return publicUser;
};

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

const userController = {
  /**
   * GET /users/:id/reviews
   * Returns all reviews left for a given user (seller), newest first.
   * Demonstrates the User hasMany Review one-to-many relationship.
   */
  getUserReviews: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID. Must be a number.', details: { field: 'id' } }
        });
      }

      const user = await User.findByPk(id, {
        include: [{ model: Review, as: 'reviews' }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: { code: 'NOT_FOUND', message: `User with ID ${id} not found`, details: {} }
        });
      }

      const reviews = (user.reviews || [])
        .map((r) => r.toJSON())
        .sort((a, b) => new Date(b.createDate) - new Date(a.createDate));

      return res.status(200).json({
        success: true,
        data: {
          userId: user.userId,
          trustRating: user.trustRating,
          ratingCount: user.ratingCount,
          reviews
        },
        error: null
      });
    } catch (err) {
      return handleServerError(res, 'USER_REVIEWS_FAILED', 'Failed to load user reviews', err);
    }
  },

  /**
   * GET /users
   * Returns all users from MySQL without passwords.
   */
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        order: [["userId", "ASC"]]
      });

      return res.status(200).json({
        success: true,
        data: users.map(toPublicUser),
        error: null
      });
    } catch (err) {
      return handleServerError(res, "USERS_FETCH_FAILED", "Failed to load users", err);
    }
  },

  /**
   * GET /users/me
   * Returns the currently logged-in user based on x-user-id header.
   */
  getMe: async (req, res) => {
    try {
      const id = parseInt(req.headers['x-user-id']);

      if (isNaN(id)) {
        return res.status(401).json({
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Not authenticated. Missing or invalid x-user-id header.",
            details: {}
          }
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: {
            code: "NOT_FOUND",
            message: `User with ID ${id} not found`,
            details: {}
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: toPublicUser(user),
        error: null
      });
    } catch (err) {
      return handleServerError(res, "USER_FETCH_FAILED", "Failed to load current user", err);
    }
  },

  /**
   * GET /users/:id
   * Returns one user from MySQL by ID.
   */
  getUserById: async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user ID. Must be a number.",
            details: { field: "id" }
          }
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: {
            code: "NOT_FOUND",
            message: `User with ID ${id} not found`,
            details: {}
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: toPublicUser(user),
        error: null
      });
    } catch (err) {
      return handleServerError(res, "USER_FETCH_FAILED", "Failed to load user", err);
    }
  },

  /**
   * POST /users
   * Creates a new user in MySQL.
   * Keeps old API requirement: firstName, lastName, userRole.
   * Also supports optional email and password.
   */
  createUser: async (req, res) => {
    try {
      const { firstName, lastName, userRole, email, password } = req.body;

      if (!firstName || !lastName || !userRole) {
        const missing = [];
        if (!firstName) missing.push("firstName");
        if (!lastName) missing.push("lastName");
        if (!userRole) missing.push("userRole");

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

      if (!["admin", "manager", "user"].includes(userRole)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid userRole. Must be admin, manager, or user.",
            details: { field: "userRole" }
          }
        });
      }

      const safeFirstName = firstName.trim();
      const safeLastName = lastName.trim();

      const generatedEmail =
        email ||
        `${safeFirstName.toLowerCase()}.${safeLastName.toLowerCase()}.${Date.now()}@trustticket.local`;

      const newUser = await User.create({
        firstName: safeFirstName,
        lastName: safeLastName,
        email: generatedEmail,
        password: password || "password123",
        userRole,
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
          userId: newUser.userId
        },
        error: null
      });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "DUPLICATE_EMAIL",
            message: "A user with this email already exists.",
            details: {}
          }
        });
      }

      return handleServerError(res, "USER_CREATE_FAILED", "Failed to create user", err);
    }
  },

  /**
   * PUT /users/:id
   * Updates user details in MySQL.
   * Keeps old API behavior: firstName, lastName, userRole are required.
   */
  updateUser: async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user ID. Must be a number.",
            details: { field: "id" }
          }
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: {
            code: "NOT_FOUND",
            message: `User with ID ${id} not found`,
            details: {}
          }
        });
      }

      const { firstName, lastName, userRole, email, password } = req.body;

      if (!firstName || !lastName || !userRole) {
        const missing = [];
        if (!firstName) missing.push("firstName");
        if (!lastName) missing.push("lastName");
        if (!userRole) missing.push("userRole");

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

      if (!["admin", "manager", "user"].includes(userRole)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid userRole. Must be admin, manager, or user.",
            details: { field: "userRole" }
          }
        });
      }

      const updateData = {
        firstName,
        lastName,
        userRole,
        updateDate: new Date()
      };

      if (email) updateData.email = email;
      if (password) updateData.password = password;

      await user.update(updateData);

      return res.status(200).json({
        success: true,
        data: {
          userId: id
        },
        error: null
      });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "DUPLICATE_EMAIL",
            message: "A user with this email already exists.",
            details: {}
          }
        });
      }

      return handleServerError(res, "USER_UPDATE_FAILED", "Failed to update user", err);
    }
  },

  /**
   * DELETE /users/:id
   * Deletes a user from MySQL.
   * If the user owns tickets/transactions, MySQL may block deletion because of foreign keys.
   */
  deleteUser: async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user ID. Must be a number.",
            details: { field: "id" }
          }
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "User not found",
            details: {}
          }
        });
      }

      await user.destroy();

      return res.status(200).json({
        success: true,
        data: {
          userId: id
        },
        error: null
      });
    } catch (err) {
      if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "USER_HAS_RELATED_RECORDS",
            message: "Cannot delete this user because they are connected to tickets, transactions, favorites, or admin records.",
            details: {}
          }
        });
      }

      return handleServerError(res, "USER_DELETE_FAILED", "Failed to delete user", err);
    }
  }
};

module.exports = userController;