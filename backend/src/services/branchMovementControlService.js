// Project Atlas — Engine 020
// Named component: branchMovementControlService
// Responsibility: controlled branch-level financial movements.
//
// This engine deliberately uses the existing financial_pool_movements ledger.
// No balance is overwritten: every approved transfer is a new ALLOCATION row.

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

async function getBranchPool(branchId, client) {
  const result = await client.query(
    `SELECT
       b.id AS branch_id,
       b.name AS branch_name,
       b.is_active AS branch_active,
       b.company_id,
       bfp.id AS branch_pool_id,
       bfp.name AS pool_name,
       bfp.is_active AS pool_active,
       fpt.code AS pool_type_code
     FROM branches b
     JOIN branch_financial_pools bfp ON bfp.branch_id = b.id
     JOIN financial_pool_types fpt ON fpt.id = bfp.pool_type_id
     WHERE b.id = $1
       AND fpt.code = 'OPERATING_CAPITAL'
     FOR UPDATE OF bfp`,
    [branchId]
  );

  if (result.rowCount === 0) {
    throw businessError("Operating Capital pool not found for the branch.", 404, "NOT_FOUND");
  }

  const pool = result.rows[0];
  if (!pool.branch_active) throw businessError("Cannot move funds from or to an inactive branch.");
  if (!pool.pool_active) throw businessError("The branch Operating Capital pool is inactive.");
  return pool;
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
    throw businessError("Operating Capital pool not found for the Till.", 404, "NOT_FOUND");
  }

  const pool = result.rows[0];
  if (!pool.branch_active) throw businessError("Cannot move funds through an inactive branch.");
  if (pool.till_status !== "ACTIVE") throw businessError("The destination Till must be ACTIVE.");
  if (!pool.pool_active) throw businessError("The Till Operating Capital pool is inactive.");
  return pool;
}

async function getBranchPoolBalance(poolId, client, currencyCode) {
  const result = await client.query(
    `SELECT COALESCE(SUM(
       CASE
         WHEN destination_branch_pool_id = $1 AND currency_code = $2 THEN amount
         WHEN source_branch_pool_id = $1 AND currency_code = $2 THEN -amount
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
       fpm.source_branch_pool_id,
       sb.name AS source_branch_name,
       fpm.destination_branch_pool_id,
       db.name AS destination_branch_name,
       fpm.destination_till_pool_id,
       dt.name AS destination_till_name,
       dt.code AS destination_till_code
     FROM financial_pool_movements fpm
     LEFT JOIN branch_financial_pools sbp ON sbp.id = fpm.source_branch_pool_id
     LEFT JOIN branches sb ON sb.id = sbp.branch_id
     LEFT JOIN branch_financial_pools dbp ON dbp.id = fpm.destination_branch_pool_id
     LEFT JOIN branches db ON db.id = dbp.branch_id
     LEFT JOIN till_financial_pools dtp ON dtp.id = fpm.destination_till_pool_id
     LEFT JOIN tills dt ON dt.id = dtp.till_id
     WHERE fpm.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function allocateBranchToTill(input = {}) {
  const branchId = requiredUuid(input.branchId, "Source branch");
  const tillPoolId = requiredUuid(input.destinationTillPoolId, "Destination Till financial pool");
  const amount = positiveAmount(input.amount);
  const currencyCode = currency(input.currencyCode);

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const branch = await getBranchPool(branchId, client);
    const till = await getTillPool(tillPoolId, client);

    if (branch.company_id !== till.company_id) {
      throw businessError("Source branch and destination Till must belong to the same company.");
    }
    if (branch.branch_id !== till.branch_id) {
      throw businessError("A Branch-to-Till allocation must stay within the same branch.");
    }

    const balance = await getBranchPoolBalance(branch.branch_pool_id, client, currencyCode);
    if (balance < amount) {
      throw businessError(
        `Insufficient ${currencyCode} Operating Capital in ${branch.branch_name}. Available: ${balance.toFixed(2)}.`
      );
    }

    const result = await client.query(
      `INSERT INTO financial_pool_movements
       (company_id, movement_type, amount, currency_code, reference, reason,
        occurred_at, created_by, source_branch_pool_id, destination_till_pool_id)
       VALUES ($1, 'ALLOCATION', $2, $3, $4, $5,
               COALESCE($6::timestamptz, CURRENT_TIMESTAMP), $7, $8, $9)
       RETURNING id`,
      [
        branch.company_id,
        amount,
        currencyCode,
        input.reference ?? null,
        input.reason ?? null,
        input.occurredAt ?? null,
        input.createdBy ?? null,
        branch.branch_pool_id,
        till.till_pool_id
      ]
    );

    await client.query("COMMIT");
    return await getMovement(result.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function transferBranchToBranch(input = {}) {
  const sourceBranchId = requiredUuid(input.sourceBranchId, "Source branch");
  const destinationBranchId = requiredUuid(input.destinationBranchId, "Destination branch");
  const amount = positiveAmount(input.amount);
  const currencyCode = currency(input.currencyCode);

  if (sourceBranchId === destinationBranchId) {
    throw businessError("Source and destination branches must be different.");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Lock in deterministic order to reduce deadlock risk when two transfers
    // are initiated against the same pair of branches at the same time.
    const orderedIds = [sourceBranchId, destinationBranchId].sort();
    const first = await getBranchPool(orderedIds[0], client);
    const second = await getBranchPool(orderedIds[1], client);
    const source = first.branch_id === sourceBranchId ? first : second;
    const destination = first.branch_id === destinationBranchId ? first : second;

    if (source.company_id !== destination.company_id) {
      throw businessError("Source and destination branches must belong to the same company.");
    }

    const balance = await getBranchPoolBalance(source.branch_pool_id, client, currencyCode);
    if (balance < amount) {
      throw businessError(
        `Insufficient ${currencyCode} Operating Capital in ${source.branch_name}. Available: ${balance.toFixed(2)}.`
      );
    }

    const result = await client.query(
      `INSERT INTO financial_pool_movements
       (company_id, movement_type, amount, currency_code, reference, reason,
        occurred_at, created_by, source_branch_pool_id, destination_branch_pool_id)
       VALUES ($1, 'ALLOCATION', $2, $3, $4, $5,
               COALESCE($6::timestamptz, CURRENT_TIMESTAMP), $7, $8, $9)
       RETURNING id`,
      [
        source.company_id,
        amount,
        currencyCode,
        input.reference ?? null,
        input.reason ?? null,
        input.occurredAt ?? null,
        input.createdBy ?? null,
        source.branch_pool_id,
        destination.branch_pool_id
      ]
    );

    await client.query("COMMIT");
    return await getMovement(result.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listBranchControlledMovements(filters = {}) {
  const values = [];
  const conditions = [];

  if (filters.branchId) {
    values.push(String(filters.branchId).trim());
    conditions.push(`(sbp.branch_id = $${values.length} OR dbp.branch_id = $${values.length})`);
  }
  if (filters.reference) {
    values.push(String(filters.reference).trim());
    conditions.push(`fpm.reference = $${values.length}`);
  }
  if (filters.from) {
    values.push(String(filters.from).trim());
    conditions.push(`fpm.occurred_at >= $${values.length}::date`);
  }
  if (filters.to) {
    values.push(String(filters.to).trim());
    conditions.push(`fpm.occurred_at < ($${values.length}::date + INTERVAL '1 day')`);
  }

  const limit = Math.min(Math.max(Number(filters.limit) || 100, 1), 500);
  values.push(limit);

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

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
       sb.name AS source_branch_name,
       db.name AS destination_branch_name,
       st.name AS destination_till_name,
       st.code AS destination_till_code
     FROM financial_pool_movements fpm
     LEFT JOIN branch_financial_pools sbp ON sbp.id = fpm.source_branch_pool_id
     LEFT JOIN branches sb ON sb.id = sbp.branch_id
     LEFT JOIN branch_financial_pools dbp ON dbp.id = fpm.destination_branch_pool_id
     LEFT JOIN branches db ON db.id = dbp.branch_id
     LEFT JOIN till_financial_pools dtp ON dtp.id = fpm.destination_till_pool_id
     LEFT JOIN tills st ON st.id = dtp.till_id
     ${where}
       ${where ? "AND" : "WHERE"}
       (fpm.source_branch_pool_id IS NOT NULL OR fpm.destination_branch_pool_id IS NOT NULL)
       AND (fpm.destination_till_pool_id IS NOT NULL OR fpm.destination_branch_pool_id IS NOT NULL)
     ORDER BY fpm.occurred_at DESC, fpm.created_at DESC
     LIMIT $${values.length}`,
    values
  );

  return result.rows;
}
