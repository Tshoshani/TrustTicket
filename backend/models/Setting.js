const { DataTypes } = require("sequelize");
const sequelize = require("../src/config/database");

const Setting = sequelize.define("Setting", {
  settingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "setting_id"
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: "user_id"
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
    field: "display_name"
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ""
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  theme: {
    type: DataTypes.ENUM("light", "dark", "auto"),
    defaultValue: "light"
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: "en"
  },
  notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: "settings",
  timestamps: false
});

module.exports = Setting;