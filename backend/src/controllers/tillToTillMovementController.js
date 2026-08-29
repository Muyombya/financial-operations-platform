// Project Atlas — Engine 023
// Named component: tillToTillMovementController

import {
  getTillToTillMovementHistory,
  transferTillToTill
} from "../services/tillToTillMovementService.js";

function sendTillToTillError(res, error) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code || "BUSINESS_RULE",
        message: error.message
      }
    });
  }

  console.error("Till-to-Till movement operation failed:", error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The Till-to-Till financial movement could not be completed."
    }
  });
}

export async function postTillToTill(req, res, next) {
  try {
    const movement = await transferTillToTill(req.body ?? {});
    return res.status(201).json({ success: true, movement });
  } catch (error) {
    return sendTillToTillError(res, error);
  }
}

export async function getTillToTillHistory(req, res, next) {
  try {
    const movements = await getTillToTillMovementHistory(
      req.params.tillPoolId,
      req.query ?? {}
    );
    return res.json({ success: true, movements });
  } catch (error) {
    return sendTillToTillError(res, error);
  }
}
