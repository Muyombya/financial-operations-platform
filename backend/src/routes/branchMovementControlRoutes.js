// Project Atlas — Engine 020
import { Router } from "express";
import {
  postBranchToTill,
  postBranchToBranch,
  getBranchControlledMovements
} from "../controllers/branchMovementControlController.js";

const router = Router();

router.post("/branch-financial-movements/branch-to-till", postBranchToTill);
router.post("/branch-financial-movements/branch-to-branch", postBranchToBranch);
router.get("/branch-financial-movements", getBranchControlledMovements);

export default router;
