/**
 * models/transactions.js - In-memory mock data for the Transactions resource.
 * Transactions simulate the TrustTicket escrow flow. No real payment,
 * escrow provider, or database is used.
 *
 * Transaction fields:
 *   transactionId  - Unique numeric identifier
 *   ticketId       - ID of the ticket being purchased
 *   buyerId        - userId of the buyer
 *   sellerId       - userId of the seller
 *   status         - Current simulated escrow status
 *   ticketReleased - Whether the ticket has been released to the buyer
 *   buyerFee       - Mock fee paid by the buyer
 *   sellerFee      - Mock fee paid by the seller
 *   totalPrice     - Total ticket price before seller fee
 *   createDate     - ISO timestamp of when the transaction was created
 *   updateDate     - ISO timestamp of the last update
 */
const transactions = [
  {
    "transactionId": 1001,
    "ticketId": 105,
    "buyerId": 4,
    "sellerId": 3,
    "status": "completed",
    "ticketReleased": true,
    "buyerFee": 20,
    "sellerFee": 12,
    "totalPrice": 400,
    "createDate": "2026-05-16T10:00:00Z",
    "updateDate": "2026-05-16T10:30:00Z"
  },
  {
    "transactionId": 1002,
    "ticketId": 101,
    "buyerId": 5,
    "sellerId": 2,
    "status": "escrow_pending",
    "ticketReleased": false,
    "buyerFee": 12.5,
    "sellerFee": 7.5,
    "totalPrice": 250,
    "createDate": "2026-05-17T09:15:00Z",
    "updateDate": "2026-05-17T09:15:00Z"
  },
  {
    "transactionId": 1003,
    "ticketId": 102,
    "buyerId": 2,
    "sellerId": 3,
    "status": "ticket_released",
    "ticketReleased": true,
    "buyerFee": 7.5,
    "sellerFee": 4.5,
    "totalPrice": 150,
    "createDate": "2026-05-18T18:45:00Z",
    "updateDate": "2026-05-18T19:00:00Z"
  }
];

module.exports = transactions;
