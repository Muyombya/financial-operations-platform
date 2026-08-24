import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Project Atlas backend is running."
  });
});

app.use("/api/v1", healthRoutes);
app.use("/api/v1", organizationRoutes);

export default app;
