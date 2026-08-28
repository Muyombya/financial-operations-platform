// Project Atlas — Engine 011
// Named component: reconciliationHistoryService
// Responsibility: read immutable reconciliation history.
// History creation is coordinated by reconciliationService so the current
// reconciliation update and history entry remain in one DB transaction.

import { db } from "../config/database.js";

function businessError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

export async function getReconciliationHistory(positionId) {
  const position = await db.query(
    `SELECT id
     FROM service_session_positions
     WHERE id = $1`,
    [positionId]
  );

  if (position.rowCount === 0) {
    throw businessError("Service session position not found.", 404);
  }

  const result = await db.query(
    `SELECT
       h.id,
       h.reconciliation_id,
       h.session_id,
       h.service_position_id,
       h.previous_actual_amount,
       h.new_actual_amount,
       h.expected_amount,
       h.previous_variance_amount,
       h.new_variance_amount,
       h.previous_status,
       h.new_status,
       h.change_note,
       h.changed_at
     FROM service_session_reconciliation_history h
     WHERE h.service_position_id = $1
     ORDER BY h.changed_at ASC, h.id ASC`,
    [positionId]
  );

  return result.rows;
}
