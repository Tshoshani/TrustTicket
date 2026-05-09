// controllers/userController.js
let users = require('../models/users'); 

const userController = {
  getAllUsers: (req, res) => {
    res.status(200).json({ success: true, data: users, error: null });
  },

  getUserById: (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.userId === id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: "NOT_FOUND", message: `User with ID ${id} not found`, details: {} }
      });
    }
    res.status(200).json({ success: true, data: user, error: null });
  },

  createUser: (req, res) => {
    const { firstName, lastName, userRole } = req.body;

    if (!firstName || !lastName || !userRole) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Missing required fields", details: { required: ["firstName", "lastName", "userRole"] } }
      });
    }

    const newUser = {
      userId: users.length + 1,
      firstName,
      lastName,
      userRole,
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString()
    };

    users.push(newUser);
    res.status(201).json({ success: true, data: { userId: newUser.userId }, error: null });
  },

  deleteUser: (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.userId === id);
    if (index === -1) {
      return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "User not found", details: {} } });
    }
    users.splice(index, 1);
    res.status(200).json({ success: true, data: { userId: id }, error: null });
  }
};

module.exports = userController;