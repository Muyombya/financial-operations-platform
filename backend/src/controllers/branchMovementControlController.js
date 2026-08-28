// Project Atlas — Engine 020
import {
  allocateBranchToTill,
  transferBranchToBranch,
  listBranchControlledMovements
} from "../services/branchMovementControlService.js";

function sendError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      error: { code: "ALREADY_EXISTS", message: "The financial movement reference already exists." }
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code || (error.statusCode === 404 ? "NOT_FOUND" : "BUSINESS_RULE"),
        message: error.message
      }
    });
  }

  console.error("Branch movement control operation failed:", error);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The branch financial movement could not be completed."
    }
  });
}

export async function postBranchToTill(req, res) {
  try {
    return res.status(201).json({
      success: true,
      data: await allocateBranchToTill(req.body)
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function postBranchToBranch(req, res) {
  try {
    return res.status(201).json({
      success: true,
      data: await transferBranchToBranch(req.body)
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getBranchControlledMovements(req, res) {
  try {
    return res.json({
      success: true,
      data: await listBranchControlledMovements(req.query)
    });
  } catch (error) {
    return sendError(res, error);
  }
}
