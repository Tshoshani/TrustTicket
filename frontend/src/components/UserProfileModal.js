import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import Stars from './Stars';
import { usersAPI } from '../services/api';
import '../styles/UserProfileModal.css';

// UserProfileModal - shows a public seller profile: photo, trust rating,
// stats and the reviews other users left for them.
function UserProfileModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([usersAPI.getById(userId), usersAPI.getReviews(userId)])
      .then(([uRes, rRes]) => {
        if (!active) return;
        setUser(uRes.data);
        setReviews(rRes.data?.reviews || []);
      })
      .catch((err) => active && setError(err.message || 'Failed to load profile'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [userId]);

  const name = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {loading && <div className="profile-modal-loading">Loading profile…</div>}
        {error && <div className="error-message">{error}</div>}

        {user && (
          <>
            <div className="profile-modal-head">
              <Avatar src={user.avatar} name={name} size={84} />
              <div>
                <h2 className="profile-modal-name">
                  {name}
                  {user.verifiedSeller && <span className="verified-badge">Verified</span>}
                </h2>
                <div className="profile-modal-rating">
                  <Stars rating={user.trustRating || 0} count={user.ratingCount || 0} size={18} />
                </div>
                <div className="profile-modal-deals">{user.successfulDeals || 0} successful deals</div>
              </div>
            </div>

            <h3 className="profile-modal-subtitle">Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="profile-modal-empty">No reviews yet.</p>
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
          </>
        )}
      </div>
    </div>
  );
}

export default UserProfileModal;
