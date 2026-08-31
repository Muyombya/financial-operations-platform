// Project Atlas — Engine 025
// Named component: tillSessionFinancialLifecycleControlService
// Controlled Till Session lifecycle transitions.
// Consumes existing financial state; never stores or edits balances.

import { db } from "../config/database.js";

function businessError(message, statusCode = 400, code = "BUSINESS_RULE") {
  const error = Object.assign(new Error(message), { statusCode });
  error.code = code;
  return error;
}

function requiredUuid(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw businessError(`${label} is required.`);
  return text;
}

async function getLockedSession(client, sessionId) {
  const result = await client.query(
    `SELECT s.id AS session_id, s.till_id, s.business_date,
            s.status AS session_status, t.name AS till_name,
            t.code AS till_code, t.status AS till_status,
            b.id AS branch_id, b.name AS branch_name, b.company_id
     FROM till_sessions s
     JOIN tills t ON t.id = s.till_id
     JOIN branches b ON b.id = t.branch_id
     WHERE s.id = $1
     FOR UPDATE OF s`,
    [sessionId]
  );
  if (result.rowCount === 0) {
    throw businessError("Till session not found.", 404, "NOT_FOUND");
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

async function getReconciliationState(client, sessionId) {
  const result = await client.query(
    `SELECT
       COUNT(*)::int AS total_positions,
       COUNT(*) FILTER (WHERE latest.status IS NULL)::int AS unreconciled_positions,
       COUNT(*) FILTER (WHERE latest.status = 'BALANCED')::int AS balanced_positions,
       COUNT(*) FILTER (
         WHERE latest.status IS NOT NULL AND latest.status <> 'BALANCED'
       )::int AS variance_positions,
       COALESCE(
         SUM(
           CASE
             WHEN latest.status IS NULL THEN 0
             ELSE ABS(COALESCE(latest.variance_amount, 0))
           END
         ), 0
       ) AS total_variance
     FROM service_session_positions p
     LEFT JOIN LATERAL (
       SELECT r.status, r.variance_amount
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

function blockingReasons(openingPosition, reconciliation) {
  const reasons = [];
  if (!openingPosition.recorded) {
    reasons.push("Till opening position has not been recorded.");
  }
  if (reconciliation.unreconciled_positions > 0) {
    reasons.push(
      `${reconciliation.unreconciled_positions} service position(s) have not been reconciled.`
    );
  }
  if (reconciliation.variance_positions > 0) {
    reasons.push(
      `${reconciliation.variance_positions} service position(s) have a financial variance.`
    );
  }
  return reasons;
}

async function beginClosing(client, sessionId) {
  const session = await getLockedSession(client, sessionId);
  const opening = await getOpeningPositionState(client, sessionId);
  const reconciliation = await getReconciliationState(client, sessionId);
  const reasons = blockingReasons(opening, reconciliation);

  if (session.session_status !== "OPEN") {
    throw businessError(
      `Till session cannot begin closing from status ${session.session_status}.`,
      409, "INVALID_LIFECYCLE_STATE"
    );
  }

  if (reasons.length) {
    throw businessError(
      `Till session is not ready to begin closing: ${reasons.join(" ")}`,
      409, "LIFECYCLE_BLOCKED"
    );
  }

  const result = await client.query(
    `UPDATE till_sessions
     SET status = 'CLOSING'
     WHERE id = $1 AND status = 'OPEN'
     RETURNING id AS session_id, status AS session_status`,
    [sessionId]
  );

  if (result.rowCount !== 1) {
    throw businessError(
      "Till session could not be moved to CLOSING.",
      409, "LIFECYCLE_CONFLICT"
    );
  }

  return {
    action: "BEGIN_CLOSING",
    previous_status: "OPEN",
    new_status: result.rows[0].session_status,
    session_id: result.rows[0].session_id
  };
}

async function closeSession(client, sessionId) {
  const session = await getLockedSession(client, sessionId);
  const opening = await getOpeningPositionState(client, sessionId);
  const reconciliation = await getReconciliationState(client, sessionId);
  const settlement = await getSettlementState(client, sessionId);
  const reasons = blockingReasons(opening, reconciliation);

  if (session.session_status !== "CLOSING") {
    throw businessError(
      `Till session cannot close from status ${session.session_status}.`,
      409, "INVALID_LIFECYCLE_STATE"
    );
  }

  if (reasons.length) {
    throw businessError(
      `Till session is not ready to close: ${reasons.join(" ")}`,
      409, "LIFECYCLE_BLOCKED"
    );
  }

  if (!settlement.exists) {
    throw businessError(
      "Till session cannot close because no settlement exists.",
      409, "SETTLEMENT_REQUIRED"
    );
  }

  if (settlement.status !== "SETTLED") {
    throw businessError(
      `Till session cannot close because settlement status is ${settlement.status}.`,
      409, "SETTLEMENT_REQUIRED"
    );
  }

  if (settlement.outcome !== "BALANCED") {
    throw businessError(
      `Till session cannot close because settlement outcome is ${settlement.outcome}.`,
      409, "SETTLEMENT_NOT_BALANCED"
    );
  }

  const result = await client.query(
    `UPDATE till_sessions
     SET status = 'CLOSED'
     WHERE id = $1 AND status = 'CLOSING'
     RETURNING id AS session_id, status AS session_status`,
    [sessionId]
  );

  if (result.rowCount !== 1) {
    throw businessError(
      "Till session could not be moved to CLOSED.",
      409, "LIFECYCLE_CONFLICT"
    );
  }

  return {
    action: "CLOSE_SESSION",
    previous_status: "CLOSING",
    new_status: result.rows[0].session_status,
    session_id: result.rows[0].session_id
  };
}

async function executeTransition(sessionId, transition) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = transition === "BEGIN_CLOSING"
      ? await beginClosing(client, sessionId)
      : await closeSession(client, sessionId);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function beginTillSessionClosing(sessionId) {
  return executeTransition(
    requiredUuid(sessionId, "Till session"), "BEGIN_CLOSING"
  );
}

export async function closeTillSession(sessionId) {
  return executeTransition(
    requiredUuid(sessionId, "Till session"), "CLOSE"
  );
}
