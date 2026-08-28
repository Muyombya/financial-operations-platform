import { Router } from "express";
import { getAllBranchFinancialPositions, getBranchFinancialPositionByBranch, getBranchFinancialMovementHistory } from "../controllers/branchFinancialPositionController.js";
const router=Router();
router.get("/branch-financial-pools/positions",getAllBranchFinancialPositions);
router.get("/branches/:branchId/financial-position",getBranchFinancialPositionByBranch);
router.get("/branches/:branchId/financial-movement-history",getBranchFinancialMovementHistory);
export default router;
