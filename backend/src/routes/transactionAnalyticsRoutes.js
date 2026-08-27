// Project Atlas — Engine 013
// Named component: transactionAnalyticsRoutes

import { Router } from "express";
import {
  getTransactionSummaryReport,
  getTransactionServiceBreakdownReport,
  getTransactionAnalyticsReport
} from "../controllers/transactionAnalyticsController.js";

const router=Router();
router.get("/till-sessions/:sessionId/transaction-summary",getTransactionSummaryReport);
router.get("/till-sessions/:sessionId/transaction-service-breakdown",getTransactionServiceBreakdownReport);
router.get("/till-sessions/:sessionId/transaction-analytics",getTransactionAnalyticsReport);
export default router;
