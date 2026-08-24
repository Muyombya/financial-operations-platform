import { Router } from "express";
import {
  getCompanies,
  getCompanyById,
  getCompanyBranches,
  postBranch,
  postCompany
} from "../controllers/organizationController.js";

const router = Router();

router.get("/companies", getCompanies);
router.post("/companies", postCompany);
router.get("/companies/:companyId", getCompanyById);

router.get("/companies/:companyId/branches", getCompanyBranches);
router.post("/companies/:companyId/branches", postBranch);

export default router;
