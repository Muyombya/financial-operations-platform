-- Project Atlas — Engine 023
-- Till-to-Till Movement Control
--
-- No balance is stored or edited by this migration. Till positions remain
-- derived from the immutable financial_pool_movements ledger.

BEGIN;

-- Prevent accidental duplicate references when an operator/client retries
-- the same movement. Existing NULL references remain allowed.
CREATE UNIQUE INDEX IF NOT EXISTS uq_financial_pool_movements_company_reference
    ON financial_pool_movements(company_id, reference)
    WHERE reference IS NOT NULL;

INSERT INTO schema_migrations (version, name)
VALUES ('020', 'till_to_till_movement_control')
ON CONFLICT (version) DO NOTHING;

COMMIT;
