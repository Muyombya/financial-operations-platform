import { Router } from "express";
import {
  postTillFloatTransfer,
  getTillFloatTransfers
} from "../controllers/tillFloatMovementController.js";

const router = Router();

router.post("/till-float-movements", postTillFloatTransfer);
router.get("/till-float-movements", getTillFloatTransfers);

export default router;
