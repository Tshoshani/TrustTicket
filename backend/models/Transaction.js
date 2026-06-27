const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Transaction = sequelize.define("Transaction", {
  transactionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "transaction_id"
  },
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
  status: {
    type: DataTypes.ENUM("escrow_pending", "ticket_released", "completed", "cancelled"),
    defaultValue: "escrow_pending"
  },
  ticketReleased: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: "ticket_released"
  },
  buyerFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: "buyer_fee",
    get() {
        const value = this.getDataValue("buyerFee");
        return value === null ? 0 : Number(value);
    }
  },
  sellerFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: "seller_fee",
    get() {
        const value = this.getDataValue("sellerFee");
        return value === null ? 0 : Number(value);
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: "total_price",
    get() {
        const value = this.getDataValue("totalPrice");
        return value === null ? 0 : Number(value);
    }
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
  tableName: "transactions",
  timestamps: false
});

module.exports = Transaction;