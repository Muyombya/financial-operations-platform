import { Router } from "express";
import {
  getAllTillPoolFinancialPositions,
  getTillFinancialPositionByTill,
  getTillPoolFinancialMovementHistory,
  getTillPoolFinancialPosition
} from "../controllers/tillFinancialPositionController.js";

const router = Router();

router.get(
  "/till-financial-pools/positions",
  getAllTillPoolFinancialPositions
);

router.get(
  "/till-financial-pools/:tillPoolId/financial-position",
  getTillPoolFinancialPosition
);

router.get(
  "/till-financial-pools/:tillPoolId/movement-history",
  getTillPoolFinancialMovementHistory
);

router.get(
  "/tills/:tillId/financial-position",
  getTillFinancialPositionByTill
);

export default router;
