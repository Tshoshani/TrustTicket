import React from 'react';
import '../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {currentYear} TrustTicket. Secure Ticket Resale Marketplace</p>
      <p>Connecting buyers and sellers with trust and transparency</p>
    </footer>
  );
}

export default Footer;
