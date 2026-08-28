// Project Atlas — Engine 011
// Named component: reconciliationHistoryRoutes
// Responsibility: routes dedicated to reconciliation history.

import { Router } from "express";
import {
  getReconciliationHistoryForPosition
} from "../controllers/reconciliationHistoryController.js";

const router = Router();

router.get(
  "/service-session-positions/:positionId/reconciliation-history",
  getReconciliationHistoryForPosition
);

export default router;
