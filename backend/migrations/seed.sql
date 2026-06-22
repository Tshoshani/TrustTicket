USE trustticket;

INSERT INTO users
(user_id, first_name, last_name, email, password, user_role, trust_rating, rating_count, successful_deals, verified_seller, create_date, update_date)
VALUES
(1, 'Tomer', 'Shoshani', 'tomer@trustticket.com', 'password123', 'admin', 5.0, 20, 24, true, '2026-05-01 10:00:00', '2026-05-01 10:00:00'),
(2, 'Shay', 'Silversmith', 'shay@trustticket.com', 'password123', 'user', 4.8, 11, 12, true, '2026-05-02 12:00:00', '2026-05-02 12:00:00'),
(3, 'Noa', 'Levi', 'noa@trustticket.com', 'password123', 'user', 4.5, 6, 7, true, '2026-05-03 09:30:00', '2026-05-03 09:30:00'),
(4, 'Amit', 'Cohen', 'amit@trustticket.com', 'password123', 'manager', 4.9, 15, 18, true, '2026-05-04 14:00:00', '2026-05-04 14:00:00'),
(5, 'Dana', 'Katz', 'dana@trustticket.com', 'password123', 'user', 4.2, 2, 3, false, '2026-05-05 16:45:00', '2026-05-05 16:45:00');

INSERT INTO settings
(user_id, display_name, username, phone, theme, language, notifications, create_date, update_date)
VALUES
(1, 'Tomer Shoshani', 'tomer_admin', '', 'light', 'en', true, '2026-05-01 10:00:00', '2026-05-01 10:00:00'),
(2, 'Shay Silversmith', 'shay_s', '', 'light', 'en', true, '2026-05-02 12:00:00', '2026-05-02 12:00:00'),
(3, 'Noa Levi', 'noa_l', '', 'light', 'en', true, '2026-05-03 09:30:00', '2026-05-03 09:30:00'),
(4, 'Amit Cohen', 'amit_c', '', 'light', 'en', true, '2026-05-04 14:00:00', '2026-05-04 14:00:00'),
(5, 'Dana Katz', 'dana_k', '', 'light', 'en', true, '2026-05-05 16:45:00', '2026-05-05 16:45:00');

INSERT INTO admins
(user_id, permissions)
VALUES
(1, 'manage_users,manage_tickets,manage_transactions');

INSERT INTO tickets
(ticket_id, event_name, event_type, event_date, venue, barcode, original_price, sale_price, seller_id, status, verified, buyer_id, create_date, update_date)
VALUES
(101, 'Omer Adam Live', 'Concert', '2026-07-20', 'Bloomfield Stadium, Tel Aviv', 'XYZ123456', 220, 250, 2, 'available', true, NULL, '2026-05-10 08:00:00', '2026-05-10 08:00:00'),
(102, 'Noga Erez DJ Set', 'Party', '2026-06-15', 'The Block, Tel Aviv', 'ABC789012', 120, 150, 3, 'available', true, NULL, '2026-05-11 10:30:00', '2026-05-11 10:30:00'),
(103, 'Shaanan Streett Standup', 'Standup', '2026-08-05', 'Zappa Herzliya', 'STU345678', 90, 100, 5, 'pending', false, NULL, '2026-05-12 15:00:00', '2026-05-12 15:00:00'),
(104, 'Maccabi Tel Aviv vs Hapoel', 'Sports', '2026-09-10', 'Menora Mivtachim Arena', 'SPR901234', 180, 200, 2, 'available', true, NULL, '2026-05-13 11:00:00', '2026-05-13 11:00:00'),
(105, 'InDNegev Festival 2026', 'Festival', '2026-10-01', 'Negev Desert', 'FES567890', 350, 400, 3, 'completed', true, 4, '2026-05-14 09:00:00', '2026-05-15 14:00:00');

INSERT INTO transactions
(transaction_id, ticket_id, buyer_id, seller_id, status, ticket_released, buyer_fee, seller_fee, total_price, create_date, update_date)
VALUES
(1001, 105, 4, 3, 'completed', true, 20, 12, 400, '2026-05-16 10:00:00', '2026-05-16 10:30:00'),
(1002, 101, 5, 2, 'escrow_pending', false, 12.5, 7.5, 250, '2026-05-17 09:15:00', '2026-05-17 09:15:00'),
(1003, 102, 2, 3, 'ticket_released', true, 7.5, 4.5, 150, '2026-05-18 18:45:00', '2026-05-18 19:00:00');

INSERT INTO favorites
(user_id, ticket_id)
VALUES
(1, 101),
(1, 102),
(2, 104),
(5, 101);