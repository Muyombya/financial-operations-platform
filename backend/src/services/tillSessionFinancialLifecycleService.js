// Project Atlas — Engine 024
// Named component: tillSessionFinancialLifecycleService
// Read-only financial lifecycle assessment.

import { db } from "../config/database.js";

function requiredUuid(value, label) {
  const text = String(value ?? "").trim();
  if (!text) {
    const error = new Error(`${label} is required.`);
    error.statusCode = 400;
    error.code = "BUSINESS_RULE";
    throw error;
  }
  return text;
}

async function getSession(client, sessionId) {
  const result = await client.query(
    `SELECT s.id AS session_id, s.till_id, s.business_date,
            s.status AS session_status, t.name AS till_name,
            t.code AS till_code, t.status AS till_status,
            b.id AS branch_id, b.name AS branch_name, b.company_id
     FROM till_sessions s
     JOIN tills t ON t.id = s.till_id
     JOIN branches b ON b.id = t.branch_id
     WHERE s.id = $1`,
    [sessionId]
  );
  if (result.rowCount === 0) {
    const error = new Error("Till session not found.");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }
  return result.rows[0];
}

async function getOpeningPositionState(client, sessionId) {
  const result = await client.query(
    `SELECT COUNT(*)::int AS position_count
     FROM till_session_opening_positions
     WHERE session_id = $1`,
    [sessionId]
  );
  const count = Number(result.rows[0]?.position_count ?? 0);
  return { recorded: count > 0, position_count: count };
}

async function getServicePositionState(client, sessionId) {
  const result = await client.query(
    `SELECT
       COUNT(*)::int AS total_positions,

       COUNT(*) FILTER (
         WHERE latest.status IS NULL
       )::int AS unreconciled_positions,

       COUNT(*) FILTER (
         WHERE latest.status = 'BALANCED'
       )::int AS balanced_positions,

       COUNT(*) FILTER (
         WHERE latest.status IS NOT NULL
           AND latest.status <> 'BALANCED'
       )::int AS variance_positions,

       COALESCE(
         SUM(
           CASE
             WHEN latest.status IS NULL THEN 0
             ELSE ABS(COALESCE(latest.variance_amount, 0))
           END
         ),
         0
       ) AS total_variance

     FROM service_session_positions p

     LEFT JOIN LATERAL (
       SELECT
         r.status,
         r.variance_amount
       FROM service_session_reconciliations r
       WHERE r.service_position_id = p.id
         AND r.session_id = p.session_id
       ORDER BY r.recorded_at DESC, r.updated_at DESC
       LIMIT 1
     ) latest ON true

     WHERE p.session_id = $1`,
    [sessionId]
  );

  const row = result.rows[0] ?? {};

  return {
    total_positions: Number(row.total_positions ?? 0),
    unreconciled_positions: Number(row.unreconciled_positions ?? 0),
    balanced_positions: Number(row.balanced_positions ?? 0),
    variance_positions: Number(row.variance_positions ?? 0),
    total_variance: String(row.total_variance ?? "0")
  };
}
async function getMovementState(client, sessionId) {
  const result = await client.query(
    `SELECT COUNT(*)::int AS movement_count
     FROM financial_pool_movements fpm
     WHERE fpm.source_service_position_id IN
       (SELECT id FROM service_session_positions WHERE session_id = $1)
        OR fpm.destination_service_position_id IN
       (SELECT id FROM service_session_positions WHERE session_id = $1)
        OR fpm.source_till_pool_id IN
       (SELECT tfp.id FROM till_financial_pools tfp
        JOIN till_sessions s ON s.till_id = tfp.till_id WHERE s.id = $1)
        OR fpm.destination_till_pool_id IN
       (SELECT tfp.id FROM till_financial_pools tfp
        JOIN till_sessions s ON s.till_id = tfp.till_id WHERE s.id = $1)`,
    [sessionId]
  );
  return { count: Number(result.rows[0]?.movement_count ?? 0) };
}

async function getSettlementState(client, sessionId) {
  const result = await client.query(
    `SELECT id AS settlement_id, status AS settlement_status,
            outcome AS settlement_outcome, settled_at
     FROM till_session_settlements
     WHERE session_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [sessionId]
  );
  if (result.rowCount === 0) {
    return {
      exists: false, settlement_id: null, status: null,
      outcome: null, settled_at: null
    };
  }
  const row = result.rows[0];
  return {
    exists: true,
    settlement_id: row.settlement_id,
    status: row.settlement_status,
    outcome: row.settlement_outcome,
    settled_at: row.settled_at
  };
}

export async function getTillSessionFinancialLifecycle(sessionId) {
  const id = requiredUuid(sessionId, "Till session");
  const client = await db.connect();

  try {
    const session = await getSession(client, id);
    const openingPosition = await getOpeningPositionState(client, id);
    const servicePositions = await getServicePositionState(client, id);
    const financialMovements = await getMovementState(client, id);
    const settlement = await getSettlementState(client, id);

    const blockingReasons = [];

    if (!openingPosition.recorded) {
      blockingReasons.push(
        "Till opening position has not been recorded."
      );
    }

    if (servicePositions.unreconciled_positions > 0) {
      blockingReasons.push(
        `${servicePositions.unreconciled_positions} service position(s) have not been reconciled.`
      );
    }

    if (servicePositions.variance_positions > 0) {
      blockingReasons.push(
        `${servicePositions.variance_positions} service position(s) have a financial variance.`
      );
    }

    const canBeginClosing =
      session.session_status === "OPEN" &&
      openingPosition.recorded &&
      servicePositions.unreconciled_positions === 0 &&
      servicePositions.variance_positions === 0;

    const canSettle =
      (session.session_status === "OPEN" ||
       session.session_status === "CLOSING") &&
      openingPosition.recorded &&
      servicePositions.unreconciled_positions === 0 &&
      servicePositions.variance_positions === 0 &&
      (!settlement.exists || settlement.status !== "SETTLED");

    const canClose =
      session.session_status === "CLOSING" &&
      settlement.exists &&
      settlement.status === "SETTLED" &&
      settlement.outcome === "BALANCED";

    return {
      session: {
        session_id: session.session_id,
        till_id: session.till_id,
        till_name: session.till_name,
        till_code: session.till_code,
        till_status: session.till_status,
        branch_id: session.branch_id,
        branch_name: session.branch_name,
        business_date: session.business_date,
        status: session.session_status
      },
      opening_position: openingPosition,
      financial_movements: financialMovements,

      reconciliation: {
        total_positions: servicePositions.total_positions,
        unreconciled_positions: servicePositions.unreconciled_positions,
        balanced_positions: servicePositions.balanced_positions,
        variance_positions: servicePositions.variance_positions,
        total_variance: servicePositions.total_variance
      },

      settlement,

      readiness: {
        can_begin_closing: canBeginClosing,
        can_settle: canSettle,
        can_close: canClose,
        blocking_reasons: blockingReasons
      }
    };
  } finally {
    client.release();
  }
}
