import { db } from "../config/database.js";

function businessError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

async function getBranch(branchId) {
  const result = await db.query(`SELECT id, name, is_active FROM branches WHERE id = $1`, [branchId]);
  if (result.rowCount === 0) throw businessError("Branch not found.", 404);
  return result.rows[0];
}

function validateAsOf(value) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw businessError("The asOf timestamp is invalid.");
  return date.toISOString();
}

function validateLimit(value) {
  if (value === undefined || value === null || value === "") return 100;
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw businessError("The limit must be an integer between 1 and 500.");
  }
  return limit;
}

export async function getBranchFinancialPosition(branchId, options = {}) {
  const branch = await getBranch(branchId);
  const asOf = validateAsOf(options.asOf);

  const poolResult = await db.query(`
    SELECT bfp.id AS branch_pool_id, bfp.name AS pool_name, bfp.is_active AS pool_active,
           fpm.currency_code,
           COALESCE(SUM(CASE WHEN fpm.destination_branch_pool_id = bfp.id THEN fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS total_inflows,
           COALESCE(SUM(CASE WHEN fpm.source_branch_pool_id = bfp.id THEN fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS total_outflows,
           COALESCE(SUM(CASE WHEN fpm.destination_branch_pool_id = bfp.id THEN fpm.amount WHEN fpm.source_branch_pool_id = bfp.id THEN -fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS balance,
           COUNT(fpm.id)::int AS movement_count
    FROM branch_financial_pools bfp
    LEFT JOIN financial_pool_movements fpm ON (fpm.destination_branch_pool_id = bfp.id OR fpm.source_branch_pool_id = bfp.id)
      AND ($2::timestamptz IS NULL OR fpm.occurred_at <= $2::timestamptz)
    WHERE bfp.branch_id = $1
    GROUP BY bfp.id, bfp.name, bfp.is_active, fpm.currency_code
    ORDER BY bfp.name, fpm.currency_code`, [branchId, asOf]);

  const tillResult = await db.query(`
    SELECT tfp.id AS till_pool_id, tfp.till_id, t.name AS till_name, t.code AS till_code,
           t.status AS till_status, tfp.name AS pool_name, tfp.is_active AS pool_active,
           fpm.currency_code,
           COALESCE(SUM(CASE WHEN fpm.destination_till_pool_id = tfp.id THEN fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS total_inflows,
           COALESCE(SUM(CASE WHEN fpm.source_till_pool_id = tfp.id THEN fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS total_outflows,
           COALESCE(SUM(CASE WHEN fpm.destination_till_pool_id = tfp.id THEN fpm.amount WHEN fpm.source_till_pool_id = tfp.id THEN -fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS balance,
           COUNT(fpm.id)::int AS movement_count
    FROM till_financial_pools tfp
    JOIN tills t ON t.id = tfp.till_id
    LEFT JOIN financial_pool_movements fpm ON (fpm.destination_till_pool_id = tfp.id OR fpm.source_till_pool_id = tfp.id)
      AND ($2::timestamptz IS NULL OR fpm.occurred_at <= $2::timestamptz)
    WHERE t.branch_id = $1
    GROUP BY tfp.id, tfp.till_id, t.name, t.code, t.status, tfp.name, tfp.is_active, fpm.currency_code
    ORDER BY t.name, tfp.name, fpm.currency_code`, [branchId, asOf]);

  const branchPools = poolResult.rows.map(r => ({ branch_pool_id:r.branch_pool_id, pool_name:r.pool_name, pool_active:r.pool_active, currency_code:r.currency_code, total_inflows:r.total_inflows, total_outflows:r.total_outflows, balance:r.balance, movement_count:Number(r.movement_count) }));
  const tillPools = tillResult.rows.map(r => ({ till_pool_id:r.till_pool_id, till_id:r.till_id, till_name:r.till_name, till_code:r.till_code, till_status:r.till_status, pool_name:r.pool_name, pool_active:r.pool_active, currency_code:r.currency_code, total_inflows:r.total_inflows, total_outflows:r.total_outflows, balance:r.balance, movement_count:Number(r.movement_count) }));
  const currencyCodes = [...new Set([...branchPools,...tillPools].map(r=>r.currency_code).filter(Boolean))];
  const currencySummary = currencyCodes.map(currency_code => ({
    currency_code,
    branch_pool_balance: branchPools.filter(r=>r.currency_code===currency_code).reduce((s,r)=>s+Number(r.balance),0).toFixed(2),
    till_pool_balance: tillPools.filter(r=>r.currency_code===currency_code).reduce((s,r)=>s+Number(r.balance),0).toFixed(2)
  }));

  return { branch_id:branch.id, branch_name:branch.name, branch_active:branch.is_active, as_of:asOf, branch_pools:branchPools, till_pools:tillPools, currency_summary:currencySummary };
}

export async function listBranchFinancialPositions(options = {}) {
  const asOf = validateAsOf(options.asOf);
  const result = await db.query(`
    SELECT b.id AS branch_id, b.name AS branch_name, b.is_active AS branch_active,
           bfp.id AS branch_pool_id, bfp.name AS pool_name, bfp.is_active AS pool_active,
           fpm.currency_code,
           COALESCE(SUM(CASE WHEN fpm.destination_branch_pool_id=bfp.id THEN fpm.amount WHEN fpm.source_branch_pool_id=bfp.id THEN -fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS balance,
           COALESCE(SUM(CASE WHEN fpm.destination_branch_pool_id=bfp.id THEN fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS total_inflows,
           COALESCE(SUM(CASE WHEN fpm.source_branch_pool_id=bfp.id THEN fpm.amount ELSE 0 END),0)::NUMERIC(20,2) AS total_outflows,
           COUNT(fpm.id)::int AS movement_count
    FROM branches b JOIN branch_financial_pools bfp ON bfp.branch_id=b.id
    LEFT JOIN financial_pool_movements fpm ON (fpm.destination_branch_pool_id=bfp.id OR fpm.source_branch_pool_id=bfp.id)
      AND ($1::timestamptz IS NULL OR fpm.occurred_at <= $1::timestamptz)
    GROUP BY b.id,b.name,b.is_active,bfp.id,bfp.name,bfp.is_active,fpm.currency_code
    ORDER BY b.name,bfp.name,fpm.currency_code`, [asOf]);
  return { as_of:asOf, positions:result.rows.map(r=>({...r, movement_count:Number(r.movement_count)})) };
}

export async function getBranchMovementHistory(branchId, options = {}) {
  await getBranch(branchId);
  const asOf = validateAsOf(options.asOf);
  const limit = validateLimit(options.limit);
  const result = await db.query(`
    SELECT fpm.id,fpm.movement_type,fpm.amount,fpm.currency_code,fpm.reference,fpm.reason,fpm.occurred_at,fpm.created_by,fpm.created_at,
           CASE WHEN dbp.branch_id=$1 THEN 'INFLOW' WHEN sbp.branch_id=$1 THEN 'OUTFLOW' END AS movement_direction,
           sbp.name AS source_branch_pool_name,sb.id AS source_branch_id,sb.name AS source_branch_name,
           dbp.name AS destination_branch_pool_name,db.id AS destination_branch_id,db.name AS destination_branch_name
    FROM financial_pool_movements fpm
    LEFT JOIN branch_financial_pools sbp ON sbp.id=fpm.source_branch_pool_id
    LEFT JOIN branches sb ON sb.id=sbp.branch_id
    LEFT JOIN branch_financial_pools dbp ON dbp.id=fpm.destination_branch_pool_id
    LEFT JOIN branches db ON db.id=dbp.branch_id
    WHERE (sbp.branch_id=$1 OR dbp.branch_id=$1)
      AND ($2::timestamptz IS NULL OR fpm.occurred_at <= $2::timestamptz)
    ORDER BY fpm.occurred_at DESC,fpm.created_at DESC LIMIT $3`, [branchId,asOf,limit]);
  return result.rows;
}
