import React from 'react';
import Stars from './Stars';
import Avatar from './Avatar';
import '../styles/Card.css';

/**
 * Card - a single marketplace ticket listing, styled like a real ticket stub.
 *
 * Props:
 *   ticket       - the ticket object
 *   seller       - the seller's public user object (name + trust rating), optional
 *   currentUser  - the logged-in user (used to decide which actions to show)
 *   onView       - open the details modal
 *   onVerify     - run the mock AI verification (seller, pending ticket)
 *   onBuy        - purchase a verified/available ticket (other users)
 *   onRedeem     - mark the barcode as used (buyer, reserved ticket)
 *   onEdit       - edit one of your own listings (sends it back for verification)
 */
function Card({ ticket, seller, currentUser, onView, onVerify, onBuy, onRedeem, onViewSeller, onEdit }) {
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

  // Normalize the event type into a CSS-safe accent class (type-concert, etc.).
  const typeClass = `type-${(ticket.eventType || 'other').toLowerCase()}`;

  const eventDate = new Date(ticket.eventDate).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className={`ticket-card ${typeClass}`}>
      {/* Colored header band keyed to the event type */}
      <div className="ticket-top">
        <span className="ticket-type">{ticket.eventType}</span>
        <h3 className="ticket-title">{ticket.eventName}</h3>
        <p className="ticket-venue">{ticket.venue}</p>
      </div>

      {/* Perforation divider with side notches */}
      <div className="ticket-perforation" aria-hidden="true">
        <span className="notch notch-left"></span>
        <span className="notch notch-right"></span>
      </div>

      <div className="ticket-body">
        <div className="ticket-meta">
          <div className="meta-row">
            <span className="meta-label">Date</span>
            <span className="meta-value">{eventDate}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Original</span>
            <span className="meta-value">₪{ticket.originalPrice}</span>
          </div>
        </div>

        {/* Seller + trust rating (clickable -> opens the seller's profile) */}
        <button
          type="button"
          className="ticket-seller ticket-seller-btn"
          onClick={() => onViewSeller && onViewSeller(ticket.sellerId)}
          title="View seller profile"
        >
          <div className="seller-top">
            <Avatar src={seller && seller.avatar} name={sellerName} size={34} />
            <span className="seller-name">
              {sellerName}
              {seller && seller.verifiedSeller && (
                <span className="verified-badge" title="Identity verified">Verified</span>
              )}
            </span>
          </div>
          {seller && typeof seller.trustRating === 'number' && (
            <span className="trust-rating">
              <Stars rating={seller.trustRating} count={seller.ratingCount} size={14} />
              <span className="deals-count"> · {seller.successfulDeals || 0} deals</span>
            </span>
          )}
        </button>

        <div className="ticket-badges">
          <span className={`status-badge status-${ticket.status}`}>{statusLabel}</span>
          {ticket.verified && (
            <span className="ai-badge" title="Passed AI verification">AI verified</span>
          )}
        </div>
      </div>

      {/* Stub: price + actions */}
      <div className="ticket-stub">
        <div className="ticket-price">
          <span className="price-label">Price</span>
          <span className="price-value">₪{ticket.salePrice}</span>
        </div>
        <div className="ticket-actions">
          {onView && (
            <button className="ticket-btn btn-ghost" onClick={() => onView(ticket)}>
              Details
            </button>
          )}
          {isOwner && onEdit && (
            <button className="ticket-btn btn-edit" onClick={() => onEdit(ticket)}>
              Edit
            </button>
          )}
          {canVerify && onVerify && (
            <button className="ticket-btn btn-verify" onClick={() => onVerify(ticket)}>
              Run AI Verification
            </button>
          )}
          {canBuy && onBuy && (
            <button className="ticket-btn btn-buy" onClick={() => onBuy(ticket)}>
              Buy Now
            </button>
          )}
          {canRedeem && onRedeem && (
            <button className="ticket-btn btn-redeem" onClick={() => onRedeem(ticket)}>
              Mark Barcode Used
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
