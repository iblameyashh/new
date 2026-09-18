# Learnique — Full-Stack Learning Platform

Django REST Framework (backend) + React 19 / Vite / Tailwind (frontend).

## Quick start

### Backend
```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Windows (source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
copy .env.example .env                         # then edit .env (see "Become the admin" below)
python manage.py migrate
python manage.py runserver                     # http://127.0.0.1:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                                    # http://localhost:5173
```

## 🔑 Become the admin (owner)

There is **no admin button** in the UI. Admin is claimed dynamically with a secret
code that lives only on the server:

1. Open `backend/.env` and set a long random secret:
   ```
   ADMIN_SETUP_CODE=paste-a-long-random-secret-code-here
   ```
   (or run `python seed.py` to create the account `admin@learnique.com` /
   `ChangeMe-1234!` — **edit the two ADMIN_ lines at the top of seed.py and
   delete them after running**, so credentials never stay in the repo).
2. Start the backend, then visit **`/admin-setup`** on the website
   (e.g. `http://localhost:5173/admin-setup`). The page is hidden — not linked
   in any menu.
3. Enter your **setup code**, **your email**, and a **password** (8+ chars):
   - account exists → it is promoted to admin after a password check;
   - account doesn't exist → a new admin account is created.
   You are logged in and taken straight to the **Owner Portal** (`/owner`).
4. (Optional, after claiming) remove the code from `.env` to lock the endpoint.

Admin recognition is fully server-side: `/api/auth/me/` returns an `is_admin`
flag, and every `/owner/*` route is guarded by it. Wrong attempts are
rate-limited (5/hour/IP) and never reveal whether the code, email or password
was wrong.

## Where to paste your email / password

| What | Where |
|---|---|
| Admin email + password | `backend/seed.py` → `ADMIN_EMAIL` / `ADMIN_PASSWORD` (top of file), or just use `/admin-setup` |
| Secret setup code | `backend/.env` → `ADMIN_SETUP_CODE` |
| AI chatbot key (optional) | `backend/.env` → `AI_API_KEY` |
| Frontend API URL (optional) | `frontend/.env` → `VITE_API_URL` |

## Tests

```bash
cd backend && python manage.py test     # 11 tests: auth, admin-setup, permissions
cd frontend && npm run lint && npm run build
```

## Security notes

- JWT auth (1-day access, 7-day refresh) with silent refresh + brute-force
  throttling on login (10/hour/IP) and admin-setup (5/hour/IP).
- Passwords hashed with Django's PBKDF2; registration enforces 8+ chars.
- CORS restricted via `CORS_ALLOWED_ORIGINS`; production settings force HTTPS,
  HSTS and secure cookies when `DEBUG=False`.
