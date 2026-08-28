-- Project Atlas — Engine 011
-- Migration 017: Reconciliation History Trail
-- Named component: reconciliationHistory

BEGIN;

CREATE TABLE IF NOT EXISTS service_session_reconciliation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reconciliation_id UUID NOT NULL
        REFERENCES service_session_reconciliations(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    session_id UUID NOT NULL
        REFERENCES till_sessions(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    service_position_id UUID NOT NULL
        REFERENCES service_session_positions(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    previous_actual_amount NUMERIC(20,2),
    new_actual_amount NUMERIC(20,2) NOT NULL,

    expected_amount NUMERIC(20,2) NOT NULL,

    previous_variance_amount NUMERIC(20,2),
    new_variance_amount NUMERIC(20,2) NOT NULL,

    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,

    change_note TEXT,

    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT reconciliation_history_new_status_check
        CHECK (new_status IN ('BALANCED', 'SHORT', 'EXCESS')),

    CONSTRAINT reconciliation_history_previous_status_check
        CHECK (
            previous_status IS NULL
            OR previous_status IN ('BALANCED', 'SHORT', 'EXCESS')
        ),

    CONSTRAINT reconciliation_history_new_actual_check
        CHECK (new_actual_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_history_reconciliation
    ON service_session_reconciliation_history(reconciliation_id, changed_at);

CREATE INDEX IF NOT EXISTS idx_reconciliation_history_position
    ON service_session_reconciliation_history(service_position_id, changed_at);

INSERT INTO schema_migrations (version, name)
VALUES ('017', 'reconciliation_history')
ON CONFLICT (version) DO NOTHING;

COMMIT;
