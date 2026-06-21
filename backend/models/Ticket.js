const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Ticket = sequelize.define("Ticket", {
  ticketId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "ticket_id"
  },
  eventName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "event_name"
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "event_type"
  },
  eventDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "event_date"
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  barcode: {
    type: DataTypes.STRING,
    unique: true
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: "original_price"
  },
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: "sale_price"
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "seller_id"
  },
  status: {
    type: DataTypes.ENUM("pending", "available", "reserved", "completed", "redeemed"),
    defaultValue: "pending"
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  buyerId: {
    type: DataTypes.INTEGER,
    field: "buyer_id"
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
  tableName: "tickets",
  timestamps: false
});

module.exports = Ticket;