# Security — current status (honest)

Implemented:
- CORS allowlist explicit origins, no wildcard with credentials (`backend/app/main.py`)
- JWT auth: `POST /api/auth/register` (first user → `admin`, rest `viewer`),
  `POST /api/auth/login` (OAuth2 password flow), `GET /api/auth/me`,
  `Depends(get_current_user)` / `require_role()` in `backend/app/core/security.py`
  (bcrypt passwords, HS256 via `python-jose`; `SECRET_KEY`/`ALGORITHM`/
  `ACCESS_TOKEN_EXPIRE_MINUTES` from env). Existing data routes are NOT
  force-protected yet — opt-in per route.
- In-memory per-IP rate limiting 60/min (single instance only; resets on restart;
  not correct across multiple/serverless instances — roadmap: Redis-backed limiter)
- No secrets in frontend; all provider keys stay backend-side
- Community confirm rules enforced server-side (cross-commune 403, duplicate 400)
- Alembic scaffold (`backend/alembic/`, `alembic.ini`) — new schema changes go
  through revisions; `create_all()` remains as dev fallback.

NOT yet implemented (roadmap, do not claim otherwise):
- Enforcing auth on all write routes, refresh-token rotation, audit-log shipping.
- Redis-backed rate limiting, PostGIS switch beyond `DATABASE_URL`.
