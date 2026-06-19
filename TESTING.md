# TrustTicket - Testing Guide

Complete testing instructions for the TrustTicket application.

## 🧪 Testing Approaches

We provide both manual and automated testing options.

---

## 📋 Manual Testing Guide (Recommended for Initial Testing)

### Prerequisites
- Both backend and frontend running
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### Test Scenarios

## 1. Authentication Testing

### Test 1.1: Valid Login
**Steps:**
1. Navigate to http://localhost:5173
2. Enter email: `shay@trustticket.com`
3. Enter password: `password123`
4. Click "Login"

**Expected Result:** ✅
- Redirects to Dashboard
- User name appears in Navbar
- Navbar visible with navigation links

**Evidence:** Screenshot of logged-in Dashboard

---

### Test 1.2: Invalid Email Format
**Steps:**
1. Navigate to http://localhost:5173
2. Enter email: `invalidemail`
3. Enter password: `password123`
4. Click "Login"

**Expected Result:** ✅
- Error message: "Please enter a valid email"
- Stays on Login page
- Form clears password

---

### Test 1.3: Password Too Short
**Steps:**
1. Enter email: `test@example.com`
2. Enter password: `pass` (less than 6 chars)
3. Click "Login"

**Expected Result:** ✅
- Error message: "Password must be at least 6 characters"
- Stays on Login page

---

### Test 1.4: Logout
**Steps:**
1. Login successfully
2. Click "Logout" button in Navbar
3. Verify redirect

**Expected Result:** ✅
- Redirects to Login page
- Navbar disappears
- localStorage cleared

---

## 2. Dashboard Testing

### Test 2.1: Load Dashboard
**Steps:**
1. Login as user
2. Navigate to Dashboard (automatic)
3. Wait for data to load

**Expected Result:** ✅
- Statistics displayed (4 stat cards)
- Ticket list visible
- Loading state appears briefly
- No console errors

---

### Test 2.2: Filter by Event Type
**Steps:**
1. View Dashboard
2. Click "Filter by Event Type" dropdown
3. Select "Concert"
4. Verify results

**Expected Result:** ✅
- Table updates to show only Concert tickets
- Count updates
- Dropdown shows selected value

---

### Test 2.3: Switch View Modes
**Steps:**
1. Dashboard loaded
2. Click "📇 Cards View" button
3. View displays as card grid
4. Click "📊 Table View" button
5. View displays as table

**Expected Result:** ✅
- Buttons toggle active state
- View changes smoothly
- All data visible in both views

---

### Test 2.4: Click Ticket for Details
**Steps:**
1. Dashboard with cards view
2. Click on any ticket card
3. Modal opens
4. Review details
5. Click X to close

**Expected Result:** ✅
- Modal appears with overlay
- Shows full ticket information
- Modal closes when clicking X or overlay
- Can click multiple tickets

---

### Test 2.5: Empty State
**Steps:**
1. Filter by a type with no tickets
2. Verify display

**Expected Result:** ✅
- Shows "No tickets found" message
- Graceful handling

---

## 3. Settings Testing

### Test 3.1: Load Settings
**Steps:**
1. Login as user
2. Click "Settings" in Navbar
3. Wait for page load

**Expected Result:** ✅
- Settings form loads
- Current values visible
- Account info displayed (read-only)
- No console errors

---

### Test 3.2: Change Theme
**Steps:**
1. On Settings page
2. Change "Theme Preference" from Light to Dark
3. Click "Save Settings"
4. Verify message

**Expected Result:** ✅
- Dropdown updates
- "Settings saved successfully!" message
- Setting persists in localStorage

---

### Test 3.3: Change Language
**Steps:**
1. Change "Language" dropdown
2. Select "Hebrew (עברית)"
3. Click "Save Settings"

**Expected Result:** ✅
- Selection updates
- Save message appears
- Setting persists

---

### Test 3.4: Toggle Notifications
**Steps:**
1. Toggle checkbox "Enable email notifications"
2. Click "Save Settings"

**Expected Result:** ✅
- Checkbox state changes
- Success message displays
- Setting saved to localStorage

---

### Test 3.5: Reset Settings
**Steps:**
1. Make changes to settings
2. Click "Reset" button
3. Original values restored

**Expected Result:** ✅
- Form reverts to saved values
- No save confirmation needed

---

## 4. API Integration Testing

### Test 4.1: Backend Connection
**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Login
4. Check requests

**Expected Result:** ✅
- GET requests to `/dashboard/:userId` succeed
- Headers include `x-user-role: user`
- Responses are JSON with `success: true`

---

### Test 4.2: Error Handling
**Steps:**
1. Stop backend server
2. On Dashboard, refresh page
3. Observe error handling

**Expected Result:** ✅
- Error message displays
- App doesn't crash
- User can still navigate

---

### Test 4.3: Verify Headers
**Steps:**
1. Open DevTools → Network
2. Click on any API request
3. Check Request Headers

**Expected Result:** ✅
- `x-user-role` header present
- `Content-Type: application/json` set

---

## 5. UI/UX Testing

### Test 5.1: Responsive Design - Desktop
**Steps:**
1. Open app at 1920x1080
2. Verify layout

**Expected Result:** ✅
- Full grid layout
- All content visible
- Proper spacing

---

### Test 5.2: Responsive Design - Tablet
**Steps:**
1. DevTools → Device Toolbar
2. Select iPad (768px)
3. Verify layout

**Expected Result:** ✅
- Content adapts
- Readable text
- Touch-friendly buttons

---

### Test 5.3: Responsive Design - Mobile
**Steps:**
1. DevTools → Device Toolbar
2. Select iPhone 12 (390px)
3. Verify layout

**Expected Result:** ✅
- Single column layout
- Navbar stacks properly
- Content readable
- Buttons accessible

---

### Test 5.4: Form Validation Styling
**Steps:**
1. On Login page
2. Enter invalid email
3. Observe styling

**Expected Result:** ✅
- Error message styled in red
- Input may have error border
- Message clearly visible

---

## 6. Navigation Testing

### Test 6.1: Protected Routes
**Steps:**
1. Logout (clear browser storage)
2. Try to access http://localhost:5173/dashboard
3. Observe redirect

**Expected Result:** ✅
- Redirects to /login
- Cannot access dashboard

---

### Test 6.2: Navbar Links
**Steps:**
1. Login
2. Click "Dashboard" in Navbar
3. Navigate to Settings
4. Click "Dashboard" again

**Expected Result:** ✅
- All links work
- Pages load correctly
- State preserved

---

## 📸 Screenshot Checklist for Submission

Take screenshots of:

### Screenshot 1: Login Page
- [ ] Email field visible
- [ ] Password field visible
- [ ] Role selector visible
- [ ] Login button visible
- [ ] Demo info visible

### Screenshot 2: Dashboard
- [ ] Statistics cards visible
- [ ] Ticket list/cards visible
- [ ] Filter dropdown visible
- [ ] View toggle buttons visible
- [ ] Navbar visible

### Screenshot 3: Table View
- [ ] Table header visible
- [ ] Multiple rows visible
- [ ] All columns visible
- [ ] Hover effects visible

### Screenshot 4: Settings
- [ ] Theme dropdown visible
- [ ] Language selector visible
- [ ] Notification checkbox visible
- [ ] Account info visible
- [ ] Save/Reset buttons visible

---

## ⚙️ Automated Testing (Optional)

### Setup Jest & React Testing Library

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### Run Tests

```bash
npm test
```

### Sample Test (Frontend)

Create `src/components/__tests__/Card.test.js`:

```javascript
import { render, screen } from '@testing-library/react';
import Card from '../Card';

test('renders card with ticket data', () => {
  const ticket = {
    ticketId: 1,
    eventName: 'Concert',
    eventType: 'Music',
    venue: 'Arena',
    eventDate: '2026-07-01',
    originalPrice: 100,
    salePrice: 120,
    barcode: 'ABC123',
    status: 'available'
  };

  render(<Card ticket={ticket} />);
  
  expect(screen.getByText('Concert')).toBeInTheDocument();
  expect(screen.getByText('Music')).toBeInTheDocument();
});
```

---

## 🔍 Debugging Tips

### Browser DevTools

**Console (F12 → Console):**
- Check for JavaScript errors
- Log API requests
- Verify localStorage

**Network Tab (F12 → Network):**
- Monitor API calls
- Check response status
- Verify headers

**Application Tab (F12 → Application):**
- View localStorage
- Check stored user data
- Verify cookies

### Common Issues

**Issue: Data not loading**
- Check backend is running
- Verify URL is http://localhost:3000
- Check console for errors

**Issue: Login not working**
- Check localStorage in DevTools
- Verify email format
- Check password length (6+ chars)

**Issue: Buttons not responding**
- Check console for errors
- Verify element is not disabled
- Check CSS not overlaying element

---

## ✅ Final Verification Checklist

Before submission:

- [ ] Backend runs on port 3000
- [ ] Frontend runs on port 5173
- [ ] Login page works
- [ ] Dashboard displays data
- [ ] Settings page functional
- [ ] Logout works
- [ ] No console errors
- [ ] All required pages present
- [ ] Components render correctly
- [ ] API integration working
- [ ] Responsive on mobile/tablet/desktop
- [ ] 4 required screenshots taken

---

## 📊 Test Results Template

Document your test results:

```
TEST SUITE: Authentication
├─ Test 1.1: Valid Login ...................... ✅ PASS
├─ Test 1.2: Invalid Email ................... ✅ PASS
├─ Test 1.3: Short Password .................. ✅ PASS
└─ Test 1.4: Logout .......................... ✅ PASS

TEST SUITE: Dashboard
├─ Test 2.1: Load Dashboard .................. ✅ PASS
├─ Test 2.2: Filter by Type .................. ✅ PASS
├─ Test 2.3: View Mode Toggle ................ ✅ PASS
├─ Test 2.4: Ticket Details Modal ............ ✅ PASS
└─ Test 2.5: Empty State ..................... ✅ PASS

Overall: 13/13 Tests PASSED ✅
```

---

## 🎯 Success Criteria

Your app is ready when:
- ✅ All manual tests pass
- ✅ No console errors
- ✅ Responsive on all screen sizes
- ✅ API integration works
- ✅ Screenshots captured
- ✅ Documentation complete

---

**Happy Testing! 🚀**
