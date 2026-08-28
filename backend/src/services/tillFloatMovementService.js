import { db } from "../config/database.js";

function businessError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

function requiredUuid(value, label) {
  const v = String(value ?? "").trim();
  if (!v) throw businessError(`${label} is required.`);
  return v;
}

function requiredAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw businessError("Movement amount must be greater than zero.");
  }
  return amount;
}

function requiredCurrency(value) {
  const currency = String(value ?? "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw businessError("Currency code must be a valid 3-letter code.");
  }
  return currency;
}

async function getTillPool(tillPoolId) {
  const result = await db.query(
    `SELECT tfp.id, tfp.till_id, tfp.pool_type_id, tfp.name, tfp.is_active,
            t.branch_id, b.company_id,
            t.name AS till_name, t.code AS till_code,
            b.name AS branch_name
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

export async function createTillFloatTransfer(input = {}) {
  const sourceTillPoolId = requiredUuid(input.sourceTillPoolId, "Source Till financial pool");
  const destinationTillPoolId = requiredUuid(
    input.destinationTillPoolId,
    "Destination Till financial pool"
  );

  if (sourceTillPoolId === destinationTillPoolId) {
    throw businessError("Source and destination Till financial pools must be different.");
  }

  const sourcePool = await getTillPool(sourceTillPoolId);
  const destinationPool = await getTillPool(destinationTillPoolId);

  if (!sourcePool.is_active) {
    throw businessError("The source Till financial pool is inactive.");
  }
  if (!destinationPool.is_active) {
    throw businessError("The destination Till financial pool is inactive.");
  }
  if (sourcePool.company_id !== destinationPool.company_id) {
    throw businessError(
      "Source and destination Till financial pools must belong to the same company."
    );
  }

  const amount = requiredAmount(input.amount);
  const currencyCode = requiredCurrency(input.currencyCode);
  const reference = input.reference ? String(input.reference).trim() : null;
  const reason = (input.reason ?? input.note)
    ? String(input.reason ?? input.note).trim()
    : null;
  const occurredAt = input.occurredAt ?? null;
  const createdBy = input.createdBy ? String(input.createdBy).trim() : null;

  const result = await db.query(
    `INSERT INTO financial_pool_movements
       (company_id, source_till_pool_id, destination_till_pool_id,
        movement_type, amount, currency_code, reference, reason,
        occurred_at, created_by)
     VALUES
       ($1, $2, $3, 'ALLOCATION', $4, $5, $6, $7,
        COALESCE($8::timestamptz, CURRENT_TIMESTAMP), $9)
     RETURNING id, company_id, source_till_pool_id, destination_till_pool_id,
               movement_type, amount, currency_code, reference, reason,
               occurred_at, created_by, created_at`,
    [
      sourcePool.company_id, sourceTillPoolId, destinationTillPoolId,
      amount, currencyCode, reference, reason, occurredAt, createdBy
    ]
  );

  return {
    ...result.rows[0],
    source_till_name: sourcePool.till_name,
    source_till_code: sourcePool.till_code,
    source_pool_name: sourcePool.name,
    destination_till_name: destinationPool.till_name,
    destination_till_code: destinationPool.till_code,
    destination_pool_name: destinationPool.name
  };
}

export async function listTillFloatTransfers(filters = {}) {
  const values = [];
  const conditions = [
    "fpm.source_till_pool_id IS NOT NULL",
    "fpm.destination_till_pool_id IS NOT NULL"
  ];

  if (filters.sourceTillPoolId) {
    values.push(String(filters.sourceTillPoolId).trim());
    conditions.push(`fpm.source_till_pool_id = $${values.length}`);
  }
  if (filters.destinationTillPoolId) {
    values.push(String(filters.destinationTillPoolId).trim());
    conditions.push(`fpm.destination_till_pool_id = $${values.length}`);
  }
  if (filters.currencyCode) {
    values.push(requiredCurrency(filters.currencyCode));
    conditions.push(`fpm.currency_code = $${values.length}`);
  }
  if (filters.from) {
    values.push(String(filters.from).trim());
    conditions.push(`fpm.occurred_at >= $${values.length}::date`);
  }
  if (filters.to) {
    values.push(String(filters.to).trim());
    conditions.push(`fpm.occurred_at < ($${values.length}::date + INTERVAL '1 day')`);
  }

  const result = await db.query(
    `SELECT fpm.id, fpm.company_id, fpm.movement_type, fpm.amount,
            fpm.currency_code, fpm.reference, fpm.reason,
            fpm.source_till_pool_id, st.id AS source_till_id,
            st.name AS source_till_name, st.code AS source_till_code,
            sfp.name AS source_pool_name,
            fpm.destination_till_pool_id, dt.id AS destination_till_id,
            dt.name AS destination_till_name, dt.code AS destination_till_code,
            dfp.name AS destination_pool_name,
            fpm.occurred_at, fpm.created_by, fpm.created_at
     FROM financial_pool_movements fpm
     JOIN till_financial_pools sfp ON sfp.id = fpm.source_till_pool_id
     JOIN tills st ON st.id = sfp.till_id
     JOIN till_financial_pools dfp ON dfp.id = fpm.destination_till_pool_id
     JOIN tills dt ON dt.id = dfp.till_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY fpm.occurred_at, fpm.created_at`,
    values
  );
  return result.rows;
}
