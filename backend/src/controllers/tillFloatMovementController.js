import {
  createTillFloatTransfer,
  listTillFloatTransfers
} from "../services/tillFloatMovementService.js";

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
  console.error("Till float movement failed:", error);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The Till float movement could not be processed."
    }
  });
}

export async function postTillFloatTransfer(req, res) {
  try {
    return res.status(201).json({
      success: true,
      data: await createTillFloatTransfer(req.body)
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getTillFloatTransfers(req, res) {
  try {
    return res.json({
      success: true,
      data: await listTillFloatTransfers(req.query)
    });
  } catch (error) {
    return sendError(res, error);
  }
}
