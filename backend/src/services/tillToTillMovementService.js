// Project Atlas — Engine 023
// Named component: tillToTillMovementService
// Responsibility: controlled Till ↔ Till financial movements.
//
// Uses the immutable financial_pool_movements ledger.
// It never edits a balance directly. An approved transfer is one new
// ALLOCATION ledger row with a Till pool on each endpoint.

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

function positiveAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw businessError("Amount must be greater than zero.");
  }
  return amount;
}

function currency(value) {
  const code = String(value ?? "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    throw businessError("Currency code must be a valid three-letter code.");
  }
  return code;
}

function optionalReference(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

async function getTillPool(tillPoolId, client) {
  const result = await client.query(
    `SELECT
       tfp.id AS till_pool_id,
       tfp.till_id,
       tfp.name AS pool_name,
       tfp.is_active AS pool_active,
       t.branch_id,
       t.name AS till_name,
       t.code AS till_code,
       t.status AS till_status,
       b.company_id,
       b.name AS branch_name,
       b.is_active AS branch_active,
       fpt.code AS pool_type_code
     FROM till_financial_pools tfp
     JOIN tills t ON t.id = tfp.till_id
     JOIN branches b ON b.id = t.branch_id
     JOIN financial_pool_types fpt ON fpt.id = tfp.pool_type_id
     WHERE tfp.id = $1
       AND fpt.code = 'OPERATING_CAPITAL'
     FOR UPDATE OF tfp`,
    [tillPoolId]
  );

  if (result.rowCount === 0) {
    throw businessError(
      "Operating Capital pool not found for the Till.",
      404,
      "NOT_FOUND"
    );
  }

  const pool = result.rows[0];

  if (!pool.branch_active) {
    throw businessError("Cannot move funds through an inactive branch.");
  }
  if (pool.till_status !== "ACTIVE") {
    throw businessError("The Till must be ACTIVE.");
  }
  if (!pool.pool_active) {
    throw businessError("The Till Operating Capital pool is inactive.");
  }

  return pool;
}

async function getTillBalance(poolId, client, currencyCode) {
  const result = await client.query(
    `SELECT COALESCE(SUM(
       CASE
         WHEN destination_till_pool_id = $1 AND currency_code = $2 THEN amount
         WHEN source_till_pool_id = $1 AND currency_code = $2 THEN -amount
         ELSE 0
       END
     ), 0)::numeric(20,2) AS balance
     FROM financial_pool_movements`,
    [poolId, currencyCode]
  );

  return Number(result.rows[0].balance);
}

async function getMovement(id, client = db) {
  const result = await client.query(
    `SELECT
       fpm.id,
       fpm.company_id,
       fpm.movement_type,
       fpm.amount,
       fpm.currency_code,
       fpm.reference,
       fpm.reason,
       fpm.occurred_at,
       fpm.created_by,
       fpm.created_at,
       fpm.source_till_pool_id,
       st.name AS source_till_name,
       st.code AS source_till_code,
       fpm.destination_till_pool_id,
       dt.name AS destination_till_name,
       dt.code AS destination_till_code
     FROM financial_pool_movements fpm
     LEFT JOIN till_financial_pools stp
       ON stp.id = fpm.source_till_pool_id
     LEFT JOIN tills st
       ON st.id = stp.till_id
     LEFT JOIN till_financial_pools dtp
       ON dtp.id = fpm.destination_till_pool_id
     LEFT JOIN tills dt
       ON dt.id = dtp.till_id
     WHERE fpm.id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function transferTillToTill(input = {}) {
  const sourceTillPoolId = requiredUuid(
    input.sourceTillPoolId,
    "Source Till financial pool"
  );
  const destinationTillPoolId = requiredUuid(
    input.destinationTillPoolId,
    "Destination Till financial pool"
  );
  const amount = positiveAmount(input.amount);
  const currencyCode = currency(input.currencyCode);
  const reference = optionalReference(input.reference);

  if (sourceTillPoolId === destinationTillPoolId) {
    throw businessError("Source and destination Till must be different.");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Lock in deterministic order to reduce deadlock risk when two transfers
    // involving the same pair of Tills occur concurrently.
    const ids = [sourceTillPoolId, destinationTillPoolId].sort();
    const first = await getTillPool(ids[0], client);
    const second = await getTillPool(ids[1], client);
    const source = first.till_pool_id === sourceTillPoolId ? first : second;
    const destination = first.till_pool_id === destinationTillPoolId ? first : second;

    if (source.company_id !== destination.company_id) {
      throw businessError(
        "Source and destination Till must belong to the same company."
      );
    }

    if (source.branch_id !== destination.branch_id) {
      throw businessError(
        "Till-to-Till movement must stay within the same branch."
      );
    }

    const balance = await getTillBalance(
      source.till_pool_id,
      client,
      currencyCode
    );

    if (balance < amount) {
      throw businessError(
        `Insufficient ${currencyCode} Operating Capital in ${source.till_name}. Available: ${balance.toFixed(2)}.`
      );
    }

    const result = await client.query(
      `INSERT INTO financial_pool_movements
       (company_id,
        movement_type,
        amount,
        currency_code,
        reference,
        reason,
        occurred_at,
        created_by,
        source_till_pool_id,
        destination_till_pool_id)
       VALUES ($1,
               'ALLOCATION',
               $2,
               $3,
               $4,
               $5,
               COALESCE($6::timestamptz, CURRENT_TIMESTAMP),
               $7,
               $8,
               $9)
       RETURNING id`,
      [
        source.company_id,
        amount,
        currencyCode,
        reference,
        input.reason ?? null,
        input.occurredAt ?? null,
        input.createdBy ?? null,
        source.till_pool_id,
        destination.till_pool_id
      ]
    );

    await client.query("COMMIT");
    return await getMovement(result.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");

    // PostgreSQL unique-reference protection becomes a business-level retry
    // error instead of leaking a raw database constraint message.
    if (error?.code === "23505") {
      throw businessError(
        "This movement reference has already been used for this company.",
        409,
        "DUPLICATE_REFERENCE"
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function getTillToTillMovementHistory(tillPoolId, options = {}) {
  const poolId = requiredUuid(tillPoolId, "Till financial pool");
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);

  const result = await db.query(
    `SELECT
       fpm.id,
       fpm.company_id,
       fpm.movement_type,
       fpm.amount,
       fpm.currency_code,
       fpm.reference,
       fpm.reason,
       fpm.occurred_at,
       fpm.created_by,
       fpm.created_at,
       CASE
         WHEN fpm.source_till_pool_id = $1 THEN 'OUTFLOW'
         WHEN fpm.destination_till_pool_id = $1 THEN 'INFLOW'
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
     WHERE (fpm.source_till_pool_id = $1
            OR fpm.destination_till_pool_id = $1)
       AND fpm.source_till_pool_id IS NOT NULL
       AND fpm.destination_till_pool_id IS NOT NULL
     ORDER BY fpm.occurred_at DESC, fpm.created_at DESC
     LIMIT $2`,
    [poolId, limit]
  );

  return result.rows;
}
