const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Admin = sequelize.define("Admin", {
  adminId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "admin_id"
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: "user_id"
  },
  permissions: {
    type: DataTypes.STRING,
    defaultValue: "manage_users,manage_tickets,manage_transactions"
  },
  createDate: {
    type: DataTypes.DATE,
    field: "create_date"
  },
  updateDate: {
    type: DataTypes.DATE,
    field: "update_date"
  }
}, {
  tableName: "admins",
  timestamps: false
});

module.exports = Admin;