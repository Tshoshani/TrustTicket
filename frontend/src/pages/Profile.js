import React, { useState, useEffect } from 'react';
import Stars from '../components/Stars';
import Table from '../components/Table';
import Avatar from '../components/Avatar';
import { usersAPI, ticketsAPI } from '../services/api';
import '../styles/Profile.css';

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await usersAPI.getById(user?.id);
      setProfile(res.data);

      const ticketsRes = await ticketsAPI.getAll();
      const mine = (ticketsRes.data || []).filter((t) => t.sellerId === user?.id);
      setListings(mine);

      try {
        const rev = await usersAPI.getReviews(user?.id);
        setReviews(rev.data?.reviews || []);
      } catch (e) { /* reviews are optional */ }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  const p = profile || {};
  const displayName = user?.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || user?.name;

  const completedSales = listings.filter((t) => t.status === 'completed').length;
  const activeListings = listings.filter((t) => t.status === 'available' || t.status === 'pending').length;

  return (
    <div className="profile-page">
      {error && <div className="error-message">{error}</div>}

      <div className="profile-card">
        <Avatar src={p.avatar} name={displayName} size={90} />
        <div className="profile-info">
          <h1>
            {displayName}
            {p.verifiedSeller && <span className="verified-badge" title="Identity verified">✓ Verified</span>}
          </h1>
          <p className="profile-role">Role: <strong>{p.userRole || user?.role}</strong></p>
          <p className="profile-email">{p.email || user?.email}</p>

          <div className="profile-rating">
            <span className="rating-label">Seller trust rating</span>
            <Stars rating={p.trustRating || 0} count={p.ratingCount || 0} size={26} />
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-num">{(p.trustRating || 0).toFixed(1)}</span>
          <span className="profile-stat-label">Trust Rating</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-num">{p.ratingCount || 0}</span>
          <span className="profile-stat-label">Ratings Received</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-num">{p.successfulDeals || 0}</span>
          <span className="profile-stat-label">Successful Deals</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-num">{activeListings}</span>
          <span className="profile-stat-label">Active Listings</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-num">{completedSales}</span>
          <span className="profile-stat-label">Completed Sales</span>
        </div>
      </div>

      <div className="profile-listings">
        <h2>My Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <div className="empty-state"><p>You haven't listed any tickets yet.</p></div>
        ) : (
          <Table tickets={listings} />
        )}
      </div>

      <div className="profile-reviews">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="empty-state"><p>No reviews yet.</p></div>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => (
              <li key={r.reviewId} className="review-item">
                <div className="review-head">
                  <span className="review-name">{r.reviewerName}</span>
                  <Stars rating={r.rating} size={13} />
                </div>
                <p className="review-comment">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Profile;
