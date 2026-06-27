import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import LiveUpdates from './pages/LiveUpdates';
import AIAdvisor from './pages/AIAdvisor';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// API services
import { usersAPI, authAPI, settingsAPI } from './services/api';
import { applyTheme } from './utils/theme';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore the session from localStorage, then refresh the user info from
    // the backend (GET /users/me) so the navbar shows live data.
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setLoading(false);
      return;
    }

    const stored = JSON.parse(storedUser);
    setUser(stored);
    setIsAuthenticated(true);

    usersAPI.getMe()
      .then((res) => {
        const me = res.data;
        const refreshed = {
          ...stored,
          id: me.userId,
          name: `${me.firstName} ${me.lastName}`,
          email: me.email,
          role: me.userRole,
        };
        setUser(refreshed);
        localStorage.setItem('user', JSON.stringify(refreshed));

        // Load the user's settings so the navbar/dashboard show the saved
        // display name and the saved theme is applied across the app.
        return settingsAPI.get()
          .then((sres) => {
            const s = sres.data || {};
            if (s.theme) applyTheme(s.theme);
            const withSettings = {
              ...refreshed,
              displayName: s.displayName || refreshed.name,
            };
            setUser(withSettings);
            localStorage.setItem('user', JSON.stringify(withSettings));
          })
          .catch(() => { /* settings are optional; ignore failures */ });
      })
      .catch(() => {
        // Session is no longer valid on the backend - log out.
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  // Called by the Settings page after a successful save so the navbar/dashboard
  // immediately reflect changes (e.g. a new display name).
  const handleUserUpdate = (updates) => {
    setUser((prev) => {
      const merged = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout(); // POST /auth/logout
    } catch (err) {
      // Ignore network errors on logout - we clear the local session regardless.
      console.error('Logout error:', err);
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/settings"
              element={isAuthenticated ? <Settings user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/live"
              element={isAuthenticated ? <LiveUpdates user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/ai"
              element={isAuthenticated ? <AIAdvisor /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin"
              element={
                isAuthenticated
                  ? (user?.role === 'admin' || user?.role === 'manager'
                      ? <Admin user={user} />
                      : <Navigate to="/dashboard" />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>

        {isAuthenticated && <Footer />}
      </div>
    </Router>
  );
}

export default App;
