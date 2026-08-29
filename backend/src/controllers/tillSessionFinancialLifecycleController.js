// Project Atlas — Engine 024
import { getTillSessionFinancialLifecycle } from "../services/tillSessionFinancialLifecycleService.js";

export async function getTillSessionFinancialLifecycleController(req, res, next) {
  try {
    const data = await getTillSessionFinancialLifecycle(req.params.sessionId);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}
