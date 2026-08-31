// Project Atlas — Engine 025
import { Router } from "express";
import {
  beginTillSessionClosingController,
  closeTillSessionController
} from "../controllers/tillSessionFinancialLifecycleControlController.js";

const router = Router();

router.post(
  "/till-sessions/:sessionId/financial-lifecycle/begin-closing",
  beginTillSessionClosingController
);

router.post(
  "/till-sessions/:sessionId/financial-lifecycle/close",
  closeTillSessionController
);

export default router;
