const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Ticket = sequelize.define("Ticket", {
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
    type: DataTypes.DATE,
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
  status: {
    type: DataTypes.ENUM("available", "reserved", "sold", "redeemed"),
    defaultValue: "available"
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "seller_id"
  },
  buyerId: {
    type: DataTypes.INTEGER,
    field: "buyer_id"
  }
}, {
  tableName: "tickets",
  underscored: true
});

module.exports = Ticket;