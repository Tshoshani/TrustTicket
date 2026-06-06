import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { applyTheme } from '../utils/theme';
import '../styles/Settings.css';

function Settings({ user, onUserUpdate }) {
  const [settings, setSettings] = useState({
    displayName: '',
    username: '',
    phone: '',
    theme: 'light',
    notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await settingsAPI.get();
      const data = res.data || {};
      // Fall back to the logged-in user's name if nothing is saved yet.
      setSettings({
        displayName: data.displayName || user?.name || '',
        username: data.username || user?.name || '',
        phone: data.phone || '',
        theme: data.theme || 'light',
        notifications: data.notifications !== undefined ? data.notifications : true,
      });
      setFieldErrors({});
      setSuccess('');
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Client-side validation. Returns an object of field -> error message.
  const validate = (data) => {
    const errors = {};
    if (!data.displayName || data.displayName.trim().length < 2) {
      errors.displayName = 'Display name is required (at least 2 characters)';
    }
    if (!data.username || data.username.trim().length < 2) {
      errors.username = 'Username is required (at least 2 characters)';
    }
    if (data.phone && data.phone.trim() !== '') {
      const digitCount = (data.phone.match(/\d/g) || []).length;
      if (!/^[0-9+\-\s()]+$/.test(data.phone.trim()) || digitCount < 7 || digitCount > 15) {
        errors.phone = 'Phone must contain 7-15 digits';
      }
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSuccess('');
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate fields before sending to the backend.
    const errors = validate(settings);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        displayName: settings.displayName.trim(),
        username: settings.username.trim(),
        phone: settings.phone.trim(),
        theme: settings.theme,
        language: 'en', // The UI is English-only.
        notifications: settings.notifications,
      };
      const res = await settingsAPI.update(payload);
      const saved = res.data || payload;

      setSettings((prev) => ({ ...prev, ...saved }));

      // Apply the theme app-wide right away.
      applyTheme(saved.theme);

      // Let the rest of the app (navbar, dashboard) pick up the new display name.
      if (onUserUpdate) {
        onUserUpdate({ displayName: saved.displayName });
      }

      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your TrustTicket preferences</p>
      </div>

      <div className="settings-container">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <h2>Appearance</h2>

            <div className="form-group">
              <label htmlFor="theme">Theme Preference</label>
              <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
              <small>Choose how the interface appears (applied when you save)</small>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                value="English"
                disabled
                className="disabled-input"
              />
              <small>The interface is available in English only</small>
            </div>
          </div>

          <div className="settings-section">
            <h2>Notifications</h2>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
              />
              <label htmlFor="notifications">
                Enable email notifications
              </label>
              <small>Receive updates about your listings and purchases</small>
            </div>
          </div>

          <div className="settings-section">
            <h2>Account Information</h2>

            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={settings.displayName}
                onChange={handleChange}
                placeholder="How your name appears (min 2 characters)"
              />
              {fieldErrors.displayName && (
                <span className="field-error">{fieldErrors.displayName}</span>
              )}
              <small>This name is shown across the marketplace</small>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={settings.username}
                onChange={handleChange}
                placeholder="Your account username (min 2 characters)"
              />
              {fieldErrors.username && (
                <span className="field-error">{fieldErrors.username}</span>
              )}
              <small>Your account username</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="Optional (e.g. +972 50-123-4567)"
              />
              {fieldErrors.phone && (
                <span className="field-error">{fieldErrors.phone}</span>
              )}
              <small>Optional contact number</small>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="disabled-input"
              />
              <small>Your registered email address (cannot be changed)</small>
            </div>

            <div className="form-group">
              <label>User Role</label>
              <input
                type="text"
                value={user?.role || 'user'}
                disabled
                className="disabled-input"
              />
              <small>Your account role/permissions</small>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={loadSettings}
              disabled={saving}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="settings-info">
          <h3>About TrustTicket</h3>
          <p>
            TrustTicket is a secure marketplace for ticket resale. Our mission is to
            provide a safe, transparent, and trustworthy platform for buying and
            selling event tickets.
          </p>
          <h4>Key Features:</h4>
          <ul>
            <li>Secure Escrow System - Money held safely until transaction completion</li>
            <li>AI-Powered Verification - Ticket authenticity verification</li>
            <li>Trust Ratings - Buyer and seller ratings for transparency</li>
            <li>Dynamic Pricing - AI recommendations for optimal ticket pricing</li>
            <li>Transaction Protection - 5% platform fee ensures quality service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Settings;
