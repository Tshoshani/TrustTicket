import React, { useState, useEffect } from 'react';
import { aiAPI, ticketsAPI } from '../services/api';
import '../styles/AIAdvisor.css';

// AIAdvisor - picks a REAL ticket from the marketplace (loaded from MySQL) and
// asks the backend AI endpoint to analyze its pricing and buyer risk.
// The page talks ONLY to the backend (POST /api/ai/ticket-advice with a
// ticketId); no AI keys ever reach the browser.
function AIAdvisor() {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState('');

  // Load real tickets from the marketplace so the user can pick one.
  useEffect(() => {
    ticketsAPI.getAll()
      .then((res) => {
        const list = res.data || [];
        setTickets(list);
        if (list.length > 0) setSelectedId(String(list[0].ticketId));
      })
      .catch((err) => setError(err.message || 'Failed to load tickets'))
      .finally(() => setLoadingTickets(false));
  }, []);

  const selectedTicket = tickets.find((t) => String(t.ticketId) === String(selectedId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await aiAPI.getTicketAdvice({ ticketId: Number(selectedId) });
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to get AI advice');
    } finally {
      setLoading(false);
    }
  };

  const recoLabel = {
    lower_price: 'Consider lowering the price',
    raise_price: 'You could raise the price',
    good_price: 'Your price looks good',
  };

  return (
    <div className="ai-advisor">
      <h1>🤖 AI Ticket Advisor</h1>
      <p className="ai-intro">
        Pick a real ticket from the marketplace and the AI will analyze its
        pricing and trust, suggesting a fair price range and flagging any risk
        for buyers.
      </p>

      <form className="ai-form" onSubmit={handleSubmit}>
        <label>
          Ticket to analyze
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
            disabled={loadingTickets || tickets.length === 0}
          >
            {loadingTickets && <option>Loading tickets...</option>}
            {!loadingTickets && tickets.length === 0 && <option>No tickets available</option>}
            {tickets.map((t) => (
              <option key={t.ticketId} value={t.ticketId}>
                #{t.ticketId} · {t.eventName} ({t.eventType}) · ₪{t.salePrice}
              </option>
            ))}
          </select>
        </label>

        {selectedTicket && (
          <div className="ai-ticket-preview">
            <div><strong>{selectedTicket.eventName}</strong> — {selectedTicket.eventType}</div>
            <div>{selectedTicket.venue} · {selectedTicket.eventDate}</div>
            <div>
              Original: ₪{selectedTicket.originalPrice} · Asking: ₪{selectedTicket.salePrice}
              {selectedTicket.seller && <> · Seller trust: {selectedTicket.seller.trustRating}⭐</>}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || !selectedId}>
          {loading ? 'Analyzing...' : 'Get AI Advice'}
        </button>
      </form>

      {error && <div className="ai-error">{error}</div>}

      {result && (
        <div className={`ai-result risk-${result.riskLevel.toLowerCase()}`}>
          <div className="ai-result-header">
            <span className="ai-reco">{recoLabel[result.recommendation] || result.recommendation}</span>
            <span className={`ai-risk-badge risk-${result.riskLevel.toLowerCase()}`}>
              {result.riskLevel} risk
            </span>
          </div>

          <div className="ai-price-range">
            Recommended fair range:&nbsp;
            <strong>₪{result.priceRange.min} – ₪{result.priceRange.max}</strong>
          </div>

          <p className="ai-advice">{result.advice}</p>

          <div className="ai-meta">
            Powered by: <strong>{result.provider === 'gemini' ? 'Google Gemini (AI)' : 'local engine'}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAdvisor;
