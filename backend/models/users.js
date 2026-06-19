/**
 * models/users.js - In-memory mock data for the Users resource.
 * This array acts as a simple database. All changes (create, update, delete)
 * happen in-memory and are lost when the server restarts.
 *
 * User fields:
 *   userId     - Unique numeric identifier (auto-generated on creation)
 *   firstName  - User's first name
 *   lastName   - User's last name
 *   email      - Login email (unique). Used by POST /auth/login
 *   password   - Mock password for the simulated login (plain text - demo only)
 *   createDate - ISO timestamp of when the user was created
 *   updateDate - ISO timestamp of the last update
 *   userRole   - One of: "admin", "manager", "user" (used for authorization)
 *   trustRating     - Seller reputation score out of 5.0 (shown in the marketplace)
 *   ratingCount     - How many buyers have rated this seller (with stars)
 *   successfulDeals - Number of completed sales (builds the trust score)
 *   verifiedSeller  - Whether this seller has passed identity verification (badge)
 */
const users = [
  {
    "userId": 1,
    "firstName": "Tomer",
    "lastName": "Shoshani",
    "email": "tomer@trustticket.com",
    "password": "password123",
    "createDate": "2026-05-01T10:00:00Z",
    "updateDate": "2026-05-01T10:00:00Z",
    "userRole": "admin",
    "trustRating": 5.0,
    "ratingCount": 20,
    "successfulDeals": 24,
    "verifiedSeller": true
  },
  {
    "userId": 2,
    "firstName": "Shay",
    "lastName": "Silversmith",
    "email": "shay@trustticket.com",
    "password": "password123",
    "createDate": "2026-05-02T12:00:00Z",
    "updateDate": "2026-05-02T12:00:00Z",
    "userRole": "user",
    "trustRating": 4.8,
    "ratingCount": 11,
    "successfulDeals": 12,
    "verifiedSeller": true
  },
  {
    "userId": 3,
    "firstName": "Noa",
    "lastName": "Levi",
    "email": "noa@trustticket.com",
    "password": "password123",
    "createDate": "2026-05-03T09:30:00Z",
    "updateDate": "2026-05-03T09:30:00Z",
    "userRole": "user",
    "trustRating": 4.5,
    "ratingCount": 6,
    "successfulDeals": 7,
    "verifiedSeller": true
  },
  {
    "userId": 4,
    "firstName": "Amit",
    "lastName": "Cohen",
    "email": "amit@trustticket.com",
    "password": "password123",
    "createDate": "2026-05-04T14:00:00Z",
    "updateDate": "2026-05-04T14:00:00Z",
    "userRole": "manager",
    "trustRating": 4.9,
    "ratingCount": 15,
    "successfulDeals": 18,
    "verifiedSeller": true
  },
  {
    "userId": 5,
    "firstName": "Dana",
    "lastName": "Katz",
    "email": "dana@trustticket.com",
    "password": "password123",
    "createDate": "2026-05-05T16:45:00Z",
    "updateDate": "2026-05-05T16:45:00Z",
    "userRole": "user",
    "trustRating": 4.2,
    "ratingCount": 2,
    "successfulDeals": 3,
    "verifiedSeller": false
  }
];

module.exports = users;
