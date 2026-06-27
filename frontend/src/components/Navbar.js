import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar({ user, onLogout }) {
  const isStaff = user?.role === 'admin' || user?.role === 'manager';

  const handleLogout = async () => {
    // Wait for the logout (clears the session) before the app redirects.
    // Once the session is cleared, App's protected routes redirect to /login.
    await onLogout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>🎫</span>
        <Link to="/dashboard">TrustTicket</Link>
      </div>

      <ul className="navbar-menu">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/live">Live</Link></li>
        <li><Link to="/ai">AI Advisor</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        {isStaff && <li><Link to="/admin">Admin</Link></li>}
        <li><Link to="/settings">Settings</Link></li>
      </ul>

      <div className="navbar-user">
        <span className="user-info">
          {user?.displayName || user?.name || 'User'} ({user?.role || 'user'})
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
