const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Transaction = sequelize.define("Transaction", {
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "ticket_id"
  },
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "buyer_id"
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "seller_id"
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "cancelled"),
    defaultValue: "pending"
  }
}, {
  tableName: "transactions",
  underscored: true
});

module.exports = Transaction;