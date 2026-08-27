// Project Atlas — Engine 014
// Named component: financialPositionAssessmentController

import {
  getFinancialPositionAssessment,
  getSessionFinancialPositionAssessment
} from "../services/financialPositionAssessmentService.js";

function sendError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.statusCode === 404 ? "NOT_FOUND" : "BUSINESS_RULE",
        message: error.message
      }
    });
  }

  console.error("Financial position assessment failed:", error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The financial position assessment could not be generated."
    }
  });
}

export async function getPositionAssessment(req, res) {
  try {
    const data = await getFinancialPositionAssessment(req.params.positionId);
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getSessionAssessment(req, res) {
  try {
    const data = await getSessionFinancialPositionAssessment(req.params.sessionId);
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
}
