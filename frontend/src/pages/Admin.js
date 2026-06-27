import React, { useState, useEffect } from 'react';
import { ticketsAPI, transactionsAPI, usersAPI } from '../services/api';
import '../styles/Admin.css';

const DAY = 24 * 60 * 60 * 1000;

// Vertical column chart (no external charting dependency).
function ColumnChart({ rows, money, color = 'linear-gradient(180deg, #a855f7, #7c3aed)' }) {
  if (!rows || rows.length === 0) {
    return <p className="admin-sub">No data in this period.</p>;
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="col-chart">
      {rows.map((r) => (
        <div className="col-item" key={r.label}>
          <div className="col-bar-wrap">
            <span className="col-value">{money ? `₪${Math.round(r.value).toLocaleString()}` : r.value}</span>
            <div
              className="col-bar"
              style={{ height: `${Math.max(4, (r.value / max) * 100)}%`, background: color }}
            />
          </div>
          <span className="col-label">{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function Admin({ user }) {
  const [allTickets, setAllTickets] = useState([]);
  const [pending, setPending] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [tab, setTab] = useState('sales'); // sales | profit | pending | transactions
  const [range, setRange] = useState('all'); // all | 7d | 30d | 180d | custom
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const ticketsRes = await ticketsAPI.getAll();
      const tickets = ticketsRes.data || [];
      setAllTickets(tickets);
      setPending(tickets.filter((t) => t.status === 'pending'));

      try {
        const usersRes = await usersAPI.getAll();
        const map = {};
        (usersRes.data || []).forEach((u) => { map[u.userId] = u; });
        setUsersById(map);
      } catch (e) { /* non-fatal */ }

      try {
        const txRes = await transactionsAPI.getAll();
        setTransactions(txRes.data || []);
      } catch (e) { /* non-fatal */ }
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ticket) => {
    setError('');
    setNotice('');
    try {
      await ticketsAPI.verify(ticket.ticketId);
      setNotice(`Approved "${ticket.eventName}" — it is now listed for sale.`);
      await load();
    } catch (err) {
      setError(err.message || 'Approval failed');
    }
  };

  const nameOf = (id) => {
    const u = usersById[id];
    return u ? `${u.firstName} ${u.lastName}` : `#${id}`;
  };

  if (loading) return <div className="loading-spinner"></div>;

  // ---- Date-range filtering -------------------------------------------------
  const now = new Date();
  let rangeStart = null;
  let rangeEnd = null;
  if (range === '7d') rangeStart = new Date(now.getTime() - 7 * DAY);
  else if (range === '30d') rangeStart = new Date(now.getTime() - 30 * DAY);
  else if (range === '180d') rangeStart = new Date(now.getTime() - 180 * DAY);
  else if (range === 'custom') {
    if (customFrom) rangeStart = new Date(customFrom + 'T00:00:00');
    if (customTo) rangeEnd = new Date(customTo + 'T23:59:59');
  }
  const inRange = (d) => {
    const dt = new Date(d);
    if (rangeStart && dt < rangeStart) return false;
    if (rangeEnd && dt > rangeEnd) return false;
    return true;
  };

  const isoDay = (d) => new Date(d).toISOString().slice(0, 10);
  const fmtDay = (iso) => {
    const dt = new Date(iso);
    return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
  };
  const money = (n) => `₪${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // Completed sales (these carry the platform fees) within the selected range.
  const soldTx = transactions.filter((t) => t.status === 'completed' && inRange(t.createDate));
  const listingsInRange = allTickets.filter((t) => inRange(t.createDate));

  const platformProfit = soldTx.reduce((s, t) => s + Number(t.buyerFee || 0) + Number(t.sellerFee || 0), 0);
  const buyerFees = soldTx.reduce((s, t) => s + Number(t.buyerFee || 0), 0);
  const sellerFees = soldTx.reduce((s, t) => s + Number(t.sellerFee || 0), 0);
  const salesVolume = soldTx.reduce((s, t) => s + Number(t.totalPrice || 0), 0);
  const avgProfit = soldTx.length ? platformProfit / soldTx.length : 0;
  const availableNow = allTickets.filter((t) => t.status === 'available').length;

  // Group completed sales by day.
  const salesMap = {};
  soldTx.forEach((t) => {
    const d = isoDay(t.createDate);
    if (!salesMap[d]) salesMap[d] = { day: d, count: 0, profit: 0, volume: 0 };
    salesMap[d].count += 1;
    salesMap[d].profit += Number(t.buyerFee || 0) + Number(t.sellerFee || 0);
    salesMap[d].volume += Number(t.totalPrice || 0);
  });
  const salesSeries = Object.values(salesMap).sort((a, b) => a.day.localeCompare(b.day));

  // Group new listings by day.
  const listMap = {};
  listingsInRange.forEach((t) => {
    const d = isoDay(t.createDate);
    listMap[d] = (listMap[d] || 0) + 1;
  });
  const listingSeries = Object.entries(listMap)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const soldRows = salesSeries.map((s) => ({ label: fmtDay(s.day), value: s.count }));
  const volumeRows = salesSeries.map((s) => ({ label: fmtDay(s.day), value: s.volume }));
  const profitRows = salesSeries.map((s) => ({ label: fmtDay(s.day), value: s.profit }));
  const listingRows = listingSeries.map((s) => ({ label: fmtDay(s.day), value: s.count }));

  const RANGES = [
    { key: 'all', label: 'All time' },
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '180d', label: 'Last 6 months' },
    { key: 'custom', label: 'Custom' },
  ];

  const RangeFilter = () => (
    <div className="range-filter">
      <div className="range-buttons">
        {RANGES.map((r) => (
          <button
            key={r.key}
            className={`range-btn ${range === r.key ? 'active' : ''}`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {range === 'custom' && (
        <div className="range-custom">
          <label>From <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} /></label>
          <label>To <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} /></label>
        </div>
      )}
    </div>
  );

  const TABS = [
    { key: 'sales', label: '📊 Sales Dashboard' },
    { key: 'profit', label: '💰 Profit Analytics' },
    { key: 'pending', label: `⏳ Pending Verification (${pending.length})` },
    { key: 'transactions', label: `🧾 Sales & Transactions (${transactions.length})` },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Signed in as <strong>{user?.displayName || user?.name}</strong> ({user?.role})</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {notice && <div className="success-message">{notice}</div>}

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admin-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---- Sales Dashboard ---- */}
      {tab === 'sales' && (
        <section className="admin-section">
          <h2>Sales Dashboard</h2>
          <RangeFilter />

          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <h3>Tickets Sold</h3>
              <p className="admin-stat-number">{soldTx.length}</p>
            </div>
            <div className="admin-stat-card">
              <h3>New Listings</h3>
              <p className="admin-stat-number">{listingsInRange.length}</p>
            </div>
            <div className="admin-stat-card">
              <h3>Available Now</h3>
              <p className="admin-stat-number">{availableNow}</p>
            </div>
            <div className="admin-stat-card highlight">
              <h3>Sales Volume</h3>
              <p className="admin-stat-number">{money(salesVolume)}</p>
            </div>
          </div>

          <div className="admin-charts">
            <div className="chart-block">
              <h3>Tickets Sold per Day</h3>
              <ColumnChart rows={soldRows} />
            </div>
            <div className="chart-block">
              <h3>Sales Volume per Day (₪)</h3>
              <ColumnChart rows={volumeRows} money color="linear-gradient(180deg, #34d399, #059669)" />
            </div>
            <div className="chart-block">
              <h3>New Listings per Day</h3>
              <ColumnChart rows={listingRows} color="linear-gradient(180deg, #60a5fa, #2563eb)" />
            </div>
          </div>
        </section>
      )}

      {/* ---- Profit Analytics ---- */}
      {tab === 'profit' && (
        <section className="admin-section">
          <h2>Profit Analytics</h2>
          <p className="admin-sub">Platform earns a 2.5% fee from the buyer and 2.5% from the seller on each completed sale.</p>
          <RangeFilter />

          <div className="admin-stats-grid">
            <div className="admin-stat-card highlight">
              <h3>Platform Profit</h3>
              <p className="admin-stat-number">{money(platformProfit)}</p>
            </div>
            <div className="admin-stat-card">
              <h3>Buyer Fees (2.5%)</h3>
              <p className="admin-stat-number">{money(buyerFees)}</p>
            </div>
            <div className="admin-stat-card">
              <h3>Seller Fees (2.5%)</h3>
              <p className="admin-stat-number">{money(sellerFees)}</p>
            </div>
            <div className="admin-stat-card">
              <h3>Avg Profit / Sale</h3>
              <p className="admin-stat-number">{money(avgProfit)}</p>
            </div>
            <div className="admin-stat-card">
              <h3>Money Through System</h3>
              <p className="admin-stat-number">{money(salesVolume)}</p>
            </div>
          </div>

          <div className="admin-charts">
            <div className="chart-block wide">
              <h3>Profit per Day (₪)</h3>
              <ColumnChart rows={profitRows} money />
            </div>
          </div>
        </section>
      )}

      {/* ---- Pending Verification ---- */}
      {tab === 'pending' && (
        <section className="admin-section">
          <h2>Pending Verification ({pending.length})</h2>
          <p className="admin-sub">Review tickets uploaded by sellers and approve the ones that look authentic.</p>
          {pending.length === 0 ? (
            <div className="empty-state"><p>No tickets awaiting verification.</p></div>
          ) : (
            <div className="approval-list">
              {pending.map((t) => (
                <div className="approval-item" key={t.ticketId}>
                  <div className="approval-info">
                    <strong>{t.eventName}</strong>
                    <span>{t.eventType} · {new Date(t.eventDate).toLocaleDateString()} · {t.venue}</span>
                    <span>Seller: {nameOf(t.sellerId)} · ₪{t.salePrice} · Barcode: {t.barcode}</span>
                  </div>
                  <button className="btn-approve" onClick={() => handleApprove(t)}>
                    ✓ Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- Sales & Transactions ledger ---- */}
      {tab === 'transactions' && (
        <section className="admin-section">
          <h2>Sales &amp; Transactions ({transactions.length})</h2>
          <p className="admin-sub">Every escrow transaction across the marketplace.</p>
          {transactions.length === 0 ? (
            <div className="empty-state"><p>No transactions yet.</p></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Ticket</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Buyer Fee</th>
                    <th>Seller Fee</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.transactionId} className="table-row">
                      <td>{tx.transactionId}</td>
                      <td>#{tx.ticketId}</td>
                      <td>{nameOf(tx.buyerId)}</td>
                      <td>{nameOf(tx.sellerId)}</td>
                      <td className="price-highlight">₪{tx.totalPrice}</td>
                      <td>₪{tx.buyerFee}</td>
                      <td>₪{tx.sellerFee}</td>
                      <td>
                        <span className={`status-badge status-${tx.status}`}>{tx.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Admin;
