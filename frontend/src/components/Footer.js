import React from 'react';
import '../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {currentYear} TrustTicket. Secure Ticket Resale Marketplace</p>
      <p>Connecting buyers and sellers with trust and transparency</p>
      <p>Built by Shay Silversmith &amp; Tomer Shoshani — Group 30</p>
    </footer>
  );
}

export default Footer;
