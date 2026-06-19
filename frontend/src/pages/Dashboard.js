import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { ticketsAPI, dashboardAPI, usersAPI } from '../services/api';
import '../styles/Dashboard.css';

// Event categories offered when listing a ticket.
const EVENT_TYPES = ['Concert', 'Party', 'Standup', 'Sports', 'Festival', 'Theater', 'Other'];

const emptyForm = {
  eventName: '',
  eventType: 'Concert',
  eventDate: '',
  venue: '',
  originalPrice: '',
  salePrice: '',
  barcode: '',
};

function Dashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [sellersById, setSellersById] = useState({});
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Search + filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Ticket upload modal
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Dashboard summary (best-effort - don't fail the whole page if it errors)
      try {
        const dashboardRes = await dashboardAPI.getByUserId(user?.id || 1);
        setDashboardData(dashboardRes.data);
      } catch (e) {
        // ignore - stats will fall back to computed values
      }

      const ticketsRes = await ticketsAPI.getAll();
      const list = ticketsRes.data || [];
      setTickets(list);
      await loadSellers(list);
    } catch (err) {
      setError(err.message || 'Failed to load marketplace data');
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the public profile (name + trust rating) of every unique seller.
  const loadSellers = async (list) => {
    const ids = [...new Set(list.map((t) => t.sellerId))];
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await usersAPI.getById(id);
          return res.data;
        } catch (e) {
          return null;
        }
      })
    );
    const map = {};
    results.forEach((u) => {
      if (u) map[u.userId] = u;
    });
    setSellersById(map);
  };

  // --- Workflow actions ---------------------------------------------------

  const runAction = async (fn, successMsg) => {
    setError('');
    setNotice('');
    try {
      await fn();
      setNotice(successMsg);
      await loadDashboardData();
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  const handleVerify = (ticket) =>
    runAction(() => ticketsAPI.verify(ticket.ticketId), 'AI verification passed — ticket is now listed.');

  const handleBuy = (ticket) =>
    runAction(async () => {
      const res = await ticketsAPI.purchase(ticket.ticketId);
      const f = res.data?.fees;
      if (f) {
        setNotice(
          `Purchased! Money held in escrow. You pay $${f.buyerPays} ` +
          `(price $${f.salePrice} + 2.5% fee $${f.buyerFee}).`
        );
      }
    }, 'Ticket reserved and released to you (held in escrow).');

  const handleRedeem = (ticket) =>
    runAction(async () => {
      const res = await ticketsAPI.redeem(ticket.ticketId);
      const f = res.data?.fees;
      if (f) {
        setNotice(
          `Barcode used — sale complete! Seller receives $${f.sellerReceives} ` +
          `(price $${f.salePrice} − 2.5% fee $${f.sellerFee}).`
        );
      }
    }, 'Sale completed.');

  // --- Ticket upload form -------------------------------------------------

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.eventName.trim() || !form.eventType || !form.eventDate || !form.barcode.trim() || !form.salePrice) {
      setFormError('Please fill in event name, type, date, barcode and sale price.');
      return;
    }
    if (Number(form.salePrice) <= 0) {
      setFormError('Sale price must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await ticketsAPI.create({
        eventName: form.eventName.trim(),
        eventType: form.eventType,
        eventDate: form.eventDate,
        venue: form.venue.trim() || null,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        salePrice: Number(form.salePrice),
        barcode: form.barcode.trim(),
        sellerId: user?.id,
      });
      setShowForm(false);
      setForm(emptyForm);
      setNotice('Ticket uploaded! It is pending verification — an admin will review and approve it before it goes live.');
      await loadDashboardData();
    } catch (err) {
      setFormError(err.message || 'Failed to upload ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Filtering ----------------------------------------------------------

  const applyFilters = (list) =>
    list.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        const inName = t.eventName && t.eventName.toLowerCase().includes(q);
        const inVenue = t.venue && t.venue.toLowerCase().includes(q);
        if (!inName && !inVenue) return false;
      }
      if (filterType && t.eventType !== filterType) return false;
      if (filterDate && t.eventDate !== filterDate) return false;
      if (minPrice !== '' && Number(t.salePrice) < Number(minPrice)) return false;
      if (maxPrice !== '' && Number(t.salePrice) > Number(maxPrice)) return false;
      return true;
    });

  const clearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterDate('');
    setMinPrice('');
    setMaxPrice('');
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  const eventTypes = [...new Set(tickets.map((t) => t.eventType))];
  const filteredTickets = applyFilters(tickets);

  // Stats (fall back to computed values if the dashboard endpoint was empty)
  const availableCount = tickets.filter((t) => t.status === 'available').length;
  const myListings = tickets.filter((t) => t.sellerId === user?.id).length;
  const myPurchases = tickets.filter((t) => t.buyerId === user?.id).length;
  const mySales = tickets.filter((t) => t.sellerId === user?.id && t.status === 'completed').length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.displayName || user?.name}!</h1>
        <p>Browse, list and trade tickets on the TrustTicket marketplace</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {notice && <div className="success-message">{notice}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Available Tickets</h3>
          <p className="stat-number">{availableCount}</p>
        </div>
        <div className="stat-card">
          <h3>Your Listings</h3>
          <p className="stat-number">{dashboardData?.activeListings?.length ?? myListings}</p>
        </div>
        <div className="stat-card">
          <h3>Your Purchases</h3>
          <p className="stat-number">{dashboardData?.purchaseHistory?.length ?? myPurchases}</p>
        </div>
        <div className="stat-card">
          <h3>Your Sales</h3>
          <p className="stat-number">{dashboardData?.salesHistory?.length ?? mySales}</p>
        </div>
      </div>

      <div className="dashboard-toolbar">
        <button className="btn-list-ticket" onClick={() => { setShowForm(true); setFormError(''); }}>
          + List a Ticket
        </button>
      </div>

      {/* Search + filters */}
      <div className="dashboard-controls">
        <div className="filter-row">
          <div className="filter-section">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Event name or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <label htmlFor="event-filter">Event Type</label>
            <select id="event-filter" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Events</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label htmlFor="date-filter">Date</label>
            <input
              id="date-filter"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <label htmlFor="min-price">Min Price ($)</label>
            <input
              id="min-price"
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <label htmlFor="max-price">Max Price ($)</label>
            <input
              id="max-price"
              type="number"
              min="0"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <label>&nbsp;</label>
            <button className="btn-clear-filters" onClick={clearFilters}>Clear</button>
          </div>
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
        <h2>Tickets ({filteredTickets.length})</h2>

        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets found. Try different filters or list a ticket of your own.</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="cards-grid">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.ticketId}
                ticket={ticket}
                seller={sellersById[ticket.sellerId]}
                currentUser={user}
                onView={setSelectedTicket}
                onVerify={handleVerify}
                onBuy={handleBuy}
                onRedeem={handleRedeem}
              />
            ))}
          </div>
        ) : (
          <Table tickets={filteredTickets} onRowClick={setSelectedTicket} />
        )}
      </div>

      {/* Ticket upload modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <h2>List a Ticket</h2>
            <p className="form-modal-sub">
              After uploading, your ticket is <strong>pending AI verification</strong>. Once it passes,
              it becomes available for buyers.
            </p>
            <form onSubmit={handleFormSubmit} className="ticket-form">
              <div className="form-group">
                <label htmlFor="eventName">Event Name *</label>
                <input id="eventName" name="eventName" value={form.eventName} onChange={handleFormChange} placeholder="e.g. Omer Adam Live" />
              </div>
              <div className="form-group">
                <label htmlFor="eventType">Event Type *</label>
                <select id="eventType" name="eventType" value={form.eventType} onChange={handleFormChange}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="eventDate">Event Date *</label>
                <input id="eventDate" name="eventDate" type="date" value={form.eventDate} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label htmlFor="venue">Venue</label>
                <input id="venue" name="venue" value={form.venue} onChange={handleFormChange} placeholder="e.g. Bloomfield Stadium" />
              </div>
              <div className="form-group">
                <label htmlFor="originalPrice">Original Price ($)</label>
                <input id="originalPrice" name="originalPrice" type="number" min="0" value={form.originalPrice} onChange={handleFormChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label htmlFor="salePrice">Sale Price ($) *</label>
                <input id="salePrice" name="salePrice" type="number" min="0" value={form.salePrice} onChange={handleFormChange} placeholder="e.g. 250" />
              </div>
              <div className="form-group">
                <label htmlFor="barcode">Barcode *</label>
                <input id="barcode" name="barcode" value={form.barcode} onChange={handleFormChange} placeholder="Ticket barcode string" />
              </div>

              {formError && <div className="error-message">{formError}</div>}

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Uploading...' : 'Upload Ticket'}
                </button>
                <button type="button" className="btn-reset" onClick={() => setShowForm(false)} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket details modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTicket(null)}>✕</button>
            <h2>{selectedTicket.eventName}</h2>
            <div className="modal-details">
              <p><strong>Event Type:</strong> {selectedTicket.eventType}</p>
              <p><strong>Venue:</strong> {selectedTicket.venue}</p>
              <p><strong>Date:</strong> {new Date(selectedTicket.eventDate).toLocaleDateString()}</p>
              <p><strong>Original Price:</strong> ${selectedTicket.originalPrice}</p>
              <p><strong>Sale Price:</strong> ${selectedTicket.salePrice}</p>
              <p><strong>Barcode:</strong> {selectedTicket.barcode}</p>
              <p><strong>Status:</strong> {selectedTicket.status}</p>
              <p><strong>AI Verified:</strong> {selectedTicket.verified ? 'Yes' : 'No'}</p>
              <p>
                <strong>Seller:</strong>{' '}
                {sellersById[selectedTicket.sellerId]
                  ? `${sellersById[selectedTicket.sellerId].firstName} ${sellersById[selectedTicket.sellerId].lastName}`
                  : `#${selectedTicket.sellerId}`}
                {sellersById[selectedTicket.sellerId] && typeof sellersById[selectedTicket.sellerId].trustRating === 'number' && (
                  <> — ⭐ {sellersById[selectedTicket.sellerId].trustRating.toFixed(1)}/5.0
                    {sellersById[selectedTicket.sellerId].verifiedSeller ? ' (Verified)' : ''}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
