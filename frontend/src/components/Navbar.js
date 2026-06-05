import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar({ user, onLogout }) {
  const handleLogout = () => {
    onLogout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>🎫</span>
        <Link to="/dashboard">TrustTicket</Link>
      </div>

      <ul className="navbar-menu">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/settings">Settings</Link></li>
      </ul>

      <div className="navbar-user">
        <span className="user-info">
          {user?.name || 'User'} ({user?.role || 'user'})
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
