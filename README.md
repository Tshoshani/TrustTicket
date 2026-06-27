# TrustTicket — Full‑Stack Ticket Resale Marketplace

A secure marketplace for reselling event tickets, built as a complete full‑stack
application: **React** frontend, **Node.js + Express** backend, **MySQL** database
accessed through the **Sequelize ORM**, **real‑time updates via Socket.IO**, and an
**AI ticket advisor** powered by Google Gemini (with a safe local fallback).

This repository is the Assignment 4 build (MySQL + ORM, WebSockets, AI). All data is
stored in MySQL and persists across server restarts.

---

## Project Purpose

TrustTicket lets users list event tickets for resale and lets other users buy them
safely through an escrow‑style flow:

- **Sellers** upload a ticket → an admin/manager runs AI verification → it goes live.
- **Buyers** purchase a verified ticket → money is held in escrow → the barcode is
  released and redeemed → the sale completes and the seller's trust rating updates.
- A **2.5% + 2.5%** platform fee (buyer + seller) is calculated on each transaction.
- Every seller has a public **profile with reviews** and a **trust rating**.
- An **AI advisor** recommends a fair price (in ₪) and flags buyer risk.
- A **live activity feed** shows marketplace events to all connected clients in real time.

Prices are in Israeli New Shekels (₪).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Fetch API |
| Backend | Node.js, Express 5 |
| Database | MySQL 8 |
| ORM | Sequelize 6 |
| Real‑time | Socket.IO 4 |
| AI | Google Gemini (REST) with local rule‑based fallback |

---

## Project Structure

```
TrustTicket/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express + HTTP + Socket.IO entry point
│   │   ├── socket.js          # Socket.IO real-time layer (events)
│   │   ├── config/database.js # Sequelize connection
│   │   └── services/aiService.js  # AI advisor (Gemini + local fallback)
│   ├── controllers/           # Request handlers (tickets, users, ai, ...)
│   ├── routes/                # Express routers
│   ├── models/                # Sequelize models + associations (index.js)
│   ├── migrations/
│   │   ├── schema.sql         # Database schema (tables)
│   │   └── seed.sql           # Seed data (users, tickets, reviews, ...)
│   ├── middleware/
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/             # Login, Dashboard, Profile, Settings, Admin, LiveUpdates, AIAdvisor
    │   ├── components/        # Card, Avatar, UserProfileModal, Navbar, Table, Stars, Footer
    │   ├── services/          # api.js (REST), socketService.js (Socket.IO)
    │   └── App.js
    └── package.json
```

---

## Prerequisites

- **Node.js** v18+ (developed on v24)
- **MySQL** 8.x running locally on port 3306

---

## Installation

```bash
# 1. Backend dependencies
cd backend
npm install

# 2. Frontend dependencies
cd ../frontend
npm install
```

---

## Database Setup

1. Make sure MySQL is running.
2. Create the schema and load the seed data (replace the path to `mysql` if needed):

```bash
# from the backend/ folder
mysql -u root -p < migrations/schema.sql
mysql -u root -p < migrations/seed.sql
```

On Windows the MySQL client is usually at
`C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`.

`schema.sql` **drops and recreates** the `trustticket` database, then creates all
tables. `seed.sql` inserts demo users, tickets, transactions, favorites, settings and
reviews. Re‑running `schema.sql` resets everything.

### Tables
`users`, `admins`, `settings`, `tickets`, `transactions`, `favorites` (junction),
`reviews`.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=trustticket
DB_USER=root
DB_PASSWORD=your_mysql_password

CLIENT_URL=http://localhost:5173

# AI
AI_PROVIDER=gemini                 # "gemini" (real LLM) or "local" (offline engine)
AI_API_KEY=your_gemini_api_key     # Google Gemini key (https://aistudio.google.com/apikey)
AI_MODEL=gemini-2.5-flash
AI_GROUNDING=true                  # let Gemini search the web for current prices
```

The frontend optionally reads `frontend/.env` (`PORT=5173`). The AI key lives **only**
in the backend `.env` and is never exposed to the frontend.

---

## Running the App

Open two terminals:

```bash
# Terminal 1 – backend (http://localhost:3000)
cd backend
npm start

# Terminal 2 – frontend (http://localhost:5173)
cd frontend
npm start
```

Then open http://localhost:5173.

### Demo Credentials (password for all: `password123`)

| Role | Email |
|------|-------|
| Admin | tomer@trustticket.com |
| Manager | amit@trustticket.com |
| User | shay@trustticket.com |
| User | noa@trustticket.com |
| User | dana@trustticket.com |

---

## ORM Setup

Sequelize models live in `backend/models/` and are wired together in
`backend/models/index.js`. Relationships implemented:

- **One‑to‑one:** `User` ↔ `Admin`, `User` ↔ `Setting`
- **One‑to‑many:** `User` → `Ticket` (seller / buyer), `User` → `Transaction`,
  `Ticket` → `Transaction`, **`User` → `Review`**
- **Many‑to‑many:** `User` ↔ `Ticket` through the **`Favorite`** junction table

Relational reads use Sequelize `include` (JOIN), e.g. tickets are returned with their
seller, and a user profile is returned with its reviews.

`GET /api/orm-test` returns live counts and a sample joined record to confirm the ORM
is connected.

---

## API Endpoints

All responses follow the Assignment 2 envelope:

```json
{ "success": true, "data": {}, "error": null }
{ "success": false, "data": null, "error": { "code": "", "message": "", "details": {} } }
```

Auth is simulated with headers: `x-user-role` (admin|manager|user) and `x-user-id`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Log in with email + password |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/users` | List users (admin/manager) |
| GET | `/api/users/me` | Current user (from `x-user-id`) |
| GET | `/api/users/:id` | Get a user |
| GET | `/api/users/:id/reviews` | Get a user's reviews |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/:id` | Update user (self or admin/manager) |
| DELETE | `/api/users/:id` | Delete user (admin) |
| GET | `/api/tickets` | List tickets (filters: `eventType,status,search,date,minPrice,maxPrice`) |
| GET | `/api/tickets/:id` | Get a ticket (with seller/buyer) |
| POST | `/api/tickets` | Create a listing |
| PUT | `/api/tickets/:id` | Update a listing |
| DELETE | `/api/tickets/:id` | Delete a listing (admin) |
| POST | `/api/tickets/:id/verify` | AI verification (admin/manager) |
| POST | `/api/tickets/:id/purchase` | Buy a ticket (creates a transaction) |
| POST | `/api/tickets/:id/redeem` | Redeem barcode / complete sale |
| GET | `/api/transactions` | List transactions |
| GET | `/api/transactions/:id` | Get a transaction (with ticket/buyer/seller) |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction (admin) |
| DELETE | `/api/transactions/:id` | Delete a transaction (admin) |
| GET | `/api/dashboard/:userId` | User dashboard summary |
| GET | `/api/settings` | Get current user settings |
| PUT | `/api/settings` | Update current user settings |
| POST | `/api/favorites` | Add a favorite (junction) |
| GET | `/api/favorites/user/:userId` | A user's favorite tickets |
| GET | `/api/favorites/ticket/:ticketId` | Users who favorited a ticket |
| DELETE | `/api/favorites/:userId/:ticketId` | Remove a favorite |
| POST | `/api/ai/ticket-advice` | AI price + risk advice (see below) |
| GET | `/api/db-test` | DB connection check |
| GET | `/api/orm-test` | ORM relationship check |

---

## WebSocket Feature (Socket.IO)

Real‑time **live marketplace feed**, visible to all connected clients (open the **Live**
page in two browser tabs to see it). The HTTP server and Socket.IO share port 3000.

Custom events (in addition to the built‑in `connect` / `disconnect`):

| Event | Direction | Trigger |
|-------|-----------|---------|
| `ticketCreated` | server → clients | a new ticket is listed |
| `ticketUpdated` | server → clients | a ticket is edited / verified |
| `ticketPurchased` | server → clients | a ticket is purchased |
| `announce` | client → server | a user sends a live message |
| `announcement` | server → clients | the server re‑broadcasts the message |

(`welcome` and `onlineCount` are also emitted for connection status.)

Frontend: `src/services/socketService.js` + the `LiveUpdates` page.

---

## AI Feature

An **AI Ticket Advisor** relevant to the marketplace domain:

- **Buyers** open the **AI Advisor** page, pick a real listing, and get an analysis of
  whether the price is fair, a fair price range, and a buyer risk level.
- **Sellers** click **"Get AI price recommendation"** inside the *List a Ticket* form to
  get a recommended list price before publishing, and can apply it with one click.

How it works:
- Endpoint: `POST /api/ai/ticket-advice` — accepts `{ ticketId }` (analyzes a real ticket
  from the DB) **or** ad‑hoc `{ eventType, originalPrice, salePrice?, eventDate? }`.
- The backend calls **Google Gemini** (`AI_MODEL`) with **Google Search grounding** so the
  model can reference current resale prices. The API key stays in the backend only.
- If no key is set, the quota is exceeded, or the provider errors, it **falls back to a
  local rule‑based engine** so the feature always returns a result.
- Response includes `riskLevel`, `priceRange {min,max}`, `recommendedPrice`,
  `recommendation`, `advice`, and `provider` (`gemini` or `local`).

Example request:

```json
POST /api/ai/ticket-advice
{ "ticketId": 109 }
```

---

## User Profiles & Reviews

Each user has a public profile (avatar, trust rating, successful deals) and a list of
reviews left by buyers. Click any seller on a ticket card, or the **"View seller profile
& reviews"** button in a ticket's details, to open it. Reviews are stored in the
`reviews` table (`User hasMany Review`).

---

## Known Limitations

- **Auth is simulated** via `x-user-role` / `x-user-id` headers (no real JWT/session) and
  passwords are stored in plaintext for the demo — not production‑ready.
- **AI free tier:** Google Gemini's free tier is rate‑limited. When the quota is hit the
  advisor automatically falls back to the local engine (response shows `provider: "local"`).
  Image generation is not available on the free tier.
- **Profile photos** use external portrait URLs (randomuser.me); if offline, the UI falls
  back to colored initials avatars.
- AI price advice is guidance only, not a guaranteed market value.
- No automated test suite; verification is manual / via the Postman collection.

---

## Submission Notes

`node_modules`, real `.env` files and real secrets are excluded from the ZIP. Use
`backend/.env.example` as the template and add your own MySQL password and Gemini key.
A Postman collection is included at `backend/docs/TrustTicket.postman_collection.json`.
