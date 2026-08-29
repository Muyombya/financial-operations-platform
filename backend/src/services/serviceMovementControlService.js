// Project Atlas — Engine 021
// Named component: serviceMovementControlService
// Responsibility: controlled Till ↔ Service financial movements.
//
// This engine uses the immutable financial_pool_movements ledger.
// It never edits a balance directly. Every approved movement is a new
// ALLOCATION or RETURN ledger row.

import { db } from "../config/database.js";

function businessError(message, statusCode = 400, code = "BUSINESS_RULE") {
  const error = Object.assign(new Error(message), { statusCode });
  error.code = code;
  return error;
}

function translateMovementError(error) {
  if (
    error?.code === "23505" &&
    error?.constraint === "ux_financial_pool_movements_reference"
  ) {
    return businessError(
      "A financial movement with this reference already exists.",
      409,
      "DUPLICATE_REFERENCE"
    );
  }

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
  if (pool.till_status !== "ACTIVE") throw businessError("The Till must be ACTIVE.");
  if (!pool.pool_active) throw businessError("The Till Operating Capital pool is inactive.");
  return pool;
}

async function getServicePosition(positionId, client) {
  const result = await client.query(
    `SELECT
       p.id AS service_position_id,
       p.session_id,
       p.till_service_id,
       p.position_type,
       p.currency_code,
       s.id AS session_id_check,
       s.till_id,
       s.business_date,
       s.status AS session_status,
       ts.service_id,
       sv.name AS service_name,
       sv.code AS service_code,
       sp.name AS provider_name,
       sp.code AS provider_code,
       t.name AS till_name,
       t.code AS till_code,
       t.branch_id,
       b.company_id,
       b.name AS branch_name,
       b.is_active AS branch_active
     FROM service_session_positions p
     JOIN till_sessions s ON s.id = p.session_id
     JOIN till_services ts ON ts.id = p.till_service_id
     JOIN services sv ON sv.id = ts.service_id
     JOIN service_providers sp ON sp.id = sv.provider_id
     JOIN tills t ON t.id = s.till_id
     JOIN branches b ON b.id = t.branch_id
     WHERE p.id = $1
     FOR UPDATE OF p`,
    [positionId]
  );

  if (result.rowCount === 0) {
    throw businessError("Service session position not found.", 404, "NOT_FOUND");
  }

  const position = result.rows[0];
  if (!position.branch_active) throw businessError("Cannot move funds through an inactive branch.");
  if (position.session_status !== "OPEN") {
    throw businessError(`Service funding requires an OPEN Till session. Current status: ${position.session_status}.`);
  }
  if (position.position_type !== "FLOAT") {
    throw businessError("Till-to-Service funding is only permitted for FLOAT service positions.");
  }
  return position;
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

async function getServiceBalance(positionId, client, currencyCode) {
  const result = await client.query(
    `SELECT COALESCE(SUM(
       CASE
         WHEN destination_service_position_id = $1 AND currency_code = $2 THEN amount
         WHEN source_service_position_id = $1 AND currency_code = $2 THEN -amount
         ELSE 0
       END
     ), 0)::numeric(20,2) AS balance
     FROM financial_pool_movements`,
    [positionId, currencyCode]
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
       fpm.source_service_position_id,
       ssv.name AS source_service_name,
       ssv.code AS source_service_code,
       fpm.destination_till_pool_id,
       dt.name AS destination_till_name,
       dt.code AS destination_till_code,
       fpm.destination_service_position_id,
       dsv.name AS destination_service_name,
       dsp.code AS destination_service_code
     FROM financial_pool_movements fpm
     LEFT JOIN till_financial_pools stp ON stp.id = fpm.source_till_pool_id
     LEFT JOIN tills st ON st.id = stp.till_id
     LEFT JOIN service_session_positions sspx ON sspx.id = fpm.source_service_position_id
     LEFT JOIN till_services stsv ON stsv.id = sspx.till_service_id
     LEFT JOIN services ssv ON ssv.id = stsv.service_id
     LEFT JOIN till_financial_pools dtp ON dtp.id = fpm.destination_till_pool_id
     LEFT JOIN tills dt ON dt.id = dtp.till_id
     LEFT JOIN service_session_positions dspx ON dspx.id = fpm.destination_service_position_id
     LEFT JOIN till_services dtserv ON dtserv.id = dspx.till_service_id
     LEFT JOIN services dsv ON dsv.id = dtserv.service_id
     LEFT JOIN service_providers dsp ON dsp.id = dsv.provider_id
     WHERE fpm.id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function allocateTillToService(input = {}) {
  const tillPoolId = requiredUuid(input.sourceTillPoolId, "Source Till financial pool");
  const servicePositionId = requiredUuid(input.destinationServicePositionId, "Destination service position");
  const amount = positiveAmount(input.amount);
  const currencyCode = currency(input.currencyCode);

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const till = await getTillPool(tillPoolId, client);
    const service = await getServicePosition(servicePositionId, client);

    if (till.company_id !== service.company_id) {
      throw businessError("Source Till and destination service must belong to the same company.");
    }
    if (till.branch_id !== service.branch_id) {
      throw businessError("Till-to-Service allocation must stay within the same branch.");
    }
    if (till.till_id !== service.till_id) {
      throw businessError("The service position must belong to the source Till.");
    }
    if (service.currency_code && String(service.currency_code).toUpperCase() !== currencyCode) {
      throw businessError(`Service position currency does not match ${currencyCode}.`);
    }

    const balance = await getTillBalance(till.till_pool_id, client, currencyCode);
    if (balance < amount) {
      throw businessError(
        `Insufficient ${currencyCode} Operating Capital in ${till.till_name}. Available: ${balance.toFixed(2)}.`
      );
    }

    const result = await client.query(
      `INSERT INTO financial_pool_movements
       (company_id, movement_type, amount, currency_code, reference, reason,
        occurred_at, created_by, source_till_pool_id, destination_service_position_id)
       VALUES ($1, 'ALLOCATION', $2, $3, $4, $5,
               COALESCE($6::timestamptz, CURRENT_TIMESTAMP), $7, $8, $9)
       RETURNING id`,
      [
        till.company_id,
        amount,
        currencyCode,
        input.reference ?? null,
        input.reason ?? null,
        input.occurredAt ?? null,
        input.createdBy ?? null,
        till.till_pool_id,
        service.service_position_id
      ]
    );

    await client.query("COMMIT");
    return await getMovement(result.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw translateMovementError(error);
  } finally {
    client.release();
  }
}

export async function returnServiceToTill(input = {}) {
  const servicePositionId = requiredUuid(input.sourceServicePositionId, "Source service position");
  const tillPoolId = requiredUuid(input.destinationTillPoolId, "Destination Till financial pool");
  const amount = positiveAmount(input.amount);
  const currencyCode = currency(input.currencyCode);

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const service = await getServicePosition(servicePositionId, client);
    const till = await getTillPool(tillPoolId, client);

    if (service.company_id !== till.company_id) {
      throw businessError("Source service and destination Till must belong to the same company.");
    }
    if (service.branch_id !== till.branch_id) {
      throw businessError("Service-to-Till return must stay within the same branch.");
    }
    if (service.till_id !== till.till_id) {
      throw businessError("The service position must belong to the destination Till.");
    }
    if (service.currency_code && String(service.currency_code).toUpperCase() !== currencyCode) {
      throw businessError(`Service position currency does not match ${currencyCode}.`);
    }

    const balance = await getServiceBalance(service.service_position_id, client, currencyCode);
    if (balance < amount) {
      throw businessError(
        `Insufficient ${currencyCode} service position balance in ${service.service_name}. Available: ${balance.toFixed(2)}.`
      );
    }

    const result = await client.query(
      `INSERT INTO financial_pool_movements
       (company_id, movement_type, amount, currency_code, reference, reason,
        occurred_at, created_by, source_service_position_id, destination_till_pool_id)
       VALUES ($1, 'RETURN', $2, $3, $4, $5,
               COALESCE($6::timestamptz, CURRENT_TIMESTAMP), $7, $8, $9)
       RETURNING id`,
      [
        service.company_id,
        amount,
        currencyCode,
        input.reference ?? null,
        input.reason ?? null,
        input.occurredAt ?? null,
        input.createdBy ?? null,
        service.service_position_id,
        till.till_pool_id
      ]
    );

    await client.query("COMMIT");
    return await getMovement(result.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw translateMovementError(error);
  } finally {
    client.release();
  }
}

export async function getServiceMovementHistory(positionId, filters = {}) {
  const servicePositionId = requiredUuid(positionId, "Service position");
  const values = [servicePositionId];
  const conditions = [
    "(fpm.source_service_position_id = $1 OR fpm.destination_service_position_id = $1)"
  ];

  if (filters.from) {
    values.push(String(filters.from).trim());
    conditions.push(`fpm.occurred_at >= $${values.length}::date`);
  }
  if (filters.to) {
    values.push(String(filters.to).trim());
    conditions.push(`fpm.occurred_at < ($${values.length}::date + INTERVAL '1 day')`);
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
         WHEN fpm.source_service_position_id = $1 THEN 'OUTFLOW'
         ELSE 'INFLOW'
       END AS movement_direction,
       ssv.name AS source_service_name,
       dsv.name AS destination_service_name,
       st.name AS source_till_name,
       dt.name AS destination_till_name
     FROM financial_pool_movements fpm
     LEFT JOIN service_session_positions sspx ON sspx.id = fpm.source_service_position_id
     LEFT JOIN till_services stsv ON stsv.id = sspx.till_service_id
     LEFT JOIN services ssv ON ssv.id = stsv.service_id
     LEFT JOIN service_session_positions dspx ON dspx.id = fpm.destination_service_position_id
     LEFT JOIN till_services dtserv ON dtserv.id = dspx.till_service_id
     LEFT JOIN services dsv ON dsv.id = dtserv.service_id
     LEFT JOIN till_financial_pools stp ON stp.id = fpm.source_till_pool_id
     LEFT JOIN tills st ON st.id = stp.till_id
     LEFT JOIN till_financial_pools dtp ON dtp.id = fpm.destination_till_pool_id
     LEFT JOIN tills dt ON dt.id = dtp.till_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY fpm.occurred_at ASC, fpm.created_at ASC`,
    values
  );

  return result.rows;
}
