import {
  createBranch,
  createCompany,
  getCompany,
  listBranches,
  listCompanies
} from "../services/organizationService.js";

function sendError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      error: {
        code: "ALREADY_EXISTS",
        message: "A company or branch with the same name or code already exists."
      }
    });
  }

  if (error.code === "23503") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REFERENCE",
        message: "The referenced company or branch does not exist."
      }
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.statusCode === 404 ? "NOT_FOUND" : "BUSINESS_RULE",
        message: error.message
      }
    });
  }

  console.error("Organization operation failed:", error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The organization operation could not be completed."
    }
  });
}

export async function postCompany(req, res) {
  try {
    const company = await createCompany(req.body);
    return res.status(201).json({ success: true, data: company });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getCompanies(_req, res) {
  try {
    const companies = await listCompanies();
    return res.json({ success: true, data: companies });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getCompanyById(req, res) {
  try {
    const company = await getCompany(req.params.companyId);
    return res.json({ success: true, data: company });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function postBranch(req, res) {
  try {
    const branch = await createBranch(req.params.companyId, req.body);
    return res.status(201).json({ success: true, data: branch });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getCompanyBranches(req, res) {
  try {
    const branches = await listBranches(req.params.companyId);
    return res.json({ success: true, data: branches });
  } catch (error) {
    return sendError(res, error);
  }
}
