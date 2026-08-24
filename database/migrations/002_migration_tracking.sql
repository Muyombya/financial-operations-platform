-- ============================================================
-- Project Atlas
-- Migration 002: Migration Tracking
-- ============================================================
--
-- Purpose:
-- Record which database migrations have been applied to the current
-- Project Atlas database.
--
-- This is internal platform metadata, not a business table.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (version, name)
VALUES (
    '001',
    'organization_engine'
)
ON CONFLICT (version) DO NOTHING;

INSERT INTO schema_migrations (version, name)
VALUES (
    '002',
    'migration_tracking'
)
ON CONFLICT (version) DO NOTHING;

COMMIT;
