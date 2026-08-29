// Project Atlas — Engine 023
// Named component: tillToTillMovementRoutes

import { Router } from "express";
import {
  getTillToTillHistory,
  postTillToTill
} from "../controllers/tillToTillMovementController.js";

const router = Router();

router.post("/till-financial-movements/till-to-till", postTillToTill);
router.get(
  "/till-financial-pools/:tillPoolId/till-to-till-movement-history",
  getTillToTillHistory
);

export default router;
