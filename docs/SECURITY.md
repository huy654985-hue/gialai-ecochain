# Security — current status (honest)

Implemented:
- CORS allowlist explicit origins, no wildcard with credentials (`backend/app/main.py`)
- In-memory per-IP rate limiting 60/min (single instance only; resets on restart;
  not correct across multiple/serverless instances — roadmap: Redis-backed limiter)
- No secrets in frontend; all provider keys stay backend-side
- Community confirm rules enforced server-side (cross-commune 403, duplicate 400)

NOT yet implemented (roadmap, do not claim otherwise):
- JWT login/token + RBAC user/roles — no `/login`/`/token` route, no
  `Depends(get_current_user)`; `passlib`/`python-jose` are listed but unused.
  `GET .../api-gateway` previously returned a static
  `{"authentication":"JWT",...}` dict — now returns real capability flags.
- Audit logs, Alembic migrations, PostGIS switch beyond `DATABASE_URL`.
