const sequelize = require("../src/config/database");

const User = require("./User");
const Admin = require("./Admin");
const Ticket = require("./Ticket");
const Transaction = require("./Transaction");
const Favorite = require("./Favorite");
const Setting = require("./Setting");
const Review = require("./Review");

// User - Admin: one-to-one
User.hasOne(Admin, {
  foreignKey: "userId",
  as: "adminProfile"
});

Admin.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

// User - Tickets: one-to-many seller relationship
User.hasMany(Ticket, {
  foreignKey: "sellerId",
  as: "sellingTickets"
});

Ticket.belongsTo(User, {
  foreignKey: "sellerId",
  as: "seller"
});

// User - Tickets: buyer relationship
User.hasMany(Ticket, {
  foreignKey: "buyerId",
  as: "boughtTickets"
});

Ticket.belongsTo(User, {
  foreignKey: "buyerId",
  as: "buyer"
});

// User - Ticket: many-to-many through favorites
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

// User - Transactions
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

// User - Setting: one-to-one
User.hasOne(Setting, {
  foreignKey: "userId",
  as: "settings"
});

Setting.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

// User - Review: one-to-many (a user receives many reviews)
User.hasMany(Review, {
  foreignKey: "userId",
  as: "reviews"
});

Review.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

module.exports = {
  sequelize,
  User,
  Admin,
  Ticket,
  Transaction,
  Favorite,
  Setting,
  Review
};