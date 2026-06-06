/**
 * controllers/settingsController.js - Business logic for the Settings endpoints.
 *
 * Settings belong to the logged-in user, identified by the "x-user-id" header
 * that the frontend sets after login. Data is stored in-memory (see models/settings.js).
 *
 * All responses follow the standard format: { success, data, error }.
 */

const { settingsByUser, getDefaultSettings, saveToDisk } = require('../models/settings');

// Allowed values for validation
const VALID_THEMES = ["light", "dark", "auto"];

// Read and validate the x-user-id header. Returns the numeric id, or null if invalid.
const getUserId = (req) => {
  const id = parseInt(req.headers['x-user-id']);
  return isNaN(id) ? null : id;
};

const settingsController = {

  /**
   * GET /settings
   * Returns the current user's settings, or the defaults if none are saved yet.
   */
  getSettings: (req, res) => {
    const userId = getUserId(req);
    if (userId === null) {
      return res.status(401).json({
        success: false, data: null,
        error: { code: "UNAUTHORIZED", message: "Not authenticated. Missing or invalid x-user-id header.", details: {} }
      });
    }

    const settings = settingsByUser[userId] || getDefaultSettings();
    res.status(200).json({ success: true, data: settings, error: null });
  },

  /**
   * PUT /settings
   * Body: { displayName, username, phone, theme, notifications }
   * Validates the values and saves them for the current user.
   * Note: language is always stored as "en" (the UI is English-only).
   */
  updateSettings: (req, res) => {
    const userId = getUserId(req);
    if (userId === null) {
      return res.status(401).json({
        success: false, data: null,
        error: { code: "UNAUTHORIZED", message: "Not authenticated. Missing or invalid x-user-id header.", details: {} }
      });
    }

    const { displayName, username, phone, theme, notifications } = req.body;

    // Validate that all required fields are present (phone is optional)
    const missing = [];
    if (displayName === undefined) missing.push("displayName");
    if (username === undefined) missing.push("username");
    if (theme === undefined) missing.push("theme");
    if (notifications === undefined) missing.push("notifications");
    if (missing.length > 0) {
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: `Missing required field(s): ${missing.join(", ")}`, details: { missing } }
      });
    }

    // Validate the display name: must be a non-empty string of at least 2 characters
    if (typeof displayName !== "string" || displayName.trim().length < 2) {
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: "Display name must be at least 2 characters.", details: { field: "displayName" } }
      });
    }

    // Validate the username: must be a non-empty string of at least 2 characters
    if (typeof username !== "string" || username.trim().length < 2) {
      return res.status(400).json({
        success: false, data: null,
        error: { code: "VALIDATION_ERROR", message: "Username must be at least 2 characters.", details: { field: "username" } }
      });
    }

    // Validate the phone (optional). If provided, allow digits, spaces, +, -, () and require 7-15 digits.
    let cleanPhone = "";
    if (phone !== undefined && phone !