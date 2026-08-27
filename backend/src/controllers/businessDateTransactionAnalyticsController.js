// Project Atlas — Engine 013-B
// Named component: businessDateTransactionAnalyticsController

import {
  getBusinessDateTransactionAnalytics,
  getTillTransactionAnalytics
} from "../services/businessDateTransactionAnalyticsService.js";

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

  console.error("Business-date transaction analytics failed:", error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Business-date transaction analytics could not be generated."
    }
  });
}

export async function getBusinessDateAnalytics(req, res) {
  try {
    const data = await getBusinessDateTransactionAnalytics({
      from: req.query.from,
      to: req.query.to
    });
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getTillAnalytics(req, res) {
  try {
    const data = await getTillTransactionAnalytics({
      tillId: req.query.tillId,
      from: req.query.from,
      to: req.query.to
    });
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
}
