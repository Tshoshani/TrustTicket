const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

/**
 * Review - a rating + comment left for a user (seller) by a buyer.
 * One-to-many: a User has many Reviews (User.hasMany(Review)).
 */
const Review = sequelize.define("Review", {
  reviewId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "review_id"
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "user_id" // the reviewed (seller) user
  },
  reviewerName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "reviewer_name"
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    get() {
      const value = this.getDataValue("rating");
      return value === null ? 0 : Number(value);
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createDate: {
    type: DataTypes.DATE,
    field: "create_date"
  }
}, {
  tableName: "reviews",
  timestamps: false
});

module.exports = Review;
