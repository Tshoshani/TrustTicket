# TrustTicket - Complete Project

A secure ticket resale marketplace platform with React frontend and Node.js/Express backend.

## 🏗️ Project Structure

```
TrustTicket-Project/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── routes/             # API routes
│   ├── models/             # Data models
│   ├── middleware/         # Auth & logging
│   ├── server.js           # Express server
│   ├── package.json
│   └── README.md           # Backend docs
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page views
│   │   ├── services/       # API service
│   │   ├── styles/         # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── public/             # Static files
│   ├── package.json
│   └── README.md           # Frontend docs
│
└── docs/
    └── API.md              # API documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation & Setup

**Step 1: Install Backend Dependencies**
```bash
cd backend
npm install
```

**Step 2: Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Start Backend (Port 3000):**
```bash
cd backend
npm start
```

Output:
```
Server running on http://localhost:3000
```

**Terminal 2 - Start Frontend (Port 5173):**
```bash
cd frontend
npm start
```

The app automatically opens at `http://localhost:5173`

## 📋 Project Overview

### What is TrustTicket?

TrustTicket is a secure, AI-powered marketplace for buying and selling event tickets. It uses an **escrow model** to protect both buyers and sellers:

- **Sellers** upload tickets → AI verification → pricing recommendations
- **Buyers** search and purchase → payment held safely
- **Transactions** completed → money released after verification

### Key Features

✅ **Secure Escrow System** - Money held safely until transaction completion  
✅ **AI-Powered Verification** - Ticket authenticity verification  
✅ **User Ratings** - Trust system with buyer/seller ratings  
✅ **Dynamic Pricing** - AI recommendations for optimal selling price  
✅ **Transaction Protection** - 5% platform fee (2.5% buyer + 2.5% seller)  
✅ **Role-Based Access** - Admin, Manager, and User roles  

---

## 🎯 Assignment Overview

This project fulfills three assignments:

### **Assignment 1: System Ideation** ✅
- Detailed project specification
- Use cases and workflows
- System architecture
- Database schema

### **Assignment 2: Backend Development** ✅
- Node.js/Express REST API
- User management (CRUD)
- Ticket listing system
- Transaction handling
- Dashboard analytics
- Mock data storage

### **Assignment 3: Frontend Development** ✅
- React application
- User authentication
- Marketplace interface
- Settings management
- Dynamic data tables
- Responsive design

---

## 🔌 Backend API

**Base URL:** `http://localhost:3000`

### API Endpoints

#### Users
- `GET /users` - Get all users (admin/manager only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Tickets
- `GET /tickets` - Get all tickets (with filters)
- `GET /tickets/:id` - Get ticket by ID
- `POST /tickets` - Create ticket listing
- `PUT /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket

#### Transactions
- `GET /transactions` - Get all transactions
- `GET /transactions/:id` - Get transaction by ID
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

#### Dashboard
- `GET /dashboard/:userId` - Get user dashboard

**Role-Based Access:**
Set header: `x-user-role: admin|manager|user`

---

## 💻 Frontend Stack

- **Framework:** React 18.2.0
- **Routing:** React Router v6.30.4
- **Data Fetching:** Fetch API
- **Styling:** CSS3 with responsive design
- **Build Tool:** react-scripts 5.0.1

### Frontend Pages

1. **Login** - Email/password authentication
2. **Dashboard** - Marketplace view with filters and statistics
3. **Settings** - User preferences and account info
4. **Navbar** - Navigation and user controls
5. **Footer** - Project information

### Frontend Components

- `Card` - Reusable ticket display
- `Table` - Dynamic data table
- `Navbar` - Top navigation
- `Footer` - Bottom section

---

## 🧪 Testing

### Manual Testing Checklist

**Login Flow:**
- [ ] Navigate to http://localhost:5173
- [ ] Enter email and password (6+ chars)
- [ ] Submit (role is determined by the backend account)
- [ ] Redirected to Dashboard

**Dashboard:**
- [ ] See list of available tickets
- [ ] Filter by event type
- [ ] Toggle cards/table view
- [ ] Click ticket to view details

**Settings:**
- [ ] Change theme preference
- [ ] Change language
- [ ] Toggle notifications
- [ ] Save settings successfully

**API Integration:**
- [ ] Data loads from backend
- [ ] Filters work correctly
- [ ] Error messages display properly
- [ ] Loading states show

---

## 📚 Documentation

- **[Backend README](./backend/README.md)** - API setup and documentation
- **[Frontend README](./frontend/README.md)** - React app setup and usage

---

## 🛠️ Development Workflow

### Making Changes

**Backend Changes:**
1. Edit files in `backend/`
2. Backend auto-reloads
3. Test with Postman or Frontend

**Frontend Changes:**
1. Edit files in `frontend/src/`
2. Frontend auto-reloads (hot reload)
3. See changes immediately in browser

### File Organization

- **Controllers** - Business logic
- **Routes** - API endpoints
- **Models** - Data structures
- **Components** - Reusable UI elements
- **Pages** - Full page views
- **Services** - API communication
- **Styles** - Component styling

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend (3000):**
```bash
lsof -i :3000
kill -9 <PID>
```

**Frontend (5173):**
```bash
lsof -i :5173
kill -9 <PID>
```

### Dependencies Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Backend Not Responding

```bash
# Verify backend is running
curl http://localhost:3000

# Should return success message
```

### CORS Issues

- Ensure backend is running on http://localhost:3000
- Check `x-user-role` header is set in frontend requests
- Verify API endpoints match backend

---

## 📦 Deployment

### Build for Production

**Backend:**
```bash
cd backend
# Production ready as-is (Node.js app)
```

**Frontend:**
```bash
cd frontend
npm run build
# Creates optimized build in `build/` folder
```

---

## 👥 Team Information

- **Project:** TrustTicket - Secure Ticket Resale Marketplace
- **Students:** Tomer Shoshani (211822457), Shay Silversmith (206579674)
- **University:** School Project
- **Year:** 2026

---

## 📄 License

This project is for educational purposes.

---

## 🤝 Support

For issues or questions:
1. Check the README files in `backend/` and `frontend/`
2. Review browser console for error messages
3. Check network tab in DevTools
4. Verify both backend and frontend are running

---

**Last Updated:** June 2026
