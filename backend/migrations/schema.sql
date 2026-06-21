DROP DATABASE IF EXISTS trustticket;
CREATE DATABASE trustticket;
USE trustticket;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_role ENUM('admin', 'manager', 'user') DEFAULT 'user',
  trust_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  successful_deals INT DEFAULT 0,
  verified_seller BOOLEAN DEFAULT FALSE,
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  permissions VARCHAR(255) DEFAULT 'manage_users,manage_tickets,manage_transactions',
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE tickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(150) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  venue VARCHAR(200) NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  original_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  seller_id INT NOT NULL,
  status ENUM('pending', 'available', 'reserved', 'completed', 'redeemed') DEFAULT 'pending',
  verified BOOLEAN DEFAULT FALSE,
  buyer_id INT NULL,
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(user_id),
  FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

CREATE TABLE transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  status ENUM('escrow_pending', 'ticket_released', 'completed', 'cancelled') DEFAULT 'escrow_pending',
  ticket_released BOOLEAN DEFAULT FALSE,
  buyer_fee DECIMAL(10,2) DEFAULT 0,
  seller_fee DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
  FOREIGN KEY (buyer_id) REFERENCES users(user_id),
  FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

CREATE TABLE favorites (
  user_id INT NOT NULL,
  ticket_id INT NOT NULL,
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, ticket_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);