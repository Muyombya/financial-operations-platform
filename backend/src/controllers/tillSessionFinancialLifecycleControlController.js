// Project Atlas — Engine 025
import {
  beginTillSessionClosing,
  closeTillSession
} from "../services/tillSessionFinancialLifecycleControlService.js";

function sendLifecycleError(res, error) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code:
          error.code ||
          (error.statusCode === 404 ? "NOT_FOUND" : "BUSINESS_RULE"),
        message: error.message
      }
    });
  }

  console.error(
    "Till session financial lifecycle control operation failed:",
    error
  );

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        "The Till session financial lifecycle operation could not be completed."
    }
  });
}


export async function beginTillSessionClosingController(req, res, next) {
  try {
    const data = await beginTillSessionClosing(req.params.sessionId);
    return res.json({ success: true, data });
  } catch (error) {
    return sendLifecycleError(res, error);
  }
}

export async function closeTillSessionController(req, res, next) {
  try {
    const data = await closeTillSession(req.params.sessionId);
    return res.json({ success: true, data });
  } catch (error) {
    return sendLifecycleError(res, error);
  }
}
