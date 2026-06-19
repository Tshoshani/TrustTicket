import React from 'react';
import '../styles/Table.css';

function Table({ tickets, onRowClick }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-state">
        <p>No tickets found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Type</th>
            <th>Venue</th>
            <th>Date</th>
            <th>Original Price</th>
            <th>Sale Price</th>
            <th>Status</th>
            <th>Barcode</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr 
              key={ticket.ticketId}
              onClick={() => onRowClick && onRowClick(ticket)}
              className="table-row"
            >
              <td>{ticket.eventName}</td>
              <td>{ticket.eventType}</td>
              <td>{ticket.venue}</td>
              <td>{new Date(ticket.eventDate).toLocaleDateString()}</td>
              <td>${ticket.originalPrice}</td>
              <td className="price-highlight">${ticket.salePrice}</td>
              <td>
                <span className={`status-badge status-${ticket.status}`}>
                  {ticket.status}
                </span>
              </td>
              <td>{ticket.barcode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
