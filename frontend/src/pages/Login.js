import React, { useState } from 'react';
import { authAPI } from '../services/api';
import '../styles/Login.css';

function Login({ onLogin }) {
  // mode: 'login' (default) or 'register'. Toggling lets the same page handle
  // both the "Create a new user" and "Log in" demo steps.
  const [mode, setMode] = useState('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Map a backend user object into the shape the rest of the app expects.
  const normalizeUser = (user, token) => ({
    id: user.userId,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.userRole,
    token,
  });

  const switchMode = () => {
    setError('');
    setMode(isRegister ? 'login' : 'register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Shared validation (also enforced on the backend).
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (isRegister && (!firstName.trim() || !lastName.trim())) {
      setError('Please enter your first and last name');
      return;
    }

    setLoading(true);

    try {
      const res = isRegister
        ? await authAPI.register({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email,
            password,
          })
        : await authAPI.login(email, password);

      const { user, token } = res.data;
      onLogin(normalizeUser(user, token));
    } catch (err) {
      setError(
        err.message ||
          (isRegister ? 'Registration failed. Please try again.' : 'Login failed. Please try again.')
      );
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
          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  disabled={loading}
                />
              </div>
            </>
          )}

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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading
              ? isRegister
                ? 'Creating account...'
                : 'Logging in...'
              : isRegister
              ? 'Create account'
              : 'Login'}
          </button>

          <div className="login-switch">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button type="button" className="link-btn" onClick={switchMode} disabled={loading}>
                  Log in
                </button>
              </p>
            ) : (
              <p>
                New here?{' '}
                <button type="button" className="link-btn" onClick={switchMode} disabled={loading}>
                  Create an account
                </button>
              </p>
            )}
          </div>

          {!isRegister && (
            <div className="login-info">
              <p><strong>Demo Credentials</strong> (password for all: <code>password123</code>)</p>
              <table className="demo-creds">
                <tbody>
                  <tr><td>Admin</td><td>tomer@trustticket.com</td></tr>
                  <tr><td>Manager</td><td>amit@trustticket.com</td></tr>
                  <tr><td>User</td><td>shay@trustticket.com</td></tr>
                  <tr><td>User</td><td>noa@trustticket.com</td></tr>
                  <tr><td>User</td><td>dana@trustticket.com</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
