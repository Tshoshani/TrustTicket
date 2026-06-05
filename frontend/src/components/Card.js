import React from 'react';
import '../styles/Card.css';

function Card({ ticket, onAction }) {
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
          <strong>Barcode:</strong> {ticket.barcode}
        </p>
        <p className="card-detail">
          <strong>Original Price:</strong> ${ticket.originalPrice}
        </p>
        <p className="card-price">
          <strong>Sale Price:</strong> ${ticket.salePrice}
        </p>
        <p className="card-status">
          <strong>Status:</strong> 
          <span className={`status-badge status-${ticket.status}`}>
            {ticket.status}
          </span>
        </p>

        {onAction && (
          <button className="card-action-btn" onClick={() => onAction(ticket)}>
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

export default Card;
