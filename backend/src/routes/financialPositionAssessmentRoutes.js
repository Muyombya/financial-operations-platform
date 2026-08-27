// Project Atlas — Engine 014
// Named component: financialPositionAssessmentRoutes

import { Router } from "express";
import {
  getPositionAssessment,
  getSessionAssessment
} from "../controllers/financialPositionAssessmentController.js";

const router = Router();

router.get(
  "/service-session-positions/:positionId/financial-assessment",
  getPositionAssessment
);

router.get(
  "/till-sessions/:sessionId/financial-assessment",
  getSessionAssessment
);

export default router;
