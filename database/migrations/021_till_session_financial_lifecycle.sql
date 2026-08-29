-- Project Atlas — Engine 024
-- Till Session Financial Lifecycle Control
-- Assessment/control layer; no balance storage.

BEGIN;

INSERT INTO schema_migrations (version, name)
VALUES ('021', 'till_session_financial_lifecycle_control')
ON CONFLICT (version) DO NOTHING;

COMMIT;
