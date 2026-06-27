import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import UserProfileModal from '../components/UserProfileModal';
import { ticketsAPI, usersAPI, aiAPI } from '../services/api';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Search + filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [scope, setScope] = useState('market'); // market | pending | mine | purchased | history
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null); // seller profile modal

  // Ticket upload modal
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI price recommendation (inside the "List a Ticket" form)
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

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
          `Purchased! Money held in escrow. You pay ₪${f.buyerPays} ` +
          `(price ₪${f.salePrice} + 2.5% fee ₪${f.buyerFee}).`
        );
      }
    }, 'Ticket reserved and released to you (held in escrow).');

  const handleRedeem = (ticket) =>
    runAction(async () => {
      const res = await ticketsAPI.redeem(ticket.ticketId);
      const f = res.data?.fees;
      if (f) {
        setNotice(
          `Barcode used — sale complete! Seller receives ₪${f.sellerReceives} ` +
          `(price ₪${f.salePrice} − 2.5% fee ₪${f.sellerFee}).`
        );
      }
    }, 'Sale completed.');

  // Permanently remove a listing (DELETE DB call). Allowed for the ticket's own
  // seller or for admin/manager. Closes the details modal on success.
  const handleDelete = (ticket) => {
    if (!window.confirm(`Delete the listing "${ticket.eventName}"? This cannot be undone.`)) {
      return;
    }
    setSelectedTicket(null);
    return runAction(
      () => ticketsAPI.delete(ticket.ticketId),
      'Ticket listing deleted.'
    );
  };

  // Whether the current user is allowed to delete a given ticket.
  const canDelete = (ticket) =>
    user?.role === 'admin' ||
    user?.role === 'manager' ||
    ticket.sellerId === user?.id;

  // --- Ticket upload form -------------------------------------------------

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Ask the AI for a recommended sale price based on the event + original price.
  // The seller can then choose whether to apply it.
  const handleGetAiPrice = async () => {
    setAiError('');
    setAiSuggestion(null);

    if (!form.originalPrice || Number(form.originalPrice) <= 0) {
      setAiError('Enter the original price first so the AI can suggest a fair price.');
      return;
    }

    setAiLoading(true);
    try {
      const res = await aiAPI.getTicketAdvice({
        eventType: form.eventType,
        originalPrice: Number(form.originalPrice),
        eventDate: form.eventDate || undefined,
        // Include the seller's current asking price only if they already typed one.
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      });
      setAiSuggestion(res.data);
    } catch (err) {
      setAiError(err.message || 'Failed to get an AI price recommendation.');
    } finally {
      setAiLoading(false);
    }
  };

  // Apply the AI's recommended price into the Sale Price field.
  const applyAiPrice = () => {
    if (aiSuggestion?.recommendedPrice) {
      setForm((prev) => ({ ...prev, salePrice: String(aiSuggestion.recommendedPrice) }));
    }
  };

  // Reset AI state whenever the form is opened or closed.
  const openForm = () => {
    setShowForm(true);
    setFormError('');
    setAiSuggestion(null);
    setAiError('');
  };
  const closeForm = () => {
    setShowForm(false);
    setAiSuggestion(null);
    setAiError('');
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

  const isStaff = user?.role === 'admin' || user?.role === 'manager';
  const isMine = (t) => t.sellerId === user?.id;
  const isMyBuy = (t) => t.buyerId === user?.id;

  // Each tab shows the tickets relevant to a stage of the ticket lifecycle:
  //   market    -> available to buy
  //   pending   -> awaiting admin approval (staff see all, sellers see their own)
  //   mine      -> tickets I'm selling
  //   purchased -> tickets I bought that I haven't used yet
  //   history   -> completed/used tickets I was part of (bought or sold)
  const scopeFilter = (t) => {
    switch (scope) {
      case 'pending':   return t.status === 'pending' && (isStaff || isMine(t));
      case 'mine':      return isMine(t);
      case 'purchased': return isMyBuy(t) && t.status === 'reserved';
      case 'history':   return t.status === 'completed' && (isMyBuy(t) || isMine(t));
      case 'market':
      default:          return t.status === 'available';
    }
  };
  const scopedTickets = tickets.filter(scopeFilter);
  const filteredTickets = applyFilters(scopedTickets);

  // Counts shown on each tab.
  const counts = {
    market: tickets.filter((t) => t.status === 'available').length,
    pending: tickets.filter((t) => t.status === 'pending' && (isStaff || isMine(t))).length,
    mine: tickets.filter(isMine).length,
    purchased: tickets.filter((t) => isMyBuy(t) && t.status === 'reserved').length,
    history: tickets.filter((t) => t.status === 'completed' && (isMyBuy(t) || isMine(t))).length,
  };

  // Friendly empty-state message per tab.
  const emptyMessage = {
    market: 'No tickets are available to buy right now.',
    pending: isStaff
      ? 'No tickets are waiting for approval.'
      : 'You have no listings waiting for approval.',
    mine: "You haven't listed any tickets yet.",
    purchased: "You haven't bought any tickets to use yet.",
    history: 'No completed tickets yet.',
  }[scope];

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
          <p className="stat-number">{myListings}</p>
        </div>
        <div className="stat-card">
          <h3>Your Purchases</h3>
          <p className="stat-number">{myPurchases}</p>
        </div>
        <div className="stat-card">
          <h3>Your Sales</h3>
          <p className="stat-number">{mySales}</p>
        </div>
      </div>

      <div className="dashboard-toolbar">
        <div className="scope-tabs">
          <button
            className={`toggle-btn ${scope === 'market' ? 'active' : ''}`}
            onClick={() => setScope('market')}
          >
            Marketplace ({counts.market})
          </button>
          <button
            className={`toggle-btn ${scope === 'pending' ? 'active' : ''}`}
            onClick={() => setScope('pending')}
          >
            Pending Approval ({counts.pending})
          </button>
          <button
            className={`toggle-btn ${scope === 'mine' ? 'active' : ''}`}
            onClick={() => setScope('mine')}
          >
            My Listings ({counts.mine})
          </button>
          <button
            className={`toggle-btn ${scope === 'purchased' ? 'active' : ''}`}
            onClick={() => setScope('purchased')}
          >
            My Purchases ({counts.purchased})
          </button>
          <button
            className={`toggle-btn ${scope === 'history' ? 'active' : ''}`}
            onClick={() => setScope('history')}
          >
            History ({counts.history})
          </button>
        </div>
        <button className="btn-list-ticket" onClick={openForm}>
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
            <label htmlFor="min-price">Min Price (₪)</label>
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
            <label htmlFor="max-price">Max Price (₪)</label>
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
            <p>{emptyMessage}</p>
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
                onViewSeller={(id) => setProfileUserId(id)}
              />
            ))}
          </div>
        ) : (
          <Table tickets={filteredTickets} onRowClick={setSelectedTicket} />
        )}
      </div>

      {/* Ticket upload modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeForm}>✕</button>
            <h2>List a Ticket</h2>
            <p className="form-modal-sub">
              After uploading, your ticket is <strong>pending AI verification</strong>. Once it passes,
              it becomes available for buyers.
            </p>
            <form onSubmit={handleFormSubmit} className="ticket-form">
              <div className="form-group form-full">
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
              <div className="form-group form-full">
                <label htmlFor="venue">Venue</label>
                <input id="venue" name="venue" value={form.venue} onChange={handleFormChange} placeholder="e.g. Bloomfield Stadium" />
              </div>
              <div className="form-group">
                <label htmlFor="originalPrice">Original Price (₪)</label>
                <input id="originalPrice" name="originalPrice" type="number" min="0" value={form.originalPrice} onChange={handleFormChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label htmlFor="barcode">Barcode *</label>
                <input id="barcode" name="barcode" value={form.barcode} onChange={handleFormChange} placeholder="Ticket barcode string" />
              </div>
              <div className="form-group form-full">
                <label htmlFor="salePrice">Sale Price (₪) *</label>
                <input id="salePrice" name="salePrice" type="number" min="0" value={form.salePrice} onChange={handleFormChange} placeholder="e.g. 250" />
                <button
                  type="button"
                  className="btn-ai-price"
                  onClick={handleGetAiPrice}
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Analyzing market…' : '✨ Get AI price recommendation'}
                </button>

                {aiError && <div className="ai-inline-error">{aiError}</div>}

                {aiSuggestion && (
                  <div className="ai-inline-suggestion">
                    <div className="ai-inline-price">
                      Recommended price: <strong>₪{aiSuggestion.recommendedPrice}</strong>
                      <span className="ai-inline-range">
                        (fair range ₪{aiSuggestion.priceRange.min}–₪{aiSuggestion.priceRange.max})
                      </span>
                    </div>
                    <p className="ai-inline-advice">{aiSuggestion.advice}</p>
                    <div className="ai-inline-actions">
                      <button type="button" className="btn-ai-apply" onClick={applyAiPrice}>
                        Use ₪{aiSuggestion.recommendedPrice}
                      </button>
                      <span className="ai-inline-source">
                        {aiSuggestion.provider === 'gemini' ? 'via Google Gemini (AI)' : 'via local engine'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {formError && <div className="error-message form-full">{formError}</div>}

              <div className="form-actions form-full">
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Uploading...' : 'Upload Ticket'}
                </button>
                <button type="button" className="btn-reset" onClick={closeForm} disabled={submitting}>
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
              <p><strong>Original Price:</strong> ₪{selectedTicket.originalPrice}</p>
              <p><strong>Sale Price:</strong> ₪{selectedTicket.salePrice}</p>
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
              <button
                className="btn-view-seller"
                onClick={() => { setProfileUserId(selectedTicket.sellerId); setSelectedTicket(null); }}
              >
                View seller profile & reviews
              </button>
              {canDelete(selectedTicket) && (
                <button
                  className="btn-delete-ticket"
                  onClick={() => handleDelete(selectedTicket)}
                >
                  🗑️ Delete listing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller profile modal (avatar + reviews) */}
      {profileUserId && (
        <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </div>
  );
}

export default Dashboard;
