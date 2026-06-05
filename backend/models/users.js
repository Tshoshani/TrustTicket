/**
 * models/users.js - In-memory mock data for the Users resource.
 * This array acts as a simple database. All changes (create, update, delete)
 * happen in-memory and are lost when the server restarts.
 *
 * User fields:
 *   userId     - Unique numeric identifier (auto-generated on creation)
 *   firstName  - User's first name
 *   lastName   - User's last name
 *   createDate - ISO timestamp of when the user was created
 *   updateDate - ISO timestamp of the last update
 *   userRole   - One of: "admin", "manager", "user" (used for authorization)
 */
const users = [
  {
    "userId": 1,
    "firstName": "Tomer",
    "lastName": "Shoshani",
    "createDate": "2026-05-01T10:00:00Z",
    "updateDate": "2026-05-01T10:00:00Z",
    "userRole": "admin"
  },
  {
    "userId": 2,
    "firstName": "Shai",
    "lastName": "Silberschmidt",
    "createDate": "2026-05-02T12:00:00Z",
    "updateDate": "2026-05-02T12:00:00Z",
    "userRole": "user"
  },
  {
    "userId": 3,
    "firstName": "Noa",
    "lastName": "Levi",
    "createDate": "2026-05-03T09:30:00Z",
    "updateDate": "2026-05-03T09:30:00Z",
    "userRole": "user"
  },
  {
    "userId": 4,
    "firstName": "Amit",
    "lastName": "Cohen",
    "createDate": "2026-05-04T14:00:00Z",
    "updateDate": "2026-05-04T14:00:00Z",
    "userRole": "manager"
  },
  {
    "userId": 5,
    "firstName": "Dana",
    "lastName": "Katz",
    "createDate": "2026-05-05T16:45:00Z",
    "updateDate": "2026-05-05T16:45:00Z",
    "userRole": "user"
  }
];

module.exports = users;
