# 📸 מדריך צילומי מסך — Assignment 4 (TrustTicket)

העבודה דורשת 6 צילומי מסך. שמרו אותם ב‑`frontend/Screenshots/` (או תיקיית `submission/screenshots/`).
שם מוצע לכל קובץ מופיע בכותרת. צלמו כך שרואים גם את הכתובת/החלון וגם את התוצאה.

## הכנה (פעם אחת)
```bash
# 1. צרו את ה-DB מתוך ה-migration
mysql -u root -p < backend/migrations/schema.sql
mysql -u root -p < backend/migrations/seed.sql
# 2. הריצו backend ו-frontend
cd backend && npm start          # http://localhost:3000
cd frontend && npm start         # http://localhost:5173
```
התחברו עם: `tomer@trustticket.com` / `password123` (admin).

---

## 1️⃣ `01_db_connected.png` — אפליקציה מחוברת ל-DB
**מה לצלם:** ב-Postman הריצו **General → DB Test** (`GET {{baseUrl}}/db-test`).
צריך לראות `"message": "Database connected successfully"` עם status 200.
*חלופה:* פתחו בדפדפן `http://localhost:3000/api/db-test`.

## 2️⃣ `02_crud_success.png` — פעולת CRUD מוצלחת
**מה לצלם:** ב-Postman הריצו **Tickets → Create Ticket** (`POST {{baseUrl}}/tickets`).
צריך לראות `"success": true` ו-status 201 עם הכרטיס שנוצר (כולל `ticketId` חדש).
*חזק יותר:* צלמו רצף — Create ואז Get All Tickets שמראה שהכרטיס נשמר.

## 3️⃣ `03_orm_relationships.png` — יחסי ORM עובדים (JOIN)
**מה לצלם:** ב-Postman הריצו **General → ORM Test** (`GET {{baseUrl}}/orm-test`).
זה מריץ `Ticket.findAll({ include: seller })` — צריך לראות ב-`sampleTicketWithSeller`
את הכרטיס **יחד עם אובייקט ה-seller המקונן** (firstName, trustRating...). זה ה-JOIN בין tickets ל-users.
*חלופה M:N:* **Favorites → Get User Favorites** מראה את הקשר רבים-לרבים דרך טבלת favorites.

## 4️⃣ `04_websocket_two_clients.png` — WebSocket בין שני לקוחות
**מה לצלם:** פתחו את `http://localhost:5173/live` ב-**שני טאבים זה לצד זה**.
בטאב אחד כתבו הודעה בשדה "Send a live message..." ושלחו.
צלמו את שני הטאבים כשההודעה מופיעה ב-feed של **שניהם**, ורואים את מונה "X online".
*חזק יותר:* בטאב נוסף צרו/אשרו/קנו כרטיס — אירוע `ticketCreated/Purchased` יופיע חי בשני הטאבים.

## 5️⃣ `05_ai_input_output.png` — קלט ופלט של ה-AI
**מה לצלם:** פתחו `http://localhost:5173/ai`, בחרו כרטיס מהרשימה ולחצו **Get AI Advice**.
צריך לראות: טווח מחיר מומלץ, badge של רמת סיכון, טקסט ההמלצה, ו-"Powered by: Google Gemini".
*חלופת Postman:* **AI → AI Advice (real ticket)** עם `{ "ticketId": 109 }` ותשובת ה-JSON.

## 6️⃣ `06_db_tables.png` — טבלאות / migrations
**מה לצלם:** ב-MySQL Workbench או טרמינל:
```sql
USE trustticket;
SHOW TABLES;
DESCRIBE tickets;
SELECT * FROM favorites;   -- מראה את ה-junction table עם נתונים
```
צלמו את רשימת הטבלאות (users, admins, tickets, transactions, favorites, settings, reviews).
*חלופה:* צילום של `backend/migrations/schema.sql` פתוח בעורך.

---

## ✅ צ'קליסט הגשה סופי
- [ ] 6 צילומי המסך למעלה
- [ ] סרטון דמו (הקלטת מסך שמראה: התחברות → CRUD → live בין טאבים → AI)
- [ ] ZIP **בלי** `node_modules`, בלי `.env` אמיתי, בלי מפתחות אמיתיים
- [ ] לוודא ש-`.env.example` כלול (כן, נמצא ב-`backend/.env.example`)
- [ ] Postman collection כלול (`backend/docs/TrustTicket.postman_collection.json`)
- [ ] README.md כלול

> הקובץ הזה הוא עזר בלבד ואינו חלק מקוד המקור — אפשר למחוק אותו לפני יצירת ה-ZIP.
