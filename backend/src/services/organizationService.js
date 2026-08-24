import { db } from "../config/database.js";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : value;
}

export async function createCompany(input) {
  const name = normalizeText(input.name);
  const code = normalizeText(input.code)?.toUpperCase();
  const country = normalizeText(input.country) || "Uganda";
  const currencyCode = normalizeText(input.currencyCode || "UGX")?.toUpperCase();
  const timezone = normalizeText(input.timezone) || "Africa/Kampala";

  if (!name) {
    throw new Error("Company name is required.");
  }

  if (!code) {
    throw new Error("Company code is required.");
  }

  if (!/^[A-Z0-9_-]+$/.test(code)) {
    throw new Error("Company code may contain only letters, numbers, underscores and hyphens.");
  }

  if (!/^[A-Z]{3}$/.test(currencyCode)) {
    throw new Error("Currency code must contain exactly three uppercase letters.");
  }

  const result = await db.query(
    `INSERT INTO companies
      (name, code, registration_number, tin, phone, email, country,
       currency_code, timezone, address)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      name,
      code,
      normalizeText(input.registrationNumber),
      normalizeText(input.tin),
      normalizeText(input.phone),
      normalizeText(input.email),
      country,
      currencyCode,
      timezone,
      normalizeText(input.address)
    ]
  );

  return result.rows[0];
}

export async function listCompanies() {
  const result = await db.query(
    `SELECT *
       FROM companies
      ORDER BY name ASC`
  );

  return result.rows;
}

export async function getCompany(companyId) {
  const result = await db.query(
    `SELECT *
       FROM companies
      WHERE id = $1`,
    [companyId]
  );

  if (result.rowCount === 0) {
    const error = new Error("Company not found.");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

export async function createBranch(companyId, input) {
  const name = normalizeText(input.name);
  const code = normalizeText(input.code)?.toUpperCase();

  if (!name) {
    throw new Error("Branch name is required.");
  }

  if (!code) {
    throw new Error("Branch code is required.");
  }

  const company = await getCompany(companyId);

  if (!company.is_active) {
    const error = new Error("An inactive company cannot receive a new branch.");
    error.statusCode = 409;
    throw error;
  }

  const result = await db.query(
    `INSERT INTO branches
      (company_id, name, code, location, address)
     VALUES
      ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      companyId,
      name,
      code,
      normalizeText(input.location),
      normalizeText(input.address)
    ]
  );

  return result.rows[0];
}

export async function listBranches(companyId) {
  await getCompany(companyId);

  const result = await db.query(
    `SELECT *
       FROM branches
      WHERE company_id = $1
      ORDER BY name ASC`,
    [companyId]
  );

  return result.rows;
}
