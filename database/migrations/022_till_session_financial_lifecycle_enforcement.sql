-- Project Atlas — Engine 025
-- Till Session Financial Lifecycle Enforcement
-- Enforcement layer only; no balance storage.

BEGIN;

INSERT INTO schema_migrations (version, name)
VALUES ('022', 'till_session_financial_lifecycle_enforcement')
ON CONFLICT (version) DO NOTHING;

COMMIT;
