// Project Atlas — Engine 011
// Named component: reconciliationHistoryController
// Responsibility: HTTP/API access to immutable reconciliation history.

import { getReconciliationHistory } from "../services/reconciliationHistoryService.js";

function sendHistoryError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.statusCode === 404 ? "NOT_FOUND" : "BUSINESS_RULE",
        message: error.message
      }
    });
  }

  console.error("Reconciliation history operation failed:", error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The reconciliation history could not be retrieved."
    }
  });
}

export async function getReconciliationHistoryForPosition(req, res) {
  try {
    const data = await getReconciliationHistory(req.params.positionId);

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    return sendHistoryError(res, error);
  }
}
