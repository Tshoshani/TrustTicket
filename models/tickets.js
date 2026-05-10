/**
 * models/tickets.js — In-memory mock data for the Tickets resource.
 * This array acts as a simple database. All changes (create, update, delete)
 * happen in-memory and are lost when the server restarts.
 *
 * Ticket fields:
 *   ticketId      — Unique numeric identifier (auto-generated, starts at 101)
 *   eventName     — Name/title of the event
 *   eventType     — Category: "Concert", "Party", "Standup", "Sports", "Festival"
 *   eventDate     — Date of the event (YYYY-MM-DD)
 *   venue         — Location/venue name
 *   barcode       — The ticket's unique barcode string
 *   originalPrice — The price the seller originally paid
 *   salePrice     — The resale price listed by the seller
 *   sellerId      — userId of the seller who listed this ticket
 *   status        — "available" or "sold"
 *   createDate    — ISO timestamp of when the listing was created
 *   updateDate    — ISO timestamp of the last update
 */
const tickets = [
  {
    "ticketId": 101,
    "eventName": "Omer Adam Live",
    "eventType": "Concert",
    "eventDate": "2026-07-20",
    "venue": "Bloomfield Stadium, Tel Aviv",
    "barcode": "XYZ123456",
    "originalPrice": 220,
    "salePrice": 250,
    "sellerId": 2,
    "status": "available",
    "createDate": "2026-05-10T08:00:00Z",
    "updateDate": "2026-05-10T08:00:00Z"
  },
  {
    "ticketId": 102,
    "eventName": "Noga Erez DJ Set",
    "eventType": "Party",
    "eventDate": "2026-06-15",
    "venue": "The Block, Tel Aviv",
    "barcode": "ABC789012",
    "originalPrice": 120,
    "salePrice": 150,
    "sellerId": 3,
    "status": "available",
    "createDate": "2026-05-11T10:30:00Z",
    "updateDate": "2026-05-11T10:30:00Z"
  },
  {
    "ticketId": 103,
    "eventName": "Shaanan Streett Standup",
    "eventType": "Standup",
    "eventDate": "2026-08-05",
    "venue": "Zappa Herzliya",
    "barcode": "STU345678",
    "originalPrice": 90,
    "salePrice": 100,
    "sellerId": 5,
    "status": "available",
    "createDate": "2026-05-12T15:00:00Z",
    "updateDate": "2026-05-12T15:00:00Z"
  },
  {
    "ticketId": 104,
    "eventName": "Maccabi Tel Aviv vs Hapoel",
    "eventType": "Sports",
    "eventDate": "2026-09-10",
    "venue": "Menora Mivtachim Arena",
    "barcode": "SPR901234",
    "originalPrice": 180,
    "salePrice": 200,
    "sellerId": 2,
    "status": "available",
    "createDate": "2026-05-13T11:00:00Z",
    "updateDate": "2026-05-13T11:00:00Z"
  },
  {
    "ticketId": 105,
    "eventName": "InDNegev Festival 2026",
    "eventType": "Festival",
    "eventDate": "2026-10-01",
    "venue": "Negev Desert",
    "barcode": "FES567890",
    "originalPrice": 350,
    "salePrice": 400,
    "sellerId": 3,
    "status": "sold",
    "createDate": "2026-05-14T09:00:00Z",
    "updateDate": "2026-05-15T14:00:00Z"
  }
];

module.exports = tickets;
