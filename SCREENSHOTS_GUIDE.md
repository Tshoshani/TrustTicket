# 📸 מדריך צילומי מסך — Assignment 4 (TrustTicket)

העבודה דורשת 6 צילומי מסך. שמרו אותם ב‑`frontend/Screenshots/` (או תיקיית `submission/screenshots/`).
שם מוצע לכל קובץ מופיע בכותרת. צלמו כך שרואים גם את הכתובת/החלון וגם את התוצאה.

> 💡 **אפשר לצלם מהאתר הפרוס** (עדיף — מוכיח שזה deployed):
> **https://trustticket-1tn3.onrender.com** (ה-API תחת אותו origin: `/api/...`).
> כל מקום שכתוב `http://localhost:5173` → החליפו בכתובת הזו, ו-`http://localhost:3000/api` → `https://trustticket-1tn3.onrender.com/api`.

## 📍 סטטוס נוכחי
- ✅ **כבר יש לכם:** #1 (DB connected) ו-#2 (CRUD) ב-`backend/Screenshots/`, ועמודי UI ב-`frontend/Screenshots/`.
- ❌ **עדיין צריך לצלם:** **#3 ORM relationships · #4 WebSocket · #5 AI · #6 DB tables**.

## הכנה (פעם אחת — רק אם מצלמים מקומית)
```bash
# 1. צרו את ה-DB מתוך ה-migration
mysql -u root -p < backend/migrations/schema.sql
mysql -u root -p < backend/migrations/seed.sql
# 2. הריצו backend ו-frontend
cd backend && npm start          # http://localhost:3000
cd frontend && npm start         # http://localhost:5173
```
התחברו עם: `tomer@trustticket.com` / `password123` (admin).
(אם מצלמים מהאתר הפרוס — לא צריך את ההכנה הזו, פשוט פתחו את כתובת ה-Render והתחברו.)

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

## 7️⃣ (בונוס) `07_admin_dashboard.png` — דשבורד אנליטיקות לאדמין
**מה לצלם:** התחברו כאדמין → עמוד **Admin** → טאב **Sales Dashboard** או **Profit Analytics**.
צלמו את כרטיסי הסיכום (Platform Profit, Sales Volume...) + גרפי העמודות + פילטר טווח הזמן.
לא חובה למטלה, אבל מרשים ומראה עומק — שווה לכלול.

---

## ✅ צ'קליסט הגשה סופי
- [ ] 6 צילומי המסך למעלה (חסרים: #3 ORM, #4 WebSocket, #5 AI, #6 DB tables)
- [ ] סרטון דמו (הקלטת מסך שמראה: התחברות → CRUD → live בין טאבים → AI → הגדרות → התנתקות)
- [ ] ZIP **בלי** `node_modules`, בלי `.env` אמיתי, בלי מפתחות אמיתיים
- [ ] `.env.example` כלול · Postman כלול · README.md כלול

## 📦 יצירת ה-ZIP (נקי, בלי קבצים אסורים)
הדרך הבטוחה ביותר — `git archive` אורז **רק קבצים שעוקבים אחריהם ב-git**, ולכן
**אוטומטית מדלג** על `node_modules`, `.env`, ו-`.claude` (כולם git-ignored):
```bash
# קודם — ודאו שצילומי המסך כבר נוספו ל-git (אחרת לא ייכנסו ל-zip):
git add frontend/Screenshots backend/Screenshots
git commit -m "Add submission screenshots"

# ואז צרו את ה-ZIP מהקבצים העוקבים:
git archive --format=zip --output=TrustTicket_Assignment4.zip HEAD
```
את הסרטון (קובץ וידאו גדול, לא ב-git) **הוסיפו ידנית** ל-ZIP אחרי היצירה, או הגישו בנפרד לפי הנחיות הקורס.

> ⚠️ אם אתם אורזים ידנית במקום `git archive` — **מחקו/דלגו על `backend/.env`** (מכיל את סיסמת ה-RDS והמפתח האמיתי של Gemini) ועל `node_modules/`.

> הקובץ הזה הוא עזר בלבד ואינו חלק מקוד המקור — אפשר למחוק אותו לפני יצירת ה-ZIP.
