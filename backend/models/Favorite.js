const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Favorite = sequelize.define("Favorite", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: "user_id"
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: "ticket_id"
  }
}, {
  tableName: "favorites",
  underscored: true,
  updatedAt: false
});

module.exports = Favorite;