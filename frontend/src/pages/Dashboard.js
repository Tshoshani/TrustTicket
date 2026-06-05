import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { ticketsAPI, dashboardAPI } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard data
      const dashboardRes = await dashboardAPI.getByUserId(user?.id || 1);
      setDashboardData(dashboardRes.data);

      // Fetch all tickets
      const ticketsRes = await ticketsAPI.getAll();
      if (ticketsRes.data) {
        setTickets(ticketsRes.data);
        setFilteredTickets(ticketsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const type = e.target.value;
    setFilterType(type);

    if (type === '') {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(
        tickets.filter((ticket) => ticket.eventType === type)
      );
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  const eventTypes = [...new Set(tickets.map((t) => t.eventType))];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Browse and manage tickets on TrustTicket marketplace</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Listings</h3>
          <p className="stat-number">{dashboardData?.activeListings?.length || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Available Tickets</h3>
          <p className="stat-number">
            {tickets.filter((t) => t.status === 'available').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Your Purchases</h3>
          <p className="stat-number">{dashboardData?.purchaseHistory?.length || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Your Sales</h3>
          <p className="stat-number">{dashboardData?.salesHistory?.length || 0}</p>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="filter-section">
          <label htmlFor="event-filter">Filter by Event Type:</label>
          <select
            id="event-filter"
            value={filterType}
            onChange={handleFilterChange}
          >
            <option value="">All Events</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            📇 Cards View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📊 Table View
          </button>
        </div>
      </div>

      <div className="tickets-section">
        <h2>Available Tickets ({filteredTickets.length})</h2>

        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets found. Try different filters.</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="cards-grid">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.ticketId}
                ticket={ticket}
                onAction={handleTicketClick}
              />
            ))}
          </div>
        ) : (
          <Table tickets={filteredTickets} onRowClick={handleTicketClick} />
        )}
      </div>

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setSelectedTicket(null)}>
              ✕
            </button>
            <h2>{selectedTicket.eventName}</h2>
            <div className="modal-details">
              <p>
                <strong>Event Type:</strong> {selectedTicket.eventType}
              </p>
              <p>
                <strong>Venue:</strong> {selectedTicket.venue}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(selectedTicket.eventDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Original Price:</strong> ${selectedTicket.originalPrice}
              </p>
              <p>
                <strong>Sale Price:</strong> ${selectedTicket.salePrice}
              </p>
              <p>
                <strong>Barcode:</strong> {selectedTicket.barcode}
              </p>
              <p>
                <strong>Status:</strong> {selectedTicket.status}
              </p>
              <p>
                <strong>Seller ID:</strong> {selectedTicket.sellerId}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
