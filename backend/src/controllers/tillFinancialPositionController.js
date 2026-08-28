import {
  getTillFinancialPosition,
  getTillPoolMovementHistory,
  getTillPoolPosition,
  listTillPoolPositions
} from "../services/tillFinancialPositionService.js";

function sendError(res, error) {
  if (error.code === "22P02") {
    return res.status(400).json({
      success: false,
      error: { code: "BUSINESS_RULE", message: "A supplied identifier or value is invalid." }
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

  console.error("Till financial position operation failed:", error);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The Till financial position could not be calculated."
    }
  });
}

export async function getTillPoolFinancialPosition(req, res) {
  try {
    return res.json({
      success: true,
      data: await getTillPoolPosition(req.params.tillPoolId, {
        asOf: req.query.asOf
      })
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getTillFinancialPositionByTill(req, res) {
  try {
    return res.json({
      success: true,
      data: await getTillFinancialPosition(req.params.tillId, {
        asOf: req.query.asOf
      })
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAllTillPoolFinancialPositions(req, res) {
  try {
    return res.json({
      success: true,
      data: await listTillPoolPositions({
        asOf: req.query.asOf
      })
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getTillPoolFinancialMovementHistory(req, res) {
  try {
    return res.json({
      success: true,
      data: await getTillPoolMovementHistory(req.params.tillPoolId, {
        asOf: req.query.asOf,
        limit: req.query.limit
      })
    });
  } catch (error) {
    return sendError(res, error);
  }
}
