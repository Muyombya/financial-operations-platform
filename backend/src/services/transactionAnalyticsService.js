// Project Atlas — Engine 013
// Named component: transactionAnalyticsService
// Reads Engine 008's authoritative financial_transactions ledger.

import { db } from "../config/database.js";

function businessError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

async function getSession(sessionId) {
  const result = await db.query(
    `SELECT id, till_id, business_date, status FROM till_sessions WHERE id = $1`,
    [sessionId]
  );
  if (result.rowCount === 0) throw businessError("Till session not found.", 404);
  return result.rows[0];
}

export async function getTransactionSummary(sessionId) {
  const session = await getSession(sessionId);
  const result = await db.query(
    `SELECT
       COUNT(*)::int AS total_transactions,
       COUNT(*) FILTER (WHERE transaction_type='DEPOSIT')::int AS deposit_count,
       COUNT(*) FILTER (WHERE transaction_type='WITHDRAWAL')::int AS withdrawal_count,
       COALESCE(SUM(amount) FILTER (WHERE transaction_type='DEPOSIT'),0) AS deposit_total,
       COALESCE(SUM(amount) FILTER (WHERE transaction_type='WITHDRAWAL'),0) AS withdrawal_total,
       COALESCE(SUM(amount),0) AS total_movement
     FROM financial_transactions WHERE session_id=$1`,
    [sessionId]
  );
  const r=result.rows[0];
  return {
    session_id: session.id, till_id: session.till_id,
    business_date: session.business_date, session_status: session.status,
    total_transactions:Number(r.total_transactions),
    deposit_count:Number(r.deposit_count),
    withdrawal_count:Number(r.withdrawal_count),
    deposit_total:r.deposit_total, withdrawal_total:r.withdrawal_total,
    total_movement:r.total_movement
  };
}

export async function getTransactionServiceBreakdown(sessionId) {
  await getSession(sessionId);
  const result=await db.query(
    `SELECT sp.name AS provider_name, sp.code AS provider_code,
       s.name AS service_name, s.code AS service_code, ft.currency_code,
       COUNT(*)::int AS total_transactions,
       COUNT(*) FILTER (WHERE ft.transaction_type='DEPOSIT')::int AS deposit_count,
       COUNT(*) FILTER (WHERE ft.transaction_type='WITHDRAWAL')::int AS withdrawal_count,
       COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type='DEPOSIT'),0) AS deposit_total,
       COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type='WITHDRAWAL'),0) AS withdrawal_total,
       COALESCE(SUM(ft.amount),0) AS total_movement
     FROM financial_transactions ft
     JOIN till_services ts ON ts.id=ft.till_service_id
     JOIN services s ON s.id=ts.service_id
     JOIN service_providers sp ON sp.id=s.provider_id
     WHERE ft.session_id=$1
     GROUP BY sp.name,sp.code,s.name,s.code,ft.currency_code
     ORDER BY sp.name,s.name,ft.currency_code`,
    [sessionId]
  );
  return result.rows;
}

export async function getTransactionAnalytics(sessionId) {
  const [summary, services]=await Promise.all([
    getTransactionSummary(sessionId),
    getTransactionServiceBreakdown(sessionId)
  ]);
  return {...summary, services};
}
