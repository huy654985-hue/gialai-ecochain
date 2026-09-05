-- PostGIS production bootstrap for EcoGL.
-- Run once as a superuser (or the DB owner) on the production database,
-- e.g. Neon / Supabase / self-hosted Postgres, then point the backend at:
--   DATABASE_URL=postgresql+psycopg2://USER:PASS@HOST:5432/ecogl
--
-- The app stores geometry as GeoJSON text (SQLite-compatible), so it boots
-- on plain Postgres too — PostGIS only unlocks spatial indexes + queries.

CREATE EXTENSION IF NOT EXISTS postgis;

-- Spatial index on raw geometry payloads (JSON text columns).
-- Add real Geometry columns later via Alembic when switching to geoalchemy2 types.

-- Example: GIST index for administrative unit lookups by code/level.
CREATE INDEX IF NOT EXISTS ix_admin_units_level ON administrative_units (level);
CREATE INDEX IF NOT EXISTS ix_risk_score_unit ON risk_scores (administrative_unit_id);
CREATE INDEX IF NOT EXISTS ix_alert_status ON alerts (status);
CREATE INDEX IF NOT EXISTS ix_proposals_status ON proposals (status);
