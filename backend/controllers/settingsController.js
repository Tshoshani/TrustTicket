/**
 * controllers/settingsController.js
 * Settings controller using MySQL + Sequelize ORM.
 *
 * Settings belong to the logged-in user, identified by the "x-user-id" header.
 * All responses follow the standard format: { success, data, error }.
 */

const { User, Setting } = require('../models');

const VALID_THEMES = ["light", "dark", "auto"];

const getUserId = (req) => {
  const id = parseInt(req.headers['x-user-id']);
  return isNaN(id) ? null : id;
};

const getDefaultSettings = () => ({
  displayName: "",
  username: "",
  phone: "",
  theme: "light",
  language: "en",
  notifications: true
});

function handleServerError(res, code, message, err) {
  return res.status(500).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details: {
        reason: err.message
      }
    }
  });
}

function toPublicSettings(settingInstance) {
  if (!settingInstance) {
    return getDefaultSettings();
  }

  const setting = settingInstance.toJSON ? settingInstance.toJSON() : settingInstance;

  return {
    displayName: setting.displayName || "",
    username: setting.username || "",
    phone: setting.phone || "",
    theme: setting.theme || "light",
    language: "en",
    notifications: Boolean(setting.notifications)
  };
}

const settingsController = {

  /**
   * GET /settings
   * Returns the current user's settings from MySQL.
   * If no settings row exists, creates default settings for that user.
   */
  getSettings: async (req, res) => {
    try {
      const userId = getUserId(req);

      if (userId === null) {
        return res.status(401).json({
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Not authenticated. Missing or invalid x-user-id header.",
            details: {}
          }
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: {
            code: "USER_NOT_FOUND",
            message: `User with ID ${userId} not found`,
            details: { userId }
          }
        });
      }

      let settings = await Setting.findOne({
        where: { userId }
      });

      if (!settings) {
        settings = await Setting.create({
          userId,
          displayName: `${user.firstName} ${user.lastName}`,
          username: `${user.firstName}_${user.lastName}`.toLowerCase(),
          phone: "",
          theme: "light",
          language: "en",
          notifications: true,
          createDate: new Date(),
          updateDate: new Date()
        });
      }

      return res.status(200).json({
        success: true,
        data: toPublicSettings(settings),
        error: null
      });
    } catch (err) {
      return handleServerError(res, "SETTINGS_FETCH_FAILED", "Failed to load settings", err);
    }
  },

  /**
   * PUT /settings
   * Body: { displayName, username, phone, theme, notifications }
   */
  updateSettings: async (req, res) => {
    try {
      const userId = getUserId(req);

      if (userId === null) {
        return res.status(401).json({
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Not authenticated. Missing or invalid x-user-id header.",
            details: {}
          }
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: {
            code: "USER_NOT_FOUND",
            message: `User with ID ${userId} not found`,
            details: { userId }
          }
        });
      }

      const { displayName, username, phone, theme, notifications } = req.body || {};

      const missing = [];
      if (displayName === undefined) missing.push("displayName");
      if (username === undefined) missing.push("username");
      if (theme === undefined) missing.push("theme");
      if (notifications === undefined) missing.push("notifications");

      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: `Missing required field(s): ${missing.join(", ")}`,
            details: { missing }
          }
        });
      }

      if (typeof displayName !== "string" || displayName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Display name must be at least 2 characters.",
            details: { field: "displayName" }
          }
        });
      }

      if (typeof username !== "string" || username.trim().length < 2) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Username must be at least 2 characters.",
            details: { field: "username" }
          }
        });
      }

      let cleanPhone = "";

      if (phone !== undefined && phone !== null && String(phone).trim() !== "") {
        cleanPhone = String(phone).trim();
        const digitCount = (cleanPhone.match(/\d/g) || []).length;

        if (!/^[0-9+\-\s()]+$/.test(cleanPhone) || digitCount < 7 || digitCount > 15) {
          return res.status(400).json({
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "Phone must contain 7-15 digits (digits, spaces, +, -, () allowed).",
              details: { field: "phone" }
            }
          });
        }
      }

      if (!VALID_THEMES.includes(theme)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid theme. Must be one of: ${VALID_THEMES.join(", ")}`,
            details: { field: "theme" }
          }
        });
      }

      if (typeof notifications !== "boolean") {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid notifications. Must be a boolean.",
            details: { field: "notifications" }
          }
        });
      }

      let settings = await Setting.findOne({
        where: { userId }
      });

      if (!settings) {
        settings = await Setting.create({
          userId,
          displayName: displayName.trim(),
          username: username.trim(),
          phone: cleanPhone,
          theme,
          language: "en",
          notifications,
          createDate: new Date(),
          updateDate: new Date()
        });
      } else {
        await settings.update({
          displayName: displayName.trim(),
          username: username.trim(),
          phone: cleanPhone,
          theme,
          language: "en",
          notifications,
          updateDate: new Date()
        });
      }

      const updatedSettings = await Setting.findOne({
        where: { userId }
      });

      return res.status(200).json({
        success: true,
        data: toPublicSettings(updatedSettings),
        error: null
      });
    } catch (err) {
      return handleServerError(res, "SETTINGS_UPDATE_FAILED", "Failed to update settings", err);
    }
  }
};

module.exports = settingsController;