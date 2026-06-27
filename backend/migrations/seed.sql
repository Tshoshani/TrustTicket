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
(101, 'Omer Adam Live', 'Concert', '2026-07-20', 'Bloomfield Stadium, Tel Aviv', 'XYZ123456', 320, 360, 2, 'available', true, NULL, '2026-05-10 08:00:00', '2026-05-10 08:00:00'),
(102, 'Noga Erez DJ Set', 'Party', '2026-06-15', 'The Block, Tel Aviv', 'ABC789012', 140, 160, 3, 'available', true, NULL, '2026-05-11 10:30:00', '2026-05-11 10:30:00'),
(103, 'Shaanan Streett Standup', 'Standup', '2026-08-05', 'Zappa Herzliya', 'STU345678', 120, 130, 5, 'pending', false, NULL, '2026-05-12 15:00:00', '2026-05-12 15:00:00'),
(104, 'Maccabi Tel Aviv vs Hapoel', 'Sports', '2026-09-10', 'Menora Mivtachim Arena', 'SPR901234', 180, 210, 2, 'available', true, NULL, '2026-05-13 11:00:00', '2026-05-13 11:00:00'),
(105, 'InDNegev Festival 2026', 'Festival', '2026-10-01', 'Negev Desert', 'FES567890', 450, 480, 3, 'completed', true, 4, '2026-05-14 09:00:00', '2026-05-15 14:00:00');

INSERT INTO transactions
(transaction_id, ticket_id, buyer_id, seller_id, status, ticket_released, buyer_fee, seller_fee, total_price, create_date, update_date)
VALUES
(1001, 105, 4, 3, 'completed', true, 12, 12, 480, '2026-05-16 10:00:00', '2026-05-16 10:30:00'),
(1002, 101, 5, 2, 'escrow_pending', false, 9, 9, 360, '2026-05-17 09:15:00', '2026-05-17 09:15:00'),
(1003, 102, 2, 3, 'ticket_released', true, 4, 4, 160, '2026-05-18 18:45:00', '2026-05-18 19:00:00');

-- Additional marketplace listings for a richer catalog.
INSERT INTO tickets
(ticket_id, event_name, event_type, event_date, venue, barcode, original_price, sale_price, seller_id, status, verified, buyer_id, create_date, update_date)
VALUES
(106, 'Coldplay - Music of the Spheres', 'Concert', '2026-08-12', 'Park HaYarkon, Tel Aviv', 'CP202608', 590, 720, 2, 'available', true, NULL, '2026-05-20 09:00:00', '2026-05-20 09:00:00'),
(107, 'Static & Ben El Live', 'Concert', '2026-07-30', 'Live Park, Rishon LeZion', 'SBE07301', 240, 270, 3, 'available', true, NULL, '2026-05-20 10:00:00', '2026-05-20 10:00:00'),
(108, 'Eyal Golan in Concert', 'Concert', '2026-09-05', 'Caesarea Amphitheater', 'EG090526', 320, 350, 4, 'available', true, NULL, '2026-05-21 11:00:00', '2026-05-21 11:00:00'),
(109, 'Red Hot Chili Peppers', 'Concert', '2026-07-18', 'Park HaYarkon, Tel Aviv', 'RHCP0718', 650, 820, 2, 'available', true, NULL, '2026-05-21 12:00:00', '2026-05-21 12:00:00'),
(110, 'Maccabi TLV vs Real Madrid', 'Sports', '2026-10-22', 'Menora Mivtachim Arena', 'EURO1022', 350, 420, 5, 'available', true, NULL, '2026-05-22 13:00:00', '2026-05-22 13:00:00'),
(111, 'Hapoel TLV vs Maccabi Haifa', 'Sports', '2026-08-29', 'Bloomfield Stadium, Tel Aviv', 'HAP08291', 130, 150, 3, 'available', true, NULL, '2026-05-22 14:00:00', '2026-05-22 14:00:00'),
(112, 'Fortissimo Rock Festival', 'Festival', '2026-09-19', 'Caesarea Amphitheater', 'FORT0919', 380, 430, 2, 'available', true, NULL, '2026-05-23 09:30:00', '2026-05-23 09:30:00'),
(113, 'Tel Aviv Jazz Festival', 'Festival', '2026-11-07', 'Charles Bronfman Auditorium', 'JAZZ1107', 220, 240, 4, 'available', true, NULL, '2026-05-23 10:30:00', '2026-05-23 10:30:00'),
(114, 'Shalom Hanoch Standup Night', 'Standup', '2026-07-25', 'Zappa, Tel Aviv', 'STND0725', 140, 160, 5, 'available', true, NULL, '2026-05-24 15:00:00', '2026-05-24 15:00:00'),
(115, 'Habima Theater - Hamlet', 'Theater', '2026-10-03', 'Habima National Theater', 'HAML1003', 180, 200, 3, 'available', true, NULL, '2026-05-24 16:00:00', '2026-05-24 16:00:00'),
(116, 'New Year Beach Party 2027', 'Party', '2026-12-31', 'Gordon Beach, Tel Aviv', 'NYE12311', 220, 320, 4, 'available', true, NULL, '2026-05-25 17:00:00', '2026-05-25 17:00:00'),
(117, 'Eden Ben Zaken Live', 'Concert', '2026-08-08', 'Caesarea Amphitheater', 'EBZ08081', 280, 310, 2, 'available', true, NULL, '2026-05-25 18:00:00', '2026-05-25 18:00:00'),
(118, 'Euroleague Final Four', 'Sports', '2026-05-29', 'Menora Mivtachim Arena', 'F4052926', 500, 650, 5, 'pending', false, NULL, '2026-05-26 09:00:00', '2026-05-26 09:00:00'),
(119, 'Comedy Bar - Open Mic Special', 'Standup', '2026-07-14', 'Comedy Bar, Tel Aviv', 'CMDY0714', 80, 95, 3, 'available', true, NULL, '2026-05-26 10:00:00', '2026-05-26 10:00:00'),
(120, 'InDNegev Desert Festival', 'Festival', '2026-10-15', 'Mitzpe Gvulot, Negev', 'IND10152', 420, 470, 4, 'pending', false, NULL, '2026-05-27 11:00:00', '2026-05-27 11:00:00');

-- Extra catalog so there is always plenty available to buy in a demo.
INSERT INTO tickets
(ticket_id, event_name, event_type, event_date, venue, barcode, original_price, sale_price, seller_id, status, verified, buyer_id, create_date, update_date)
VALUES
(121, 'Bruno Mars Live', 'Concert', '2026-08-22', 'Park HaYarkon, Tel Aviv', 'BM082226', 620, 780, 3, 'available', true, NULL, '2026-05-28 09:00:00', '2026-05-28 09:00:00'),
(122, 'Hapoel Jerusalem vs Maccabi TLV', 'Sports', '2026-09-14', 'Pais Arena, Jerusalem', 'HJ091426', 160, 190, 4, 'available', true, NULL, '2026-05-28 10:00:00', '2026-05-28 10:00:00'),
(123, 'Rita Live in Concert', 'Concert', '2026-07-29', 'Caesarea Amphitheater', 'RITA0729', 300, 330, 5, 'available', true, NULL, '2026-05-28 11:00:00', '2026-05-28 11:00:00'),
(124, 'Tel Aviv Pride Party', 'Party', '2026-06-12', 'Gordon Beach, Tel Aviv', 'PRIDE612', 180, 220, 3, 'available', true, NULL, '2026-05-28 12:00:00', '2026-05-28 12:00:00'),
(125, 'Hadag Nahash Live', 'Concert', '2026-09-26', 'Zappa Amphi, Shuni', 'HDN09261', 210, 240, 4, 'available', true, NULL, '2026-05-29 09:00:00', '2026-05-29 09:00:00'),
(126, 'Comedy Central Live TLV', 'Standup', '2026-08-18', 'Zappa, Tel Aviv', 'CCL08181', 110, 125, 5, 'available', true, NULL, '2026-05-29 10:00:00', '2026-05-29 10:00:00'),
(127, 'Cameri Theater - Les Miserables', 'Theater', '2026-10-09', 'Cameri Theater, Tel Aviv', 'LESM1009', 240, 270, 3, 'available', true, NULL, '2026-05-29 11:00:00', '2026-05-29 11:00:00'),
(128, 'Maccabi Haifa vs Beitar Jerusalem', 'Sports', '2026-09-21', 'Sammy Ofer Stadium, Haifa', 'MHB09211', 140, 165, 4, 'available', true, NULL, '2026-05-29 12:00:00', '2026-05-29 12:00:00'),
(129, 'Summer Beats Rooftop Party', 'Party', '2026-07-11', 'Herzliya Marina Rooftop', 'SBRP0711', 160, 200, 5, 'available', true, NULL, '2026-05-30 09:00:00', '2026-05-30 09:00:00'),
(130, 'Ivri Lider Live', 'Concert', '2026-08-27', 'Live Park, Rishon LeZion', 'IVRI0827', 250, 280, 3, 'available', true, NULL, '2026-05-30 10:00:00', '2026-05-30 10:00:00'),
(131, 'Tamuz Electronic Festival', 'Festival', '2026-09-12', 'Ganei Yehoshua, Tel Aviv', 'TAMUZ912', 360, 400, 4, 'pending', false, NULL, '2026-05-30 11:00:00', '2026-05-30 11:00:00'),
(132, 'Idan Raichel Project', 'Concert', '2026-10-18', 'Charles Bronfman Auditorium', 'IRP10181', 280, 300, 5, 'pending', false, NULL, '2026-05-30 12:00:00', '2026-05-30 12:00:00');

INSERT INTO favorites
(user_id, ticket_id)
VALUES
(1, 101),
(1, 102),
(2, 104),
(5, 101),
(2, 109),
(3, 106),
(5, 110),
(1, 117);
-- Generated user reviews (one-to-many: User hasMany Review)
INSERT INTO reviews (user_id, reviewer_name, rating, comment, create_date)
VALUES
(1, 'Daniel R.', 5.0, 'Ticket worked perfectly at the entrance.', '2026-01-01 09:00:00'),
(1, 'Maya L.', 5.0, 'Great communication and quick delivery.', '2026-02-08 10:00:00'),
(1, 'Yossi B.', 5.0, 'Ticket worked perfectly at the entrance.', '2026-03-15 11:00:00'),
(1, 'Tamar K.', 5.0, 'Exactly as described, zero issues.', '2026-04-22 12:00:00'),
(1, 'Omer S.', 5.0, 'Ticket worked perfectly at the entrance.', '2026-05-03 13:00:00'),
(1, 'Shira G.', 5.0, 'Ticket worked perfectly at the entrance.', '2026-01-10 14:00:00'),
(1, 'Avi M.', 5.0, 'Fast, reliable and friendly — would buy again.', '2026-02-17 15:00:00'),
(1, 'Noa P.', 5.0, 'Smooth transaction, highly recommend!', '2026-03-24 16:00:00'),
(1, 'Eitan D.', 5.0, 'Ticket worked perfectly at the entrance.', '2026-04-05 09:00:00'),
(1, 'Rotem F.', 4.0, 'All good, response was a little slow but fine.', '2026-05-12 10:00:00'),
(1, 'Lior A.', 5.0, 'Fast, reliable and friendly — would buy again.', '2026-01-19 11:00:00'),
(1, 'Gal H.', 5.0, 'Got my ticket within minutes, perfect.', '2026-02-26 12:00:00'),
(1, 'Hadar T.', 5.0, 'Ticket worked perfectly at the entrance.', '2026-03-07 13:00:00'),
(1, 'Nadav C.', 5.0, 'Got my ticket within minutes, perfect.', '2026-04-14 14:00:00'),
(1, 'Yael Z.', 5.0, 'Fast, reliable and friendly — would buy again.', '2026-05-21 15:00:00'),
(1, 'Ido N.', 5.0, 'Exactly as described, zero issues.', '2026-01-02 16:00:00'),
(1, 'Michal V.', 5.0, 'Trustworthy seller, everything went smoothly.', '2026-02-09 09:00:00'),
(1, 'Roi E.', 5.0, 'Fast, reliable and friendly — would buy again.', '2026-03-16 10:00:00'),
(1, 'Dana W.', 5.0, 'Ticket worked perfectly at the entrance.', '2026-04-23 11:00:00'),
(1, 'Tom Y.', 4.0, 'All good, response was a little slow but fine.', '2026-05-04 12:00:00'),
(2, 'Aviv L.', 5.0, 'Great communication and quick delivery.', '2026-01-01 09:00:00'),
(2, 'Shani R.', 5.0, 'Honest seller, real ticket, great price.', '2026-02-08 10:00:00'),
(2, 'Or M.', 5.0, 'Honest seller, real ticket, great price.', '2026-03-15 11:00:00'),
(2, 'Bar K.', 5.0, 'Trustworthy seller, everything went smoothly.', '2026-04-22 12:00:00'),
(2, 'Elad S.', 4.0, 'Good experience overall, ticket was valid.', '2026-05-03 13:00:00'),
(2, 'Inbal D.', 5.0, 'Exactly as described, zero issues.', '2026-01-10 14:00:00'),
(2, 'Niv G.', 5.0, 'Exactly as described, zero issues.', '2026-02-17 15:00:00'),
(2, 'Liel T.', 5.0, 'Ticket worked perfectly at the entrance.', '2026-03-24 16:00:00'),
(2, 'Daniel R.', 5.0, 'Smooth transaction, highly recommend!', '2026-04-05 09:00:00'),
(2, 'Maya L.', 4.0, 'Smooth enough, no real complaints.', '2026-05-12 10:00:00'),
(2, 'Yossi B.', 5.0, 'Trustworthy seller, everything went smoothly.', '2026-01-19 11:00:00'),
(3, 'Tamar K.', 5.0, 'Exactly as described, zero issues.', '2026-01-01 09:00:00'),
(3, 'Omer S.', 4.0, 'Smooth enough, no real complaints.', '2026-02-08 10:00:00'),
(3, 'Shira G.', 5.0, 'Fast, reliable and friendly — would buy again.', '2026-03-15 11:00:00'),
(3, 'Avi M.', 4.0, 'Smooth enough, no real complaints.', '2026-04-22 12:00:00'),
(3, 'Noa P.', 5.0, 'Great communication and quick delivery.', '2026-05-03 13:00:00'),
(3, 'Eitan D.', 4.0, 'Smooth enough, no real complaints.', '2026-01-10 14:00:00'),
(4, 'Rotem F.', 5.0, 'Honest seller, real ticket, great price.', '2026-01-01 09:00:00'),
(4, 'Lior A.', 5.0, 'Smooth transaction, highly recommend!', '2026-02-08 10:00:00'),
(4, 'Gal H.', 5.0, 'Honest seller, real ticket, great price.', '2026-03-15 11:00:00'),
(4, 'Hadar T.', 5.0, 'Fast, reliable and friendly — would buy again.', '2026-04-22 12:00:00'),
(4, 'Nadav C.', 5.0, 'Smooth transaction, highly recommend!', '2026-05-03 13:00:00'),
(4, 'Yael Z.', 5.0, 'Honest seller, real ticket, great price.', '2026-01-10 14:00:00'),
(4, 'Ido N.', 5.0, 'Great communication and quick delivery.', '2026-02-17 15:00:00'),
(4, 'Michal V.', 5.0, 'Smooth transaction, highly recommend!', '2026-03-24 16:00:00'),
(4, 'Roi E.', 5.0, 'Exactly as described, zero issues.', '2026-04-05 09:00:00'),
(4, 'Dana W.', 4.0, 'Smooth enough, no real complaints.', '2026-05-12 10:00:00'),
(4, 'Tom Y.', 5.0, 'Exactly as described, zero issues.', '2026-01-19 11:00:00'),
(4, 'Aviv L.', 5.0, 'Honest seller, real ticket, great price.', '2026-02-26 12:00:00'),
(4, 'Shani R.', 5.0, 'Trustworthy seller, everything went smoothly.', '2026-03-07 13:00:00'),
(4, 'Or M.', 5.0, 'Great communication and quick delivery.', '2026-04-14 14:00:00'),
(4, 'Bar K.', 5.0, 'Got my ticket within minutes, perfect.', '2026-05-21 15:00:00'),
(5, 'Elad S.', 5.0, 'Trustworthy seller, everything went smoothly.', '2026-01-01 09:00:00'),
(5, 'Inbal D.', 4.0, 'Smooth enough, no real complaints.', '2026-02-08 10:00:00');

-- Realistic profile photos (fallback to initials avatar in the UI if offline)
UPDATE users SET avatar='https://randomuser.me/api/portraits/men/32.jpg'   WHERE user_id=1;
UPDATE users SET avatar='https://randomuser.me/api/portraits/men/45.jpg'   WHERE user_id=2;
UPDATE users SET avatar='https://randomuser.me/api/portraits/women/68.jpg' WHERE user_id=3;
UPDATE users SET avatar='https://randomuser.me/api/portraits/men/52.jpg'   WHERE user_id=4;
UPDATE users SET avatar='https://randomuser.me/api/portraits/women/30.jpg' WHERE user_id=5;
