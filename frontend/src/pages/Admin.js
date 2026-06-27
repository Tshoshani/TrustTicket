import React, { useState, useEffect } from 'react';
import { ticketsAPI, transactionsAPI, usersAPI } from '../services/api';
import '../styles/Admin.css';

// Small CSS bar chart (no external charting dependency).
function MiniBars({ rows, money }) {
  if (!rows || rows.length === 0) {
    return <p className="admin-sub">No data yet.</p>;
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span className="bar-label">{r.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="bar-value">
            {money ? `₪${Math.round(r.value).toLocaleString()}` : r.value}
          </span>
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

      // Users (admin/manager can read the full list) for name lookups.
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

  // ---- Platform analytics (computed from the loaded tickets + transactions) ----
  const isoDay = (d) => new Date(d).toISOString().slice(0, 10);
  const fmtDay = (iso) => {
    const dt = new Date(iso);
    return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
  };
  const money = (n) => `₪${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const completedTx = transactions.filter((t) => t.status === 'completed');
  const platformProfit = completedTx.reduce(
    (s, t) => s + Number(t.buyerFee || 0) + Number(t.sellerFee || 0), 0
  );
  const salesVolume = completedTx.reduce((s, t) => s + Number(t.totalPrice || 0), 0);
  const availableNow = allTickets.filter((t) => t.status === 'available').length;

  // Tickets sold + profit, grouped by day.
  const salesMap = {};
  completedTx.forEach((t) => {
    const d = isoDay(t.createDate);
    if (!salesMap[d]) salesMap[d] = { day: d, count: 0, profit: 0 };
    salesMap[d].count += 1;
    salesMap[d].profit += Number(t.buyerFee || 0) + Number(t.sellerFee || 0);
  });
  const salesByDay = Object.values(salesMap)
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-10);

  // New listings grouped by day (when the ticket was created).
  const listMap = {};
  allTickets.forEach((t) => {
    const d = isoDay(t.createDate);
    listMap[d] = (listMap[d] || 0) + 1;
  });
  const listingsByDay = Object.entries(listMap)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-10);

  const soldRows = salesByDay.map((s) => ({ label: fmtDay(s.day), value: s.count }));
  const profitRows = salesByDay.map((s) => ({ label: fmtDay(s.day), value: s.profit }));
  const listingRows = listingsByDay.map((s) => ({ label: fmtDay(s.day), value: s.count }));

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Signed in as <strong>{user?.displayName || user?.name}</strong> ({user?.role})</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {notice && <div className="success-message">{notice}</div>}

      <section className="admin-section">
        <h2>Platform Analytics</h2>
        <p className="admin-sub">Marketplace activity and platform revenue (2.5% fee per side).</p>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>Tickets Listed</h3>
            <p className="admin-stat-number">{allTickets.length}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Tickets Sold</h3>
            <p className="admin-stat-number">{completedTx.length}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Available Now</h3>
            <p className="admin-stat-number">{availableNow}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Sales Volume</h3>
            <p className="admin-stat-number">{money(salesVolume)}</p>
          </div>
          <div className="admin-stat-card highlight">
            <h3>Platform Profit</h3>
            <p className="admin-stat-number">{money(platformProfit)}</p>
          </div>
        </div>

        <div className="admin-charts">
          <div className="chart-block">
            <h3>Tickets Sold per Day</h3>
            <MiniBars rows={soldRows} />
          </div>
          <div className="chart-block">
            <h3>Profit per Day</h3>
            <MiniBars rows={profitRows} money />
          </div>
          <div className="chart-block">
            <h3>New Listings per Day</h3>
            <MiniBars rows={listingRows} />
          </div>
        </div>
      </section>

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

      <section className="admin-section">
        <h2>Sales &amp; Transactions ({transactions.length})</h2>
        <p className="admin-sub">Track every escrow transaction across the marketplace.</p>
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
    </div>
  );
}

export default Admin;
