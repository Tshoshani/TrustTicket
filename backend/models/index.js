const sequelize = require("../src/config/database");

const User = require("./User");
const Admin = require("./Admin");
const Ticket = require("./Ticket");
const Transaction = require("./Transaction");
const Favorite = require("./Favorite");

// User - Admin: one-to-one
User.hasOne(Admin, {
  foreignKey: "userId",
  as: "adminProfile"
});

Admin.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

// User - Ticket: one-to-many seller relationship
User.hasMany(Ticket, {
  foreignKey: "sellerId",
  as: "sellingTickets"
});

Ticket.belongsTo(User, {
  foreignKey: "sellerId",
  as: "seller"
});

// User - Ticket: buyer relationship
User.hasMany(Ticket, {
  foreignKey: "buyerId",
  as: "boughtTickets"
});

Ticket.belongsTo(User, {
  foreignKey: "buyerId",
  as: "buyer"
});

// User - Ticket: many-to-many favorites
User.belongsToMany(Ticket, {
  through: Favorite,
  foreignKey: "userId",
  otherKey: "ticketId",
  as: "favoriteTickets"
});

Ticket.belongsToMany(User, {
  through: Favorite,
  foreignKey: "ticketId",
  otherKey: "userId",
  as: "favoritedByUsers"
});

// Ticket - Transaction
Ticket.hasOne(Transaction, {
  foreignKey: "ticketId",
  as: "transaction"
});

Transaction.belongsTo(Ticket, {
  foreignKey: "ticketId",
  as: "ticket"
});

User.hasMany(Transaction, {
  foreignKey: "buyerId",
  as: "buyerTransactions"
});

User.hasMany(Transaction, {
  foreignKey: "sellerId",
  as: "sellerTransactions"
});

Transaction.belongsTo(User, {
  foreignKey: "buyerId",
  as: "buyer"
});

Transaction.belongsTo(User, {
  foreignKey: "sellerId",
  as: "seller"
});

module.exports = {
  sequelize,
  User,
  Admin,
  Ticket,
  Transaction,
  Favorite
};