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
      if (maxPr