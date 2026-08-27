// Project Atlas — Engine 013-B
// Named component: businessDateTransactionAnalyticsRoutes

import { Router } from "express";
import {
  getBusinessDateAnalytics,
  getTillAnalytics
} from "../controllers/businessDateTransactionAnalyticsController.js";

const router = Router();

router.get(
  "/transaction-analytics/business-date",
  getBusinessDateAnalytics
);

router.get(
  "/transaction-analytics/till",
  getTillAnalytics
);

export default router;
