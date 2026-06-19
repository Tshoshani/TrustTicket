# TrustTicket API Documentation

Complete API reference for the TrustTicket backend.

## Base URL

```
http://localhost:3000
```

## Authentication

The API uses role-based access control via headers.

### Set Header on All Requests

```
x-user-role: admin | manager | user
```

### Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ },
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

---

## API Endpoints

### Root

#### GET /
Welcome endpoint

**Response:**
```json
{
  "success": true,
  "data": { "message": "Welcome to Trust Ticket API" },
  "error": null
}
```

---

## Users Endpoints

### GET /users
Get all users

**Required Role:** admin, manager

**Response:**
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

---

### GET /users/:id
Get single user by ID

**Parameters:**
- `id` (path) - User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "firstName": "Tomer",
    "lastName": "Shoshani",
    "createDate": "2026-05-01T10:00:00Z",
    "updateDate": "2026-05-01T10:00:00Z",
    "userRole": "admin"
  },
  "error": null
}
```

---

### POST /users
Create new user

**Required Role:** admin

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userRole": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "userId": 6 },
  "error": null
}
```

**Validation Error:**
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

---

### PUT /users/:id
Update user

**Required Role:** admin, manager

**Parameters:**
- `id` (path) - User ID

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userRole": "manager"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "userId": 3 },
  "error": null
}
```

---

### DELETE /users/:id
Delete user

**Required Role:** admin

**Parameters:**
- `id` (path) - User ID

**Response:**
```json
{
  "success": true,
  "data": { "userId": 3 },
  "error": null
}
```

---

## Tickets Endpoints

### GET /tickets
Get all tickets with optional filters

**Query Parameters:**
- `eventType` (optional) - Filter by event type
- `status` (optional) - Filter by status

**Example:** `/tickets?eventType=Concert&status=available`

**Response:**
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

---

### GET /tickets/:id
Get single ticket by ID

**Parameters:**
- `id` (path) - Ticket ID

**Response:**
```json
{
  "success": true,
  "data": {
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
  "error": null
}
```

---

### POST /tickets
Create new ticket

**Required Role:** user, admin

**Request Body:**
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

**Required Fields:** eventName, eventType, eventDate, barcode, salePrice, sellerId

**Response:**
```json
{
  "success": true,
  "data": { "ticketId": 106 },
  "error": null
}
```

---

### PUT /tickets/:id
Update ticket

**Required Role:** user, admin

**Parameters:**
- `id` (path) - Ticket ID

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "data": { "ticketId": 101 },
  "error": null
}
```

---

### DELETE /tickets/:id
Delete ticket

**Required Role:** admin

**Parameters:**
- `id` (path) - Ticket ID

**Response:**
```json
{
  "success": true,
  "data": { "ticketId": 101 },
  "error": null
}
```

---

## Transactions Endpoints

### GET /transactions
Get all transactions

**Required Role:** admin, user

**Response:**
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

---

### GET /transactions/:id
Get single transaction

**Required Role:** admin, user

**Parameters:**
- `id` (path) - Transaction ID

**Response:**
```json
{
  "success": true,
  "data": {
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
  "error": null
}
```

---

### POST /transactions
Create new transaction

**Required Role:** admin, user

**Request Body:**
```json
{
  "ticketId": 101,
  "buyerId": 5,
  "sellerId": 2,
  "totalPrice": 250
}
```

**Required Fields:** ticketId, buyerId, sellerId, totalPrice

**Response:**
```json
{
  "success": true,
  "data": { "transactionId": 1004 },
  "error": null
}
```

---

### PUT /transactions/:id
Update transaction

**Required Role:** admin

**Parameters:**
- `id` (path) - Transaction ID

**Request Body:**
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

**Required Fields:** ticketId, buyerId, sellerId, totalPrice, status, ticketReleased

**Response:**
```json
{
  "success": true,
  "data": { "transactionId": 1002 },
  "error": null
}
```

---

### DELETE /transactions/:id
Delete transaction

**Required Role:** admin

**Parameters:**
- `id` (path) - Transaction ID

**Response:**
```json
{
  "success": true,
  "data": { "transactionId": 1003 },
  "error": null
}
```

---

## Dashboard Endpoints

### GET /dashboard/:userId
Get user dashboard with statistics

**Required Role:** admin, user

**Parameters:**
- `userId` (path) - User ID

**Response:**
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

---

## Error Responses

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Missing or invalid fields |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| INTERNAL_SERVER_ERROR | 500 | Server error |

### Example Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": {
      "requiredRoles": ["admin"],
      "yourRole": "user"
    }
  }
}
```

---

## Testing with Postman

### Setup

1. Create new environment with variable:
   - `baseURL`: http://localhost:3000

2. In each request, add Header:
   - Key: `x-user-role`
   - Value: `admin` | `manager` | `user`

### Example Request

**GET All Tickets**
```
GET {{baseURL}}/tickets
Headers:
  x-user-role: user
  Content-Type: application/json
```

---

## Rate Limiting

No rate limiting is currently implemented. Use responsibly in production.

---

## Data Types

### User
- `userId` (number) - Unique identifier
- `firstName` (string) - First name
- `lastName` (string) - Last name
- `userRole` (string) - admin | manager | user
- `createDate` (ISO 8601) - Creation timestamp
- `updateDate` (ISO 8601) - Last update timestamp

### Ticket
- `ticketId` (number) - Unique identifier (starts at 101)
- `eventName` (string) - Event name
- `eventType` (string) - Concert | Party | Standup | Sports | Festival
- `eventDate` (ISO 8601) - Event date
- `venue` (string) - Event venue
- `barcode` (string) - Ticket barcode
- `originalPrice` (number) - Original price
- `salePrice` (number) - Current sale price
- `sellerId` (number) - Seller user ID
- `status` (string) - available | sold | pending
- `createDate` (ISO 8601) - Creation timestamp
- `updateDate` (ISO 8601) - Last update timestamp

### Transaction
- `transactionId` (number) - Unique identifier
- `ticketId` (number) - Related ticket ID
- `buyerId` (number) - Buyer user ID
- `sellerId` (number) - Seller user ID
- `status` (string) - pending | completed | cancelled
- `ticketReleased` (boolean) - Whether ticket released to buyer
- `buyerFee` (number) - Fee charged to buyer
- `sellerFee` (number) - Fee charged to seller
- `totalPrice` (number) - Total transaction price
- `createDate` (ISO 8601) - Creation timestamp
- `updateDate` (ISO 8601) - Last update timestamp

---

## Notes

- Data is stored in-memory and resets on server restart
- IDs are auto-generated using `Math.max(existingIds) + 1`
- No real payment processing (mock only)
- No authentication tokens (role-based via headers)

---

**API Documentation - TrustTicket Backend**
Last Updated: June 2026
