# Portfolio backend

Express + Mongoose + JWT backend for the portfolio site.

## Setup

```bash
cd server
npm install
cp .env.example .env   # fill MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed:admin     # creates / updates the single admin user
npm run dev            # http://localhost:4000
```

## Endpoints (step 1)

- `GET  /api/health`        - liveness
- `POST /api/auth/login`    - `{ email, password }` → sets `pk_auth` httpOnly cookie
- `POST /api/auth/logout`   - clears cookie
- `GET  /api/auth/me`       - requires cookie, returns current admin
