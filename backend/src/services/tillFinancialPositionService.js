import { db } from "../config/database.js";

function businessError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

async function getTillPool(tillPoolId) {
  const result = await db.query(
    `SELECT tfp.id, tfp.till_id, tfp.pool_type_id, tfp.name, tfp.is_active,
            t.name AS till_name, t.code AS till_code, t.status AS till_status,
            t.branch_id, b.name AS branch_name
     FROM till_financial_pools tfp
     JOIN tills t ON t.id = tfp.till_id
     JOIN branches b ON b.id = t.branch_id
     WHERE tfp.id = $1`,
    [tillPoolId]
  );

  if (result.rowCount === 0) {
    throw businessError("Till financial pool not found.", 404);
  }

  return result.rows[0];
}

async function getTill(tillId) {
  const result = await db.query(
    `SELECT t.id, t.branch_id, t.name, t.code, t.status,
            b.name AS branch_name
     FROM tills t
     JOIN branches b ON b.id = t.branch_id
     WHERE t.id = $1`,
    [tillId]
  );

  if (result.rowCount === 0) {
    throw businessError("Till not found.", 404);
  }

  return result.rows[0];
}

function validateAsOf(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw businessError("The asOf timestamp is invalid.");
  }

  return date.toISOString();
}

function mapPosition(row) {
  return {
    ...row,
    opening_balance: row.opening_balance,
    total_inflows: row.total_inflows,
    total_outflows: row.total_outflows,
    balance: row.balance,
    transaction_count: Number(row.transaction_count)
  };
}

export async function getTillPoolPosition(tillPoolId, options = {}) {
  const pool = await getTillPool(tillPoolId);
  const asOf = validateAsOf(options.asOf);

  const result = await db.query(
    `SELECT
       tfp.id AS till_pool_id,
       tfp.till_id,
       tfp.name AS pool_name,
       tfp.is_active AS pool_active,
       t.name AS till_name,
       t.code AS till_code,
       t.status AS till_status,
       b.id AS branch_id,
       b.name AS branch_name,
       fpm.currency_code,
       COALESCE(SUM(
         CASE
           WHEN fpm.destination_till_pool_id = tfp.id THEN fpm.amount
           ELSE 0
         END
       ), 0)::NUMERIC(20,2) AS total_inflows,
       COALESCE(SUM(
         CASE
           WHEN fpm.source_till_pool_id = tfp.id THEN fpm.amount
           ELSE 0
         END
       ), 0)::NUMERIC(20,2) AS total_outflows,
       (
         COALESCE(SUM(
           CASE
             WHEN fpm.destination_till_pool_id = tfp.id THEN fpm.amount
             WHEN fpm.source_till_pool_id = tfp.id THEN -fpm.amount
             ELSE 0
           END
         ), 0)
       )::NUMERIC(20,2) AS balance,
       COUNT(fpm.id)::int AS transaction_count
     FROM till_financial_pools tfp
     JOIN tills t ON t.id = tfp.till_id
     JOIN branches b ON b.id = t.branch_id
     LEFT JOIN financial_pool_movements fpm
       ON (fpm.destination_till_pool_id = tfp.id
           OR fpm.source_till_pool_id = tfp.id)
      AND ($2::timestamptz IS NULL OR fpm.occurred_at <= $2::timestamptz)
     WHERE tfp.id = $1
     GROUP BY
       tfp.id, tfp.till_id, tfp.name, tfp.is_active,
       t.name, t.code, t.status,
       b.id, b.name,
       fpm.currency_code
     ORDER BY fpm.currency_code`,
    [tillPoolId, asOf]
  );

  return {
    till_pool_id: pool.id,
    till_id: pool.till_id,
    till_name: pool.till_name,
    till_code: pool.till_code,
    till_status: pool.till_status,
    branch_id: pool.branch_id,
    branch_name: pool.branch_name,
    pool_name: pool.name,
    pool_active: pool.is_active,
    as_of: asOf,
    positions: result.rows.map(mapPosition)
  };
}

export async function getTillFinancialPosition(tillId, options = {}) {
  const till = await getTill(tillId);
  const asOf = validateAsOf(options.asOf);

  const result = await db.query(
    `SELECT
       tfp.id AS till_pool_id,
       tfp.name AS pool_name,
       tfp.is_active AS pool_active,
       fpm.currency_code,
       COALESCE(SUM(
         CASE
           WHEN fpm.destination_till_pool_id = tfp.id THEN fpm.amount
           ELSE 0
         END
       ), 0)::NUMERIC(20,2) AS total_inflows,
       COALESCE(SUM(
         CASE
           WHEN fpm.source_till_pool_id = tfp.id THEN fpm.amount
           ELSE 0
         END
       ), 0)::NUMERIC(20,2) AS total_outflows,
       COALESCE(SUM(
         CASE
           WHEN fpm.destination_till_pool_id = tfp.id THEN fpm.amount
           WHEN fpm.source_till_pool_id = tfp.id THEN -fpm.amount
           ELSE 0
         END
       ), 0)::NUMERIC(20,2) AS balance,
       COUNT(fpm.id)::int AS transaction_count
     FROM till_financial_pools tfp
     LEFT JOIN financial_pool_movements fpm
       ON (fpm.destination_till_pool_id = tfp.id
           OR fpm.source_till_pool_id = tfp.id)
      AND ($2::timestamptz IS NULL OR fpm.occurred_at <= $2::timestamptz)
     WHERE tfp.till_id = $1
     GROUP BY tfp.id, tfp.name, tfp.is_active, fpm.currency_code
     ORDER BY tfp.name, fpm.currency_code`,
    [tillId, asOf]
  );

  const positions = result.rows.map((row) => ({
    till_pool_id: row.till_pool_id,
    pool_name: row.pool_name,
    pool_active: row.pool_active,
    currency_code: row.currency_code,
    total_inflows: row.total_inflows,
    total_outflows: row.total_outflows,
    balance: row.balance,
    transaction_count: Number(row.transaction_count)
  }));

  return {
    till_id: till.id,
    till_name: till.name,
    till_code: till.code,
    till_status: till.status,
    branch_id: till.branch_id,
    branch_name: till.branch_name,
    as_of: asOf,
    positions
  };
}

export async function listTillPoolPositions(options = {}) {
  const asOf = validateAsOf(options.asOf);

  const result = await db.query(
    `SELECT
       tfp.id AS till_pool_id,
       tfp.till_id,
       t.name AS till_name,
       t.code AS till_code,
       t.status AS till_status,
       t.branch_id,
       b.name AS branch_name,
       tfp.name AS pool_name,
       tfp.is_active AS pool_active,
       fpm.currency_code,
       COALESCE(SUM(
         CASE
           WHEN fpm.destination_till_pool_id = tfp.id THEN fpm.amount
           WHEN fpm.source_till_pool_id = tfp.id THEN -fpm.amount
           ELSE 0
         END
       ), 0)::NUMERIC(20,2) AS balance,
       COALESCE(SUM(
         CASE
           WHEN fpm.destination_till_pool_id = tfp.id THEN fpm.amount
           ELSE 0
         END
       ), 0)::NUMERIC(20,2) AS total_inflows,
       COALESCE(SUM(
         CASE
           WHEN fpm.source_till_pool_id = tfp.id THEN fpm.amount
           ELSE 0
         END
       ), 0)::NUMERIC(20,2) AS total_outflows,
       COUNT(fpm.id)::int AS transaction_count
     FROM till_financial_pools tfp
     JOIN tills t ON t.id = tfp.till_id
     JOIN branches b ON b.id = t.branch_id
     LEFT JOIN financial_pool_movements fpm
       ON (fpm.destination_till_pool_id = tfp.id
           OR fpm.source_till_pool_id = tfp.id)
      AND ($1::timestamptz IS NULL OR fpm.occurred_at <= $1::timestamptz)
     GROUP BY
       tfp.id, tfp.till_id,
       t.name, t.code, t.status,
       t.branch_id, b.name,
       tfp.name, tfp.is_active,
       fpm.currency_code
     ORDER BY t.name, tfp.name, fpm.currency_code`,
    [asOf]
  );

  return {
    as_of: asOf,
    positions: result.rows.map((row) => ({
      till_pool_id: row.till_pool_id,
      till_id: row.till_id,
      till_name: row.till_name,
      till_code: row.till_code,
      till_status: row.till_status,
      branch_id: row.branch_id,
      branch_name: row.branch_name,
      pool_name: row.pool_name,
      pool_active: row.pool_active,
      currency_code: row.currency_code,
      total_inflows: row.total_inflows,
      total_outflows: row.total_outflows,
      balance: row.balance,
      transaction_count: Number(row.transaction_count)
    }))
  };
}

export async function getTillPoolMovementHistory(tillPoolId, options = {}) {
  await getTillPool(tillPoolId);

  const asOf = validateAsOf(options.asOf);
  const limit = options.limit === undefined ? 100 : Number(options.limit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw businessError("The limit must be an integer between 1 and 500.");
  }

  const result = await db.query(
    `SELECT
       fpm.id,
       fpm.movement_type,
       fpm.amount,
       fpm.currency_code,
       fpm.reference,
       fpm.reason,
       fpm.occurred_at,
       fpm.created_by,
       fpm.created_at,
       CASE
         WHEN fpm.destination_till_pool_id = $1 THEN 'INFLOW'
         WHEN fpm.source_till_pool_id = $1 THEN 'OUTFLOW'
       END AS movement_direction,
       sfp.name AS source_pool_name,
       st.id AS source_till_id,
       st.name AS source_till_name,
       st.code AS source_till_code,
       dfp.name AS destination_pool_name,
       dt.id AS destination_till_id,
       dt.name AS destination_till_name,
       dt.code AS destination_till_code
     FROM financial_pool_movements fpm
     LEFT JOIN till_financial_pools sfp
       ON sfp.id = fpm.source_till_pool_id
     LEFT JOIN tills st
       ON st.id = sfp.till_id
     LEFT JOIN till_financial_pools dfp
       ON dfp.id = fpm.destination_till_pool_id
     LEFT JOIN tills dt
       ON dt.id = dfp.till_id
     WHERE (fpm.source_till_pool_id = $1 OR fpm.destination_till_pool_id = $1)
       AND ($2::timestamptz IS NULL OR fpm.occurred_at <= $2::timestamptz)
     ORDER BY fpm.occurred_at DESC, fpm.created_at DESC
     LIMIT $3`,
    [tillPoolId, asOf, limit]
  );

  return result.rows;
}
