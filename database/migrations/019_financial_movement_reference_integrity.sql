-- Project Atlas — Engine 022
-- Migration 019: Financial Movement Reference Integrity
-- Named component: financialMovementReferenceIntegrity

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS
    ux_financial_pool_movements_reference
ON financial_pool_movements(reference)
WHERE reference IS NOT NULL;

INSERT INTO schema_migrations (version, name)
VALUES ('019', 'financial_movement_reference_integrity')
ON CONFLICT (version) DO NOTHING;

COMMIT;
