const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Admin = sequelize.define("Admin", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: "user_id"
  },
  permissions: {
    type: DataTypes.STRING,
    defaultValue: "manage_users,manage_tickets"
  }
}, {
  tableName: "admins",
  underscored: true
});

module.exports = Admin;