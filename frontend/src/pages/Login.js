import React, { useState } from 'react';
import { authAPI } from '../services/api';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Call the real backend: POST /auth/login
      const res = await authAPI.login(email, password);
      const { user, token } = res.data;

      // Normalize the backend user shape into the shape the app/components use.
      const userData = {
        id: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.userRole,
        token,
      };

      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🎫 TrustTicket</h1>
          <p>Secure Ticket Resale Marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="login-info">
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: tomer@trustticket.com</p>
            <p>User: shay@trustticket.com</p>
            <p>Password: password123</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
