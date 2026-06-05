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

### 4. **Dashboard / Home Page** ✓
- Main marketplace view
- Ticket statistics (listings, available, purchases, sales)
- Filter by event type
- Cards and table view toggle
- Dynamic ticket display
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
- Theme preference (Light, Dark, Auto)
- Language selection (EN, HE, ES, FR)
- Notification settings
- Account information display
- Save and reset functionality
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
   cd ~/Desktop/trustticket-frontend
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
- **Local Development**: `http://localhost:3000`
- The application uses `x-user-role` header for role-based access (admin, manager, user)

### Connected Endpoints

#### Users API
- `GET /users/me` - Get current user info
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Tickets API
- `GET /tickets` - Get all tickets (with filters)
- `GET /tickets/:id` - Get ticket by ID
- `POST /tickets` - Create new ticket
- `PUT /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket

#### Transactions API
- `GET /transactions` - Get all transactions
- `GET /transactions/:id` - Get transaction by ID
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

#### Dashboard API
- `GET /dashboard/:userId` - Get user dashboard

#### Settings API (Mock - localStorage)
- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings

## Usage Guide

### Login
1. Navigate to login page
2. Enter email (any valid format) and password (min 6 chars)
3. Select user role
4. Click "Login"

### Dashboard
1. View all available tickets
2. Filter by event type using dropdown
3. Toggle between cards and table view
4. Click on any ticket to see details
5. Statistics show active listings, sales, and purchases

### Settings
1. Customize theme preference
2. Select preferred language
3. Toggle notifications
4. View account information
5. Click "Save Settings" to persist changes

## Component Details

### Card Component
- Displays individual ticket with event details
- Shows pricing and availability status
- Click handler for detail view

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

- No real payment processing
- No file uploads for tickets
- Settings are browser-local (not persisted to backend)
- Mock transaction data only
- No real email verification

## Future Enhancements

- Real payment integration
- Email verification system
- Advanced search and filtering
- User profile customization
- Ticket upload with file support
- Real-time notifications
- Review and rating system
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
