// Project Atlas — Engine 024
import { Router } from "express";
import { getTillSessionFinancialLifecycleController } from "../controllers/tillSessionFinancialLifecycleController.js";

const router = Router();

router.get(
  "/till-sessions/:sessionId/financial-lifecycle",
  getTillSessionFinancialLifecycleController
);

export default router;
