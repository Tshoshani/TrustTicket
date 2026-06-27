# TrustTicket — Deployment Guide (Render + AWS RDS)

**Single-service** deployment: one Render **Web Service** runs the Express backend,
which **also serves the compiled React frontend** from the same origin. The database
is MySQL on **AWS RDS**.

## Architecture

| Component | Where | What it is |
|-----------|-------|------------|
| Frontend + Backend | Render **Web Service** | Express serves the API **and** the pre-built React app (`frontend/build`) from one origin |
| Database | **AWS RDS** MySQL | Reachable from the internet (Render + MySQL Workbench) |

Because the frontend and API share one origin, the frontend calls the API with a
relative `/api` and Socket.IO connects to the same origin — **no CORS or cross-URL
config needed**. The backend talks to MySQL over `DB_HOST` etc.

> **The React app is compiled locally and committed to git** (`frontend/build`).
> Express serves those files in production. The bundler (CRA `react-scripts`, the
> equivalent of Parcel) is only used locally — never on the server.

---

## What was set up to make this deploy-ready (already in the repo)

- **`backend/src/server.js`** — uses `process.env.PORT` (Render injects it) and now
  **serves `frontend/build`** as static files, with a SPA fallback so refreshing a
  route like `/dashboard` returns `index.html` instead of a 404. API routes under
  `/api/*` always take precedence.
- **Frontend env** — `frontend/.env.production` sets `REACT_APP_API_URL=/api` (relative,
  same origin) and an empty socket URL (same origin). `frontend/.env.development` keeps
  local dev pointed at `http://localhost:3000`.
- **`frontend/build` is committed** (un-ignored in `.gitignore`) so Render serves the
  compiled app without building the frontend on the server.
- **`backend/scripts/seed.js`** + `npm run seed` — one command that runs
  `migrations/schema.sql` then `migrations/seed.sql` against whatever DB the env points
  to (local MySQL **or** RDS).
- **Auth** — public `POST /auth/register` (self sign-up) and `POST /auth/login`.
- **Tickets CRUD** — create / update (verify·purchase·redeem) / delete a listing.

---

## Prerequisites

- The project pushed to **GitHub** (Render deploys from GitHub, branch **main**).
- A free **Render** account (https://render.com) connected to that GitHub.
- A free **AWS** account (https://aws.amazon.com) for RDS.
- (Optional) A **Gemini API key** from https://aistudio.google.com/apikey for the AI
  feature. Without it the backend falls back to its offline engine, so the AI feature
  still works.

---

## Build the frontend & push (do this whenever the frontend changes)

```bash
cd frontend
npm install
npm run build          # compiles JSX -> frontend/build (index.html, .js, .css, .map)

cd ..
git add frontend/build
git commit -m "build client"
git push
```

`.env` files are git-ignored (never commit secrets). All backend secrets go into the
Render dashboard instead. `frontend/.env.production` is safe to commit — it only contains
relative paths.

---

## Step 1 — Start the AWS RDS database (do this first, ~5 min)

1. AWS Console → **RDS** → **Create database**.
2. **Standard create** → Engine **MySQL** → Template **Free tier**.
3. Settings:
   - **DB instance identifier**: `trustticket-db`
   - **Master username**: `admin`
   - **Master password**: choose one and **save it** (becomes `DB_PASSWORD`).
4. **Connectivity** → **Public access: Yes**.
5. Leave the rest as defaults → **Create database**, then move on to Step 2 — don't wait.

> No need to set an "initial database name" — the seed script creates the
> `trustticket` database itself.

---

## Step 2 — Create the Render Web Service

While RDS is still creating:

1. Render → **New** → **Web Service** → connect your GitHub repo → branch **main**.
2. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. Add the environment variables below (placeholder `DB_HOST` is fine for now), then
   **Create Web Service**.

### Environment variables (Render → Environment)

| Key           | Value                                            |
|---------------|--------------------------------------------------|
| `DB_HOST`     | your RDS endpoint (fill in after Step 3)         |
| `DB_PORT`     | `3306`                                           |
| `DB_NAME`     | `trustticket`                                    |
| `DB_USER`     | `admin`                                          |
| `DB_PASSWORD` | your RDS master password                         |
| `AI_PROVIDER` | `gemini`                                         |
| `AI_API_KEY`  | your Gemini key (or leave blank to use local AI) |
| `AI_MODEL`    | `gemini-2.5-flash`                               |
| `AI_GROUNDING`| `true`                                           |

> **Do NOT set `PORT`** — Render injects it and the code reads it.
> You do **not** need `CLIENT_URL` / CORS settings — the frontend is same-origin.

Render gives you one URL like `https://trustticket.onrender.com` — that single URL is
**both** the website and the API. Note it down.

---

## Step 3 — Finish the RDS setup (once status shows "Available")

1. **Get the endpoint**: click the instance → **Connectivity & security** → copy the
   **Endpoint** (e.g. `trustticket-db.xxxxx.eu-central-1.rds.amazonaws.com`). Paste it as
   `DB_HOST` in the Render env vars.
2. **Open the firewall**: instance page → **VPC security group** → **Inbound rules** →
   **Edit inbound rules** → **Add rule**:
   - Type = **MySQL/Aurora** (port `3306`)
   - Source = **Anywhere-IPv4** (`0.0.0.0/0`)
   - **Save rules**

   Required so Render **and** the presentation computer's MySQL Workbench can connect.

---

## Step 4 — Seed the database

Run this **from your own machine**, pointing at RDS. Edit `backend/.env`:

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

## Step 5 — Trigger the final deploy

Once `DB_HOST` is set in Render and the DB is seeded:

1. Render → the Web Service → **Manual Deploy → Deploy latest commit**.
2. Wait for the log to show **"Your service is live"**.
3. Open the `.onrender.com` URL — the React app loads and is connected to the API + DB.

---

## Step 6 — Verify (maps to the assignment checklist)

Open the Render URL and confirm:

- [ ] Site loads from the Render URL.
- [ ] **Create user** (the "Create an account" toggle on the login page) + invalid-input handling.
- [ ] **Login** + wrong-password handling. Log in with `shay@trustticket.com` / `password123`.
- [ ] **CRUD** — Dashboard: List a Ticket (CREATE), Purchase/Redeem/Verify (UPDATE),
      "Delete listing" in a ticket's details (DELETE).
- [ ] **AI feature** — the AI Advisor; show empty/invalid input handling.
- [ ] **WebSocket** — the Live Updates page; open it in two tabs and show a live update.
- [ ] **Settings** page loads and a setting can be changed.
- [ ] **Navbar** navigation works (and refresh doesn't 404 — SPA fallback handles it).
- [ ] **Logout** works.
- [ ] DB updates are visible in **MySQL Workbench** connected to RDS.

### MySQL Workbench external connection (40-second DB demo)

- Connection Method: **Standard (TCP/IP)**
- Hostname: your **RDS endpoint** · Port: `3306`
- Username: `admin` · Password: your RDS password
- Test Connection → should succeed. Then run e.g. `SELECT * FROM users;`.

---

## Submission form values

- **Public website URL** — the Render Web Service URL
- **Backend URL** — same Render URL (single service)
- **AWS RDS endpoint** — from Step 3
- **Database username** — `admin`
- **Database password** — your RDS master password

---

## Redeploying after code changes

Render auto-deploys on every push to **main**.

- **Backend change** → `git add . && git commit && git push` → redeploys automatically.
- **Frontend change** → you must **rebuild and commit the build** first (the server serves
  the committed `frontend/build`):

  ```bash
  cd frontend && npm run build
  cd .. && git add frontend/build && git commit -m "rebuild client" && git push
  ```

---

## Troubleshooting

- **Frontend loads but API calls fail** → check the Render env vars (`DB_*`) and that the
  service is "Live". Quick test: open `https://<your-app>.onrender.com/api/health`.
- **`DB_CONNECTION_ERROR`** → check `DB_HOST`/password, RDS is **Available**, **Public
  access = Yes**, and the security group allows `3306` from `0.0.0.0/0`. Quick test:
  `https://<your-app>.onrender.com/api/db-test`.
- **Old frontend after a change** → you forgot to rebuild/commit `frontend/build`. Run the
  rebuild-and-commit step above.
- **404 when refreshing `/dashboard`** → should not happen (Express has a SPA fallback). If
  it does, confirm the latest `backend/src/server.js` is deployed.
- **First request is slow (~50s)** → free Render services sleep when idle and cold-start on
  the first hit. Open the site once a minute before presenting to keep it warm.
