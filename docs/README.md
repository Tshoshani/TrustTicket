# TrustTicket - Backend API

A REST API for a secure ticket resale marketplace built with Node.js and Express.  
All data is stored in-memory (mock data) and resets when the server restarts.

## Setup & Run

### Prerequisites
- Node.js (v18+)

### Install dependencies
```bash
npm install
```

### Start the server
```bash
npm start
```

### Port & Base URL
- **Port:** 3000
- **Base URL:** http://localhost:3000

## Assumptions
- IDs are auto-generated using `Math.max(existingIds) + 1` to avoid duplicates after deletions.
- Ticket IDs start at 101, User IDs start at 1.
- Authentication is simulated via the `x-user-role` header (no real login system). Set it to `admin`, `manager`, or `user`.
- Transactions simulate the TrustTicket escrow flow with mock fields only. There are no real payments, escrow providers, or external services.
- Data resets on server restart (in-memory only).

---

## API Reference

All responses follow a consistent JSON format:

**Success:**
```json
{
  "success": true,
  "data": <object or array>,
  "error": null
}
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Authentication

Set the `x-user-role` header on requests to simulate roles:
| Role      | Permissions |
|-----------|-------------|
| `admin`   | Full access (CRUD on users, tickets, and transactions) |
| `manager` | Read all users, update users |
| `user`    | Browse tickets, create/update tickets, create/read transactions, view dashboards |

---

## Root API

### GET /
Returns a simple welcome response. No role restriction.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "message": "Welcome to Trust Ticket API" },
  "error": null
}
```

---

## Users API

### GET /users
Returns all users. Requires role: `admin` or `manager`.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "firstName": "Tomer",
      "lastName": "Shoshani",
      "createDate": "2026-05-01T10:00:00Z",
      "updateDate": "2026-05-01T10:00:00Z",
      "userRole": "admin"
    }
  ],
  "error": null
}
```

### GET /users/:id
Returns a single user by ID. No role restriction.

**Response:** `200 OK` or `404 Not Found`

### POST /users
Creates a new user. Requires role: `admin`.

**Request body:**
```json
{
  "firstName": "Noa",
  "lastName": "Levi",
  "userRole": "user"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { "userId": 6 },
  "error": null
}
```

**Validation error:** `400 Bad Request`
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field(s): firstName",
    "details": { "missing": ["firstName"] }
  }
}
```

### PUT /users/:id
Updates an existing user. Requires role: `admin` or `manager`.

**Request body:**
```json
{
  "firstName": "Noa",
  "lastName": "Levi",
  "userRole": "manager"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "userId": 3 },
  "error": null
}
```

### DELETE /users/:id
Deletes a user. Requires role: `admin`.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "userId": 3 },
  "error": null
}
```

---

## Tickets API

### GET /tickets
Returns all tickets. No role restriction.

**Query parameters (optional):**
| Param       | Description                        |
|-------------|------------------------------------|
| `eventType` | Filter by event type (e.g., Concert, Party, Standup, Sports, Festival) |
| `status`    | Filter by status (e.g., available, sold) |

**Example:** `GET /tickets?eventType=Concert&status=available`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
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
    }
  ],
  "error": null
}
```

### GET /tickets/:id
Returns a single ticket by ID. No role restriction.

**Response:** `200 OK` or `404 Not Found`

### POST /tickets
Creates a new ticket listing. Requires role: `user` or `admin`.

**Request body:**
```json
{
  "eventName": "Static & Ben El Concert",
  "eventType": "Concert",
  "eventDate": "2026-11-15",
  "venue": "Caesarea Amphitheatre",
  "barcode": "NEW123456",
  "originalPrice": 300,
  "salePrice": 350,
  "sellerId": 2
}
```

**Required fields:** `eventName`, `eventType`, `eventDate`, `barcode`, `salePrice`, `sellerId`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { "ticketId": 106 },
  "error": null
}
```

### PUT /tickets/:id
Updates a ticket. Requires role: `user` or `admin`.

**Request body:**
```json
{
  "eventName": "Omer Adam Live",
  "eventType": "Concert",
  "eventDate": "2026-07-20",
  "venue": "Bloomfield Stadium, Tel Aviv",
  "barcode": "XYZ123456",
  "originalPrice": 220,
  "salePrice": 280,
  "sellerId": 2,
  "status": "available"
}
```

**Required fields:** `eventName`, `eventType`, `eventDate`, `barcode`, `salePrice`, `sellerId`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "ticketId": 101 },
  "error": null
}
```

### DELETE /tickets/:id
Deletes a ticket. Requires role: `admin`.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "ticketId": 101 },
  "error": null
}
```

---

## Transactions API

Transactions represent a simulated TrustTicket escrow flow. A transaction connects a buyer, seller, and ticket, then tracks whether the ticket was released and whether the escrow-like process is still open or completed. This is mock data only; it does not process real payments.

### GET /transactions
Returns all transactions. Requires role: `admin` or `user`.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
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
    }
  ],
  "error": null
}
```

### GET /transactions/:id
Returns a single transaction by ID. Requires role: `admin` or `user`.

**Response:** `200 OK` or `404 Not Found`

### POST /transactions
Creates a new mock escrow transaction. Requires role: `admin` or `user`.

**Request body:**
```json
{
  "ticketId": 101,
  "buyerId": 5,
  "sellerId": 2,
  "totalPrice": 250
}
```

**Required fields:** `ticketId`, `buyerId`, `sellerId`, `totalPrice`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { "transactionId": 1004 },
  "error": null
}
```

**Validation error:** `400 Bad Request`
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field(s): buyerId, sellerId, totalPrice",
    "details": { "missing": ["buyerId", "sellerId", "totalPrice"] }
  }
}
```

### PUT /transactions/:id
Updates an existing transaction. Requires role: `admin`.

**Request body:**
```json
{
  "ticketId": 101,
  "buyerId": 5,
  "sellerId": 2,
  "totalPrice": 250,
  "status": "completed",
  "ticketReleased": true
}
```

**Required fields:** `ticketId`, `buyerId`, `sellerId`, `totalPrice`, `status`, `ticketReleased`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "transactionId": 1002 },
  "error": null
}
```

**Forbidden error:** `403 Forbidden`
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": { "requiredRoles": ["admin"], "yourRole": "user" }
  }
}
```

### DELETE /transactions/:id
Deletes a transaction. Requires role: `admin`.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "transactionId": 1003 },
  "error": null
}
```

---

## Dashboard API

### GET /dashboard/:userId
Returns a personal dashboard for a user. Requires role: `admin` or `user`.

The dashboard combines mock user, ticket, and transaction data:
- `activeListings`
- `openTransactions`
- `purchaseHistory`
- `salesHistory`
- `pendingEscrowBalance`
- `releasedEarnings`
- `successfulTransactions`
- `rating`, if the user mock data includes one

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "activeListings": [],
    "openTransactions": [],
    "purchaseHistory": [],
    "salesHistory": [],
    "pendingEscrowBalance": 0,
    "releasedEarnings": 0,
    "successfulTransactions": 0
  },
  "error": null
}
```

**Not found error:** `404 Not Found`
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "User with ID 999 not found",
    "details": {}
  }
}
```

---

## Error Codes

| Code               | Status | Description |
|--------------------|--------|-------------|
| `VALIDATION_ERROR` | 400    | Missing or invalid fields |
| `FORBIDDEN`        | 403    | Insufficient role/permissions |
| `NOT_FOUND`        | 404    | Resource not found |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## Postman Collection

Import the file `docs/TrustTicket.postman_collection.json` into Postman to test all endpoints.
The collection is organized into **General**, **Users**, **Tickets**, **Transactions**, and **Dashboard** folders.
