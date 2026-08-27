// Project Atlas — Engine 014
// Named component: financialPositionAssessmentService
// Responsibility: assemble authoritative opening, expected, actual and
// settlement facts into a financial position assessment.
// This engine does NOT record transactions, reconcile positions, or settle sessions.

import { db } from "../config/database.js";

function businessError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

function formatDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

async function getPosition(positionId) {
  const result = await db.query(
    `SELECT
       p.id,
       p.session_id,
       p.till_service_id,
       p.position_type,
       p.currency_code,
       p.opening_amount,
       sess.till_id,
       sess.business_date,
       sess.status AS session_status
     FROM service_session_positions p
     JOIN till_sessions sess ON sess.id = p.session_id
     WHERE p.id = $1`,
    [positionId]
  );

  if (result.rowCount === 0) {
    throw businessError("Service session position not found.", 404);
  }

  return result.rows[0];
}

async function getPositionAssessment(positionId) {
  const result = await db.query(
    `SELECT
       p.id AS service_position_id,
       p.session_id,
       p.till_service_id,
       p.position_type,
       p.currency_code,
       p.opening_amount,
       sess.till_id,
       sess.business_date,
       sess.status AS session_status,

       sp.name AS provider_name,
       sp.code AS provider_code,
       s.name AS service_name,
       s.code AS service_code,

       ep.total_increases,
       ep.total_decreases,
       ep.expected_amount,

       r.id AS reconciliation_id,
       r.actual_amount,
       r.variance_amount,
       r.status AS reconciliation_status,
       r.note AS reconciliation_note,
       r.recorded_at AS reconciliation_recorded_at,
       r.updated_at AS reconciliation_updated_at,

       st.id AS settlement_id,
       st.status AS settlement_status,
       st.outcome AS settlement_outcome,
       st.settled_at,
       st.note AS settlement_note
     FROM service_session_positions p
     JOIN till_sessions sess ON sess.id = p.session_id
     JOIN till_services ts ON ts.id = p.till_service_id
     JOIN services s ON s.id = ts.service_id
     JOIN service_providers sp ON sp.id = s.provider_id
     JOIN service_session_expected_positions ep
       ON ep.service_position_id = p.id
     LEFT JOIN service_session_reconciliations r
       ON r.service_position_id = p.id
     LEFT JOIN till_session_settlements st
       ON st.session_id = p.session_id
     WHERE p.id = $1`,
    [positionId]
  );

  if (result.rowCount === 0) {
    throw businessError("Service session position not found.", 404);
  }

  const row = result.rows[0];

  return {
    service_position_id: row.service_position_id,
    session_id: row.session_id,
    till_id: row.till_id,
    business_date: formatDate(row.business_date),
    session_status: row.session_status,

    till_service_id: row.till_service_id,
    provider_name: row.provider_name,
    provider_code: row.provider_code,
    service_name: row.service_name,
    service_code: row.service_code,

    position_type: row.position_type,
    currency_code: row.currency_code,

    opening_amount: row.opening_amount,
    total_increases: row.total_increases,
    total_decreases: row.total_decreases,
    expected_amount: row.expected_amount,

    actual_amount: row.actual_amount,
    variance_amount: row.variance_amount,
    reconciliation_status: row.reconciliation_status,
    reconciliation_id: row.reconciliation_id,
    reconciliation_note: row.reconciliation_note,
    reconciliation_recorded_at: row.reconciliation_recorded_at,
    reconciliation_updated_at: row.reconciliation_updated_at,

    settlement_id: row.settlement_id,
    settlement_status: row.settlement_status,
    settlement_outcome: row.settlement_outcome,
    settled_at: row.settled_at,
    settlement_note: row.settlement_note,

    reconciled: row.reconciliation_id !== null,
    settled: row.settlement_status === "SETTLED"
  };
}

export async function getFinancialPositionAssessment(positionId) {
  await getPosition(positionId);
  return getPositionAssessment(positionId);
}

export async function getSessionFinancialPositionAssessment(sessionId) {
  const sessionResult = await db.query(
    `SELECT id, till_id, business_date, status
     FROM till_sessions
     WHERE id = $1`,
    [sessionId]
  );

  if (sessionResult.rowCount === 0) {
    throw businessError("Till session not found.", 404);
  }

  const session = sessionResult.rows[0];

  const result = await db.query(
    `SELECT
       p.id AS service_position_id,
       p.position_type,
       p.currency_code,
       p.opening_amount,
       ep.total_increases,
       ep.total_decreases,
       ep.expected_amount,
       r.actual_amount,
       r.variance_amount,
       r.status AS reconciliation_status,
       ts.id AS till_service_id,
       sp.name AS provider_name,
       sp.code AS provider_code,
       s.name AS service_name,
       s.code AS service_code
     FROM service_session_positions p
     JOIN service_session_expected_positions ep
       ON ep.service_position_id = p.id
     JOIN till_services ts
       ON ts.id = p.till_service_id
     JOIN services s
       ON s.id = ts.service_id
     JOIN service_providers sp
       ON sp.id = s.provider_id
     LEFT JOIN service_session_reconciliations r
       ON r.service_position_id = p.id
     WHERE p.session_id = $1
     ORDER BY
       CASE p.position_type WHEN 'CASH' THEN 1 WHEN 'FLOAT' THEN 2 ELSE 3 END,
       sp.name,
       s.name,
       p.currency_code`,
    [sessionId]
  );

  const positions = result.rows.map((row) => ({
    service_position_id: row.service_position_id,
    till_service_id: row.till_service_id,
    provider_name: row.provider_name,
    provider_code: row.provider_code,
    service_name: row.service_name,
    service_code: row.service_code,
    position_type: row.position_type,
    currency_code: row.currency_code,
    opening_amount: row.opening_amount,
    total_increases: row.total_increases,
    total_decreases: row.total_decreases,
    expected_amount: row.expected_amount,
    actual_amount: row.actual_amount,
    variance_amount: row.variance_amount,
    reconciliation_status: row.reconciliation_status,
    reconciled: row.reconciliation_status !== null
  }));

  const summary = {
    total_positions: positions.length,
    cash_positions: positions.filter((p) => p.position_type === "CASH").length,
    float_positions: positions.filter((p) => p.position_type === "FLOAT").length,
    reconciled_positions: positions.filter((p) => p.reconciled).length,
    unresolved_positions: positions.filter((p) => !p.reconciled).length,
    balanced_positions: positions.filter((p) => p.reconciliation_status === "BALANCED").length,
    short_positions: positions.filter((p) => p.reconciliation_status === "SHORT").length,
    excess_positions: positions.filter((p) => p.reconciliation_status === "EXCESS").length
  };

  return {
    session_id: session.id,
    till_id: session.till_id,
    business_date: formatDate(session.business_date),
    session_status: session.status,
    summary,
    positions
  };
}
