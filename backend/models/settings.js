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
 *   phone         - string (editable, optional) - contact phone num