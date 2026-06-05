import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import '../styles/Settings.css';

function Settings({ user }) {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.get();
      setSettings(res.data);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await settingsAPI.update(settings);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
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
              <small>Choose how the interface appears</small>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="he">Hebrew (עברית)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
              <small>Select your preferred language</small>
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
              <label>Username</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="disabled-input"
              />
              <small>Your account username (cannot be changed)</small>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="disabled-input"
              />
              <small>Your registered email address</small>
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
