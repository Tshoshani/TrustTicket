const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user"
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  }
}, {
  tableName: "users",
  underscored: true
});

module.exports = User;