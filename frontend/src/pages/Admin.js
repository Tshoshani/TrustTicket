import React, { useState, useEffect } from 'react';
import { ticketsAPI, transactionsAPI, usersAPI } from '../services/api';
import '../styles/Admin.css';

function Admin({ user }) {
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
      setPending((ticketsRes.data || []).filter((t) => t.status === 'pending'));

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

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Signed in as <strong>{user?.displayName || user?.name}</strong> ({user?.role})</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {notice && <div className="success-message">{notice}</div>}

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
                  <span>Seller: {nameOf(t.sellerId)} · ${t.salePrice} · Barcode: {t.barcode}</span>
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
                    <td className="price-highlight">${tx.totalPrice}</td>
                    <td>${tx.buyerFee}</td>
                    <td>${tx.sellerFee}</td>
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
