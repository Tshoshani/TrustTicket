/**
 * models/settings.js - Per-user settings storage with disk persistence.
 *
 * Settings are keyed by userId. Unlike the other mock models (which reset on
 * restart), settings are persisted to a small JSON file on disk so that a user's
 * saved display name, username, phone, theme, etc. survive a server restart.
 *
 * The data file lives at backend/data/settings.json and is created on first save.
 *
 * Setting fields:
 *   displayName   - string (editable, min 2 characters) - public name shown across the app
 *   username      - string (editable, min 2 characters) - account username
 *   phone         - string (editable, optional) - contact phone number
 *   theme         - "light" | "dark" | "auto"
 *   language      - "en" (fixed - the UI is English-only)
 *   notifications - boolean (email notifications on/off)
 */

const fs = require('fs');
const path = require('path');

// Where the settings are persisted on disk.
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'settings.json');

const getDefaultSettings = () => ({
  displayName: "",
  username: "",
  phone: "",
  theme: "light",
  language: "en", // Language is fixed to English (the UI is English-only).
  notifications: true
});

// Load any previously-saved settings from disk into memory on startup.
// If the file is missing or unreadable we just start with an empty map.
const loadFromDisk = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    return {};
  }
};

// Map of userId -> settings object (seeded from disk so saves persist across restarts).
const settingsByUser = loadFromDisk();

// Write the current in-memory settings back to disk. Called after every save.
const saveToDisk = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(settingsByUser, null, 2), 'utf8');
  } catch (err) {
    // Persistence is best-effort; log but don't crash the request.
    console.error('Failed to persist settings to disk:', err.message);
  }
};

module.exports = { settingsByUser, getDefaultSettings, saveToDisk };
