# TrustTicket Frontend

A React.js frontend application for the TrustTicket secure ticket resale marketplace. This application connects to the backend REST API and provides users with a complete interface for browsing, buying, and selling event tickets.

## Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Navbar.js           # Navigation bar component
│   ├── Footer.js           # Footer component
│   ├── Card.js             # Reusable ticket card component
│   └── Table.js            # Data table component
├── pages/                   # Main route pages
│   ├── Login.js            # Login page
│   ├── Dashboard.js        # Dashboard/home page
│   └── Settings.js         # User settings page
├── services/               # API communication
│   └── api.js              # API service with Fetch API
├── utils/                  # Helpers
│   └── theme.js            # Light/Dark/Auto theme application + persistence
├── styles/                 # Component-specific styles
│   ├── Navbar.css
│   ├── Footer.css
│   ├── Card.css
│   ├── Table.css
│   ├── Login.css
│   ├── Dashboard.css
│   └── Settings.css
├── App.js                  # Main app component with routing
├── App.css                 # Global app styles
├── index.js                # React entry point
└── index.css               # Global styles
```

## Features Implemented

### 1. **Login Page** ✓
- Email and password validation
- Role selection (user, manager, admin)
- Error handling and loading states
- Demo credentials info

### 2. **Navbar & Layout** ✓
- Project branding (TrustTicket)
- Navigation links (Dashboard, Settings)
- User information display
- Logout functionality

### 3. **Footer** ✓
- Project information
- Year and description
- Displayed on all authenticated pages

### 4. **Dashboard / Home Page (Marketplace)** ✓
- Main marketplace view with loading and empty states
- Ticket statistics (available, your listings, purchases, sales)
- **Search** by event name / venue and **filter by event type, date, and price range (min/max)**
- Cards and table view toggle
- **List a Ticket** form (modal) — sellers upload a ticket (event, date, venue, prices, barcode)
- **Mock AI verification** — a newly uploaded ticket starts as `pending`; the seller runs the
  "AI verification" check, which moves it to `available` and lists it for buyers
- **Seller details + trust rating** shown on every card (name, ⭐ rating /5, number of deals, verified badge)
- **Buy flow (escrow MVP)** — a buyer purchases a verified ticket; the ticket is "released" to the
  buyer and money is held in escrow (`reserved`)
- **Redeem flow** — when the barcode is "used", the sale completes; the seller is paid the sale price
  minus a 2.5% seller fee, and the buyer is charged the price plus a 2.5% buyer fee (5% platform total).
  No real money is moved — this is an MVP that implements the process.
- Modal detail view for selected tickets

### 5. **Reusable Card Component** ✓
- Displays individual ticket information
- Event details, pricing, and status
- Used 3+ times on dashboard
- Interactive click handling

### 6. **Data Table Component** ✓
- Displays structured ticket data
- Dynamic mapping of backend data
- Sortable by row click
- Responsive design

### 7. **Settings Page** ✓
- Theme preference (Light, Dark, Auto) — **actually re-themes the whole app** and persists across reloads
- Language: **English only** (shown as a locked field, since translation is not implemented)
- Editable account details: **Display Name** and **Username** (validated, min 2 chars) and optional **Phone**
- Display Name updates propagate live to the Navbar and Dashboard greeting
- **Email and User Role are read-only** (cannot be changed)
- Notification settings
- Save and reset functionality (loading / success / error states)
- Project information section

## Tech Stack

- **Framework**: React 18.2.0
- **Routing**: React Router v6.14.0
- **Data Fetching**: Fetch API
- **Styling**: CSS3 (with responsive design)
- **Build Tool**: react-scripts 5.0.1

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd TrustTicket/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   (Note: Dependencies are already installed if you've run setup)

3. **Ensure backend is running:**
   - Navigate to backend directory
   - Run `npm start` to start backend server on port 3000

### Running the Application

**Start the development server:**
```bash
npm start
```

The application will automatically open at `http://localhost:3001`

**Available Scripts:**
```bash
npm start       # Runs app in development mode
npm build       # Builds app for production
npm test        # Launches test runner
npm eject       # Ejects from create-react-app (irreversible)
```

## API Integration

### Base URL
- **Backend server**: `http://localhost:3000` (the Assignment 2 API)
- **API base path**: `http://localhost:3000/api` — all endpoints below are served under `/api`
- The frontend dev server runs on `http://localhost:3001` and calls the backend at the base URL above
- The application uses `x-user-role` and `x-user-id` headers for the simulated auth / role-based access (admin, manager, user)

### Connected Endpoints

#### Auth API
- `POST /api/auth/login` - Log in with email + password (returns user + token)
- `POST /api/auth/logout` - Log out the current session

#### Users API
- `GET /api/users/me` - Get current user info (via `x-user-id` header)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Tickets API
- `GET /api/tickets` - Get all tickets. Filters: `?eventType=`, `?status=`, `?search=`, `?date=`, `?minPrice=`, `?maxPrice=`
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create a new ticket listing (starts as `pending`, unverified)
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (admin only)
- `POST /api/tickets/:id/verify` - Run the mock AI verification (`pending` → `available`)
- `POST /api/tickets/:id/purchase` - Buy a verified ticket (creates an escrow transaction, `available` → `reserved`)
- `POST /api/tickets/:id/redeem` - Mark the barcode as used (`reserved` → `completed`, pays the seller)

#### Transactions API
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

#### Dashboard API
- `GET /api/dashboard/:userId` - Get user dashboard

#### Settings API
- `GET /api/settings` - Get the current user's settings (displayName, username, phone, theme, language, notifications)
- `PUT /api/settings` - Update the current user's settings

## Usage Guide

### Login
1. Navigate to login page
2. Enter a registered email and password (min 6 chars)
   - Admin: `tomer@trustticket.com` / `password123`
   - User: `shay@trustticket.com` / `password123`
3. Click "Login" (role is determined by the backend account)

### Dashboard (Marketplace)
1. Browse tickets; search by name/venue and filter by event type, date, and price range
2. Toggle between cards and table view
3. Click **List a Ticket** to upload a ticket (it starts pending AI verification)
4. On your own pending ticket, click **Run AI Verification** to list it
5. On someone else's available ticket, click **Buy Now** (money held in escrow, ticket released to you)
6. On a ticket you bought, click **Mark Barcode Used** to complete the sale (fees applied)
7. Statistics show available tickets, your listings, purchases, and sales

### Settings
1. Edit your Display Name and Username (required, validated — at least 2 characters)
2. Optionally add a phone number
3. Customize theme preference (applies immediately on save)
4. Toggle notifications (language is English-only; email and role are read-only)
5. Click "Save Settings" to persist changes (shows loading / success / error states)

## Component Details

### Card Component
- Displays individual ticket with event details
- Shows pricing, status, seller name + trust rating (⭐/5), verified and AI-verified badges
- Renders contextual workflow actions (Verify / Buy / Redeem) plus the detail-view handler

### Table Component
- Sortable data table with ticket information
- Row highlighting on hover
- Responsive scrolling on mobile

### Navbar Component
- Fixed header with branding
- Navigation links
- User info and logout button

### Footer Component
- Fixed footer with project info
- Year display
- Project description

## Responsive Design

The application is fully responsive with breakpoints at:
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## Error Handling

- API errors display user-friendly messages
- Form validation before submission
- Loading states for async operations
- Try-catch blocks for robust error handling

## State Management

- React hooks (useState, useEffect) for component state
- localStorage for authentication persistence
- Context-like pattern for user data passing

## Authentication Flow

1. **Login**: User enters credentials, role selected
2. **Store**: User data stored in localStorage
3. **Header Setup**: x-user-role header set for API calls
4. **Protected Routes**: Dashboard and Settings protected
5. **Logout**: Clear localStorage, redirect to login

## Assumptions

- Backend API is running on `http://localhost:3000`
- Authentication uses role headers (no JWT tokens yet)
- Data is mock/in-memory (resets on server restart)
- Settings stored in browser localStorage

## Known Limitations

- **No real payment processing** — the escrow/fee flow (2.5% buyer + 2.5% seller) is an MVP that
  simulates the process; no money is actually moved
- **AI verification is mocked** — any pending ticket is approved when the seller runs the check
- No file/PDF uploads for tickets (the barcode is entered as text)
- Data is mock/in-memory on the backend, so all listings, transactions and settings reset on server restart
- No real email verification

## Future Enhancements

- Real payment + escrow provider integration
- Real AI ticket/barcode authenticity verification
- Email verification system
- Ticket upload with PDF/image file support
- Real-time notifications
- Buyer-side reviews to complement seller trust ratings
- Advanced analytics dashboard

## Troubleshooting

### Port Already in Use
If port 3001 is already in use:
```bash
lsof -i :3001  # Find what's using the port
kill -9 <PID>  # Kill the process
# or change port
PORT=3002 npm start
```

### CORS Issues
Ensure backend is running with CORS enabled:
- Check backend is on http://localhost:3000
- Verify API endpoints are accessible

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:3000
# Should return: {"success": true, "data": {"message": "Welcome to Trust Ticket API"}}
```

## Project Compliance

This project meets all Assignment 3 requirements:
- ✓ React.js application with create-react-app
- ✓ Runs locally on port 3001
- ✓ Connects to backend API at http://localhost:3000
- ✓ Client-side routing with React Router
- ✓ Form validation and error handling
- ✓ Dynamic data display with reusable components
- ✓ Login, Navbar, Footer, Settings, Dashboard pages
- ✓ Card component (used 3+ times)
- ✓ Data table component with backend mapping
- ✓ Marketplace workflow MVP: ticket upload → mock AI verification → buy (escrow) → redeem, with
  seller trust ratings and a 2.5% + 2.5% fee model
- ✓ Search and filter by event type, date, and price
- ✓ README with run instructions

## Support

For issues or questions:
1. Check the backend API documentation
2. Review browser console for error messages
3. Verify backend is running and accessible
4. Check network tab in DevTools for API calls

---

**Built for TrustTicket Project - Assignment 3**
Frontend application connecting to secure ticket resale marketplace backend.
