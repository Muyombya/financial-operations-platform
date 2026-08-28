import { db } from "../config/database.js";

const VALID_STATUSES = ["ACTIVE", "INACTIVE", "RETIRED"];
const OPERATING_CAPITAL_CODE = "OPERATING_CAPITAL";

function businessError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

function validateCreateInput(input = {}) {
  const name = String(input.name ?? "").trim();
  const code = String(input.code ?? "").trim().toUpperCase();

  if (!name) throw businessError("Till name is required.");
  if (!code) throw businessError("Till code is required.");

  return {
    name,
    code,
    description: input.description ?? null
  };
}

async function getOperatingCapitalPoolType(client) {
  const result = await client.query(
    `SELECT id, code, name
     FROM financial_pool_types
     WHERE code = $1
       AND is_active = TRUE
     LIMIT 1`,
    [OPERATING_CAPITAL_CODE]
  );

  if (result.rowCount === 0) {
    throw businessError(
      "The Operating Capital financial pool type is not configured or is inactive."
    );
  }

  return result.rows[0];
}

async function ensureOperatingCapitalPool(client, tillId) {
  const existing = await client.query(
    `SELECT id, till_id, pool_type_id, name, is_active,
            created_at, updated_at
     FROM till_financial_pools
     WHERE till_id = $1
       AND pool_type_id = (
         SELECT id
         FROM financial_pool_types
         WHERE code = $2
         LIMIT 1
       )
     LIMIT 1`,
    [tillId, OPERATING_CAPITAL_CODE]
  );

  if (existing.rowCount > 0) {
    const pool = existing.rows[0];

    if (!pool.is_active) {
      const reactivated = await client.query(
        `UPDATE till_financial_pools
         SET is_active = TRUE,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, till_id, pool_type_id, name, is_active,
                   created_at, updated_at`,
        [pool.id]
      );
      return reactivated.rows[0];
    }

    return pool;
  }

  const poolType = await getOperatingCapitalPoolType(client);

  const result = await client.query(
    `INSERT INTO till_financial_pools
       (till_id, pool_type_id, name, is_active)
     VALUES
       ($1, $2, $3, TRUE)
     RETURNING id, till_id, pool_type_id, name, is_active,
               created_at, updated_at`,
    [tillId, poolType.id, poolType.name]
  );

  return result.rows[0];
}

export async function createTill(branchId, input) {
  const { name, code, description } = validateCreateInput(input);

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const branch = await client.query(
      `SELECT id, name, is_active
       FROM branches
       WHERE id = $1`,
      [branchId]
    );

    if (branch.rowCount === 0) {
      throw businessError("Branch not found.", 404);
    }

    if (!branch.rows[0].is_active) {
      throw businessError("Cannot create a Till under an inactive branch.");
    }

    const result = await client.query(
      `INSERT INTO tills (branch_id, name, code, status, description)
       VALUES ($1, $2, $3, 'ACTIVE', $4)
       RETURNING id, branch_id, name, code, status, description,
                 created_at, updated_at`,
      [branchId, name, code, description]
    );

    const till = result.rows[0];
    const operatingCapitalPool = await ensureOperatingCapitalPool(
      client,
      till.id
    );

    await client.query("COMMIT");

    return {
      ...till,
      operating_capital_pool: operatingCapitalPool
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listTills(branchId) {
  const branch = await db.query(
    `SELECT id
     FROM branches
     WHERE id = $1`,
    [branchId]
  );

  if (branch.rowCount === 0) {
    throw businessError("Branch not found.", 404);
  }

  const result = await db.query(
    `SELECT t.id, t.branch_id, t.name, t.code, t.status,
            t.description, t.created_at, t.updated_at,
            tfp.id AS operating_capital_pool_id,
            tfp.name AS operating_capital_pool_name,
            tfp.is_active AS operating_capital_pool_active
     FROM tills t
     LEFT JOIN financial_pool_types fpt
       ON fpt.code = $2
     LEFT JOIN till_financial_pools tfp
       ON tfp.till_id = t.id
      AND tfp.pool_type_id = fpt.id
     WHERE t.branch_id = $1
     ORDER BY t.created_at`,
    [branchId, OPERATING_CAPITAL_CODE]
  );

  return result.rows;
}

export async function getTill(tillId) {
  const result = await db.query(
    `SELECT t.id, t.branch_id, t.name, t.code, t.status,
            t.description, t.created_at, t.updated_at,
            tfp.id AS operating_capital_pool_id,
            tfp.name AS operating_capital_pool_name,
            tfp.is_active AS operating_capital_pool_active
     FROM tills t
     LEFT JOIN financial_pool_types fpt
       ON fpt.code = $2
     LEFT JOIN till_financial_pools tfp
       ON tfp.till_id = t.id
      AND tfp.pool_type_id = fpt.id
     WHERE t.id = $1`,
    [tillId, OPERATING_CAPITAL_CODE]
  );

  if (result.rowCount === 0) {
    throw businessError("Till not found.", 404);
  }

  return result.rows[0];
}

export async function updateTill(tillId, input = {}) {
  const current = await getTill(tillId);

  if (current.status === "RETIRED") {
    throw businessError("A retired Till cannot be modified.");
  }

  if (input.status !== undefined && !VALID_STATUSES.includes(input.status)) {
    throw businessError("Invalid Till status.");
  }

  const name =
    input.name !== undefined ? String(input.name).trim() : current.name;

  const code =
    input.code !== undefined
      ? String(input.code).trim().toUpperCase()
      : current.code;

  const description =
    input.description !== undefined
      ? input.description
      : current.description;

  const status = input.status ?? current.status;

  if (!name) throw businessError("Till name is required.");
  if (!code) throw businessError("Till code is required.");

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE tills
       SET name = $2,
           code = $3,
           status = $4,
           description = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, branch_id, name, code, status, description,
                 created_at, updated_at`,
      [tillId, name, code, status, description]
    );

    const till = result.rows[0];

    if (status === "ACTIVE") {
      const operatingCapitalPool = await ensureOperatingCapitalPool(
        client,
        till.id
      );

      await client.query("COMMIT");

      return {
        ...till,
        operating_capital_pool: operatingCapitalPool
      };
    }

    await client.query("COMMIT");
    return till;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function retireTill(tillId) {
  const current = await getTill(tillId);

  if (current.status === "RETIRED") {
    return current;
  }

  const result = await db.query(
    `UPDATE tills
     SET status = 'RETIRED',
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, branch_id, name, code, status, description,
               created_at, updated_at`,
    [tillId]
  );

  return result.rows[0];
}
