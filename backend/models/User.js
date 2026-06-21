const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const User = sequelize.define("User", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "user_id"
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "first_name"
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "last_name"
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userRole: {
    type: DataTypes.ENUM("admin", "manager", "user"),
    defaultValue: "user",
    field: "user_role"
  },
  trustRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    field: "trust_rating"
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: "rating_count"
  },
  successfulDeals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: "successful_deals"
  },
  verifiedSeller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: "verified_seller"
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
  tableName: "users",
  timestamps: false
});

module.exports = User;