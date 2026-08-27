// Project Atlas — Engine 013-B
// Named component: businessDateTransactionAnalyticsService
// Responsibility: multi-session transaction analytics using business_date.
// Reads only from the authoritative financial_transactions ledger.

import { db } from "../config/database.js";

function businessError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

function validateDate(value, fieldName) {
  const date = String(value ?? "").trim();
  if (!date) throw businessError(`${fieldName} is required.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw businessError(`${fieldName} must use YYYY-MM-DD format.`);
  }
  return date;
}

function validateRange(input = {}) {
  const from = validateDate(input.from, "from");
  const to = validateDate(input.to, "to");

  if (from > to) {
    throw businessError("The from date cannot be later than the to date.");
  }

  return { from, to };
}

function formatBusinessDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

export async function getBusinessDateTransactionAnalytics(input = {}) {
  const { from, to } = validateRange(input);

  const totals = await db.query(
    `SELECT
       COUNT(ft.id)::int AS total_transactions,
       COUNT(ft.id) FILTER (WHERE ft.transaction_type = 'DEPOSIT')::int
         AS deposit_count,
       COUNT(ft.id) FILTER (WHERE ft.transaction_type = 'WITHDRAWAL')::int
         AS withdrawal_count,
       COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'DEPOSIT'), 0)
         AS deposit_total,
       COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'WITHDRAWAL'), 0)
         AS withdrawal_total,
       COALESCE(SUM(ft.amount), 0) AS total_movement,
       COUNT(DISTINCT ft.session_id)::int AS session_count,
       COUNT(DISTINCT ts.id)::int AS till_count
     FROM financial_transactions ft
     JOIN till_sessions sess ON sess.id = ft.session_id
     JOIN tills ts ON ts.id = sess.till_id
     WHERE sess.business_date >= $1::date
       AND sess.business_date < ($2::date + INTERVAL '1 day')`,
    [from, to]
  );

  const breakdown = await db.query(
    `SELECT
       sess.business_date::date AS business_date,
       ts.id AS till_id,
       ts.name AS till_name,
       sp.name AS provider_name,
       sp.code AS provider_code,
       s.name AS service_name,
       s.code AS service_code,
       ft.currency_code,
       COUNT(ft.id)::int AS total_transactions,
       COUNT(ft.id) FILTER (WHERE ft.transaction_type = 'DEPOSIT')::int
         AS deposit_count,
       COUNT(ft.id) FILTER (WHERE ft.transaction_type = 'WITHDRAWAL')::int
         AS withdrawal_count,
       COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'DEPOSIT'), 0)
         AS deposit_total,
       COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'WITHDRAWAL'), 0)
         AS withdrawal_total,
       COALESCE(SUM(ft.amount), 0) AS total_movement
     FROM financial_transactions ft
     JOIN till_sessions sess ON sess.id = ft.session_id
     JOIN tills ts ON ts.id = sess.till_id
     JOIN till_services tls ON tls.id = ft.till_service_id
     JOIN services s ON s.id = tls.service_id
     JOIN service_providers sp ON sp.id = s.provider_id
     WHERE sess.business_date >= $1::date
       AND sess.business_date < ($2::date + INTERVAL '1 day')
     GROUP BY
       sess.business_date::date,
       ts.id, ts.name,
       sp.name, sp.code,
       s.name, s.code,
       ft.currency_code
     ORDER BY
       sess.business_date::date,
       ts.name,
       sp.name,
       s.name,
       ft.currency_code`,
    [from, to]
  );

  return {
    from_date: from,
    to_date: to,
    total_transactions: Number(totals.rows[0].total_transactions),
    deposit_count: Number(totals.rows[0].deposit_count),
    withdrawal_count: Number(totals.rows[0].withdrawal_count),
    deposit_total: totals.rows[0].deposit_total,
    withdrawal_total: totals.rows[0].withdrawal_total,
    total_movement: totals.rows[0].total_movement,
    session_count: Number(totals.rows[0].session_count),
    till_count: Number(totals.rows[0].till_count),
    breakdown: breakdown.rows.map((row) => ({
      ...row,
      business_date: formatBusinessDate(row.business_date)
    }))
  };
}

export async function getTillTransactionAnalytics(input = {}) {
  const { from, to } = validateRange(input);
  const tillId = String(input.tillId ?? "").trim();

  if (!tillId) throw businessError("tillId is required.");

  const result = await db.query(
    `SELECT
       ts.id AS till_id,
       ts.name AS till_name,
       COUNT(ft.id)::int AS total_transactions,
       COUNT(ft.id) FILTER (WHERE ft.transaction_type = 'DEPOSIT')::int
         AS deposit_count,
       COUNT(ft.id) FILTER (WHERE ft.transaction_type = 'WITHDRAWAL')::int
         AS withdrawal_count,
       COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'DEPOSIT'), 0)
         AS deposit_total,
       COALESCE(SUM(ft.amount) FILTER (WHERE ft.transaction_type = 'WITHDRAWAL'), 0)
         AS withdrawal_total,
       COALESCE(SUM(ft.amount), 0) AS total_movement,
       COUNT(DISTINCT ft.session_id)::int AS session_count
     FROM tills ts
     LEFT JOIN till_sessions sess
       ON sess.till_id = ts.id
      AND sess.business_date >= $2::date
      AND sess.business_date < ($3::date + INTERVAL '1 day')
     LEFT JOIN financial_transactions ft
       ON ft.session_id = sess.id
     WHERE ts.id = $1
     GROUP BY ts.id, ts.name`,
    [tillId, from, to]
  );

  if (result.rowCount === 0) {
    throw businessError("Till not found.", 404);
  }

  const row = result.rows[0];

  return {
    from_date: from,
    to_date: to,
    till_id: row.till_id,
    till_name: row.till_name,
    total_transactions: Number(row.total_transactions),
    deposit_count: Number(row.deposit_count),
    withdrawal_count: Number(row.withdrawal_count),
    deposit_total: row.deposit_total,
    withdrawal_total: row.withdrawal_total,
    total_movement: row.total_movement,
    session_count: Number(row.session_count)
  };
}
