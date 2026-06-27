# TrustTicket — Deployment Guide (Render + AWS RDS)

Tailored to **this** project's real structure: `frontend/` (Create React App) + `backend/`
(Node + Express + Sequelize + Socket.IO) + MySQL on **AWS RDS**.

## Architecture

Two Render services plus one AWS RDS database:

| Component | Where | What it is |
|-----------|-------|------------|
| Frontend  | Render **Static Site** | The compiled React app (served from Render's CDN) |
| Backend   | Render **Web Service** | Express REST API + Socket.IO (one process) |
| Database  | **AWS RDS** MySQL      | Reachable from the internet (Render + MySQL Workbench) |

The React frontend talks to the backend over `REACT_APP_API_URL` / `REACT_APP_SOCKET_URL`.
The backend talks to MySQL over `DB_HOST` etc. CORS on the backend is opened to the
frontend URL via `CLIENT_URL`.

> **Order matters** because of a chicken-and-egg between the two URLs:
> 1. Create the **backend** first → you get its URL.
> 2. Create the **frontend** using that backend URL → you get the frontend URL.
> 3. Set `CLIENT_URL` on the backend = the frontend URL → redeploy backend.

---

## What was changed to make this deploy-ready

These edits are already applied in the repo:

- **`backend/src/server.js`** — now uses `process.env.PORT` (Render injects the port) and
  reads allowed CORS origins from `CLIENT_URL` (plus localhost for dev). It previously
  hardcoded port `3000` and `http://localhost:5173`, which would have failed on Render.
- **`backend/src/socket.js`** — Socket.IO CORS now also reads `CLIENT_URL`.
- **`backend/scripts/seed.js`** + **`npm run seed`** — one command that runs
  `migrations/schema.sql` then `migrations/seed.sql` against whatever DB the env points to
  (local MySQL **or** RDS).
- Frontend already reads `REACT_APP_API_URL` / `REACT_APP_SOCKET_URL` — no code change needed.

---

## Prerequisites

- The project pushed to a **GitHub** repo (Render deploys from GitHub).
- A free **Render** account (https://render.com) connected to that GitHub.
- A free **AWS** account (https://aws.amazon.com) for RDS.
- (Optional) A **Gemini API key** from https://aistudio.google.com/apikey for the AI feature.
  Without it the backend automatically falls back to its offline rule-based engine, so the AI
  feature still works.

---

## Step 0 — Push to GitHub

```bash
cd TrustTicket
git add .
git commit -m "Prepare for deployment (PORT/CORS env, seed script)"
git push
```

`.env` files are git-ignored (good — never commit secrets). All secrets go into the Render
dashboard instead.

---

## Step 1 — Start the AWS RDS database (do this first, it takes ~5 min)

1. AWS Console → search **RDS** → **Create database**.
2. **Standard create** → Engine **MySQL** → Template **Free tier**.
3. Settings:
   - **DB instance identifier**: `trustticket-db`
   - **Master username**: `admin`
   - **Master password**: choose one and **save it** (this becomes `DB_PASSWORD`).
4. **Connectivity** → **Public access: Yes** (required so Render and the presentation
   computer's MySQL Workbench can reach it).
5. Leave the rest as defaults → **Create database**.
6. Click **Create** and immediately move on to Step 2 — don't wait for it.

> You do **not** need to set an "initial database name" — the seed script creates the
> `trustticket` database itself.

---

## Step 2 — Create the Backend Web Service on Render

While RDS is still creating:

1. Render → **New** → **Web Service** → connect your GitHub repo.
2. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. Add the environment variables below (you can put a placeholder for `DB_HOST` now and
   fix it once RDS is ready), then **Create Web Service**.

### Backend environment variables (Render → Environment)

| Key           | Value                                              |
|---------------|----------------------------------------------------|
| `DB_HOST`     | your RDS endpoint (fill in after Step 4)           |
| `DB_PORT`     | `3306`                                             |
| `DB_NAME`     | `trustticket`                                      |
| `DB_USER`     | `admin`                                            |
| `DB_PASSWORD` | your RDS master password                           |
| `CLIENT_URL`  | your frontend URL (fill in after Step 5)           |
| `AI_PROVIDER` | `gemini`                                           |
| `AI_API_KEY`  | your Gemini key (or leave blank to use local AI)   |
| `AI_MODEL`    | `gemini-2.5-flash`                                 |
| `AI_GROUNDING`| `true`                                             |

> **Do NOT set `PORT`** — Render injects it automatically and the code reads it.
> These names match `backend/.env.example` exactly (note: it's `AI_API_KEY`, **not**
> `GEMINI_API_KEY` — the HTML template guide used different names).

Render gives you a URL like `https://trustticket-backend.onrender.com`. Note it down.

---

## Step 3 — Finish the RDS setup (once status shows "Available")

1. **Get the endpoint**: click the instance → **Connectivity & security** → copy the
   **Endpoint** (e.g. `trustticket-db.xxxxx.eu-central-1.rds.amazonaws.com`). Paste it as
   `DB_HOST` in the backend's Render env vars.
2. **Open the firewall**: on the instance page click the **VPC security group** →
   **Inbound rules** → **Edit inbound rules** → **Add rule**:
   - Type = **MySQL/Aurora** (port `3306`)
   - Source = **Anywhere-IPv4** (`0.0.0.0/0`)
   - **Save rules**

   This is required so Render's servers **and** the presentation computer's MySQL Workbench
   can connect from outside your network.

---

## Step 4 — Seed the database

Run this **from your own machine**, pointing at RDS. Edit `backend/.env` with the RDS values:

```
DB_HOST=trustticket-db.xxxxx.rds.amazonaws.com
DB_PORT=3306
DB_NAME=trustticket
DB_USER=admin
DB_PASSWORD=your_rds_password
```

Then:

```bash
cd backend
npm install
npm run seed
```

Expected output:

```
Done. Database "trustticket" recreated with all tables and mock data.
Test accounts (password: password123):
  tomer@trustticket.com (admin)
  shay@trustticket.com  (user)
  amit@trustticket.com  (manager)
```

> **Alternative (no Node):** open `backend/migrations/schema.sql` then `seed.sql` in MySQL
> Workbench connected to RDS and run each — same result.

---

## Step 5 — Create the Frontend Static Site on Render

1. Render → **New** → **Static Site** → same GitHub repo.
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
3. Environment variables (these are baked in **at build time**):

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL`    | `https://trustticket-backend.onrender.com/api` |
   | `REACT_APP_SOCKET_URL` | `https://trustticket-backend.onrender.com`     |

   (Use your real backend URL from Step 2. Note the `/api` suffix on the first one and **no**
   suffix on the socket one.)
4. **Add a SPA rewrite rule** (Static Site → **Redirects/Rewrites**) so React Router refreshes
   don't 404:
   - Source `/*` · Destination `/index.html` · Action **Rewrite**
5. **Create Static Site**. You'll get a URL like `https://trustticket-frontend.onrender.com`.

---

## Step 6 — Close the loop (CORS)

1. Go back to the **backend** service → Environment → set
   `CLIENT_URL = https://trustticket-frontend.onrender.com` (your real frontend URL).
2. **Manual Deploy → Deploy latest commit** on the backend.

> If you later change the backend URL, you must **rebuild the frontend** (Static Site →
> Manual Deploy → **Clear build cache & deploy**), because `REACT_APP_*` is compiled in.

---

## Step 7 — Verify (maps to the assignment checklist)

Open the frontend URL and confirm, in this project's pages:

- [ ] Site loads from the Render frontend URL.
- [ ] **Create user** + invalid-input handling.
- [ ] **Login** + wrong-password handling. Log in with `shay@trustticket.com` / `password123`.
- [ ] **Main feature / CRUD** — Tickets & Transactions pages trigger CREATE / UPDATE / DELETE DB calls.
- [ ] **AI feature** — the AI Advisor page; show empty/invalid input handling.
- [ ] **WebSocket** — the Live Updates page; open it in two tabs and show a live update.
- [ ] **Settings** page loads and a setting can be changed.
- [ ] **Navbar** navigation between pages works (and refresh doesn't 404 — thanks to the rewrite rule).
- [ ] **Logout** works.
- [ ] DB updates are visible in **MySQL Workbench** connected to RDS.

### MySQL Workbench external connection (for the 40-second DB demo)

- Connection Method: **Standard (TCP/IP)**
- Hostname: your **RDS endpoint**
- Port: `3306`
- Username: `admin`
- Password: your RDS password
- Test Connection → should succeed. Then run e.g. `SELECT * FROM users;` to show records
  created by app usage.

> On the staff's presentation computer (MySQL Workbench 8.0 CE), know how to **disconnect**
> an existing connection and **create a new** one with the details above.

---

## Submission form values

Provide in the final project form:

- **Public website URL** — the Render **frontend** URL
- **Backend URL** — the Render **backend** URL
- **AWS RDS endpoint** — from Step 3
- **Database username** — `admin`
- **Database password** — your RDS master password

---

## Redeploying after code changes

Render auto-deploys on every push to the main branch:

```bash
git add .
git commit -m "your change"
git push
```

- **Backend changes** → redeploy automatically; nothing else needed.
- **Frontend changes** → also auto-rebuilds. (Only if you changed a `REACT_APP_*` value do you
  need **Clear build cache & deploy**, since those are compiled in.)

---

## Troubleshooting

- **CORS error in the browser console** → `CLIENT_URL` on the backend must exactly match the
  frontend origin (no trailing slash), then redeploy the backend.
- **Frontend calls go to `localhost:3000`** → `REACT_APP_*` weren't set at build time; set them
  and **Clear build cache & deploy** the Static Site.
- **`DB_CONNECTION_ERROR`** → check `DB_HOST`/password, RDS is **Available**, **Public access =
  Yes**, and the security group allows `3306` from `0.0.0.0/0`. Quick test: open
  `https://<backend>.onrender.com/api/db-test`.
- **First request is slow (~50s)** → free Render web services sleep when idle and cold-start on
  the first hit. Open the site once a minute before presenting to keep it warm.
- **404 when refreshing a page like `/dashboard`** → add the SPA rewrite rule (Step 5.4).
