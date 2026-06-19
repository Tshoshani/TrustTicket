import React from 'react';
import Stars from './Stars';
import '../styles/Card.css';

/**
 * Card - a single marketplace ticket listing.
 *
 * Props:
 *   ticket       - the ticket object
 *   seller       - the seller's public user object (name + trust rating), optional
 *   currentUser  - the logged-in user (used to decide which actions to show)
 *   onView       - open the details modal
 *   onVerify     - run the mock AI verification (seller, pending ticket)
 *   onBuy        - purchase a verified/available ticket (other users)
 *   onRedeem     - mark the barcode as used (buyer, reserved ticket)
 */
function Card({ ticket, seller, currentUser, onView, onVerify, onBuy, onRedeem }) {
  const isOwner = currentUser && ticket.sellerId === currentUser.id;
  const isBuyer = currentUser && ticket.buyerId === currentUser.id;
  const isStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');

  // Only admins/managers approve tickets (they act as the verification authority).
  const canVerify = isStaff && ticket.status === 'pending';
  const canBuy = ticket.status === 'available' && ticket.verified && !isOwner;
  const canRedeem = isBuyer && ticket.status === 'reserved';

  // Human-friendly status label.
  const statusLabel = {
    pending: 'Pending verification',
    available: 'Available',
    reserved: 'Reserved (in escrow)',
    completed: 'Completed',
  }[ticket.status] || ticket.status;

  const sellerName = seller
    ? `${seller.firstName} ${seller.lastName}`
    : `Seller #${ticket.sellerId}`;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{ticket.eventName}</h3>
        <span className="card-badge">{ticket.eventType}</span>
      </div>

      <div className="card-body">
        <p className="card-detail">
          <strong>Venue:</strong> {ticket.venue}
        </p>
        <p className="card-detail">
          <strong>Date:</strong> {new Date(ticket.eventDate).toLocaleDateString()}
        </p>
        <p className="card-detail">
          <strong>Original Price:</strong> ${ticket.originalPrice}
        </p>
        <p className="card-price">
          <strong>Sale Price:</strong> ${ticket.salePrice}
        </p>

        {/* Seller + trust rating */}
        <div className="card-seller">
          <span className="seller-name">
            {sellerName}
            {seller && seller.verifiedSeller && (
              <span className="verified-badge" title="Identity verified">✓ Verified</span>
            )}
          </span>
          {seller && typeof seller.trustRating === 'number' && (
            <span className="trust-rating">
              <Stars rating={seller.trustRating} count={seller.ratingCount} size={14} />
              <span className="deals-count"> · {seller.successfulDeals || 0} deals</span>
            </span>
          )}
        </div>

        <p className="card-status">
          <strong>Status:</strong>
          <span className={`status-badge status-${ticket.status}`}>
            {statusLabel}
          </span>
          {ticket.verified && (
            <span className="ai-badge" title="Passed AI verification">🤖 AI verified</span>
          )}
        </p>

        <div className="card-actions">
          {onView && (
            <button className="card-action-btn" onClick={() => onView(ticket)}>
              View Details
            </button>
          )}
          {canVerify && onVerify && (
            <button className="card-action-btn btn-verify" onClick={() => onVerify(ticket)}>
              🤖 Run AI Verification
            </button>
          )}
          {canBuy && onBuy && (
            <button className="card-action-btn btn-buy" onClick={() => onBuy(ticket)}>
              Buy Now
            </button>
          )}
          {canRedeem && onRedeem && (
            <button className="card-action-btn btn-redeem" onClick={() => onRedeem(ticket)}>
              Mark Barcode Used
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
