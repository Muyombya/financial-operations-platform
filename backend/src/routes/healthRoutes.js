import { Router } from "express";
import { verifyDatabaseConnection } from "../config/database.js";

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    const database = await verifyDatabaseConnection();

    res.json({
      success: true,
      status: "ok",
      service: "project-atlas-backend",
      database
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      success: false,
      status: "database_unavailable",
      message: "The Atlas database is currently unavailable."
    });
  }
});

export default router;
