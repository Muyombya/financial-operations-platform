import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import tillRoutes from "./routes/tillRoutes.js";
import tillSessionRoutes from "./routes/tillSessionRoutes.js";
import tillOpeningPositionRoutes from "./routes/tillOpeningPositionRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import servicePositionRoutes from "./routes/servicePositionRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import expectedPositionRoutes from "./routes/expectedPositionRoutes.js";
import reconciliationRoutes from "./routes/reconciliationRoutes.js";
import reconciliationHistoryRoutes from "./routes/reconciliationHistoryRoutes.js";
import tillSessionSettlementRoutes from "./routes/tillSessionSettlementRoutes.js";
import transactionAnalyticsRoutes from "./routes/transactionAnalyticsRoutes.js";
import businessDateTransactionAnalyticsRoutes from "./routes/businessDateTransactionAnalyticsRoutes.js";
import financialPositionAssessmentRoutes from "./routes/financialPositionAssessmentRoutes.js";
import tillFloatMovementRoutes from "./routes/tillFloatMovementRoutes.js";
import tillFinancialPositionRoutes from "./routes/tillFinancialPositionRoutes.js";
import branchFinancialPositionRoutes from "./routes/branchFinancialPositionRoutes.js";


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
app.use("/api/v1", tillRoutes);
app.use("/api/v1", tillSessionRoutes);
app.use("/api/v1", tillOpeningPositionRoutes);
app.use("/api/v1", providerRoutes);
app.use("/api/v1", servicePositionRoutes);
app.use("/api/v1", transactionRoutes);
app.use("/api/v1", expectedPositionRoutes);
app.use("/api/v1", reconciliationRoutes);
app.use("/api/v1", reconciliationHistoryRoutes);
app.use("/api/v1", tillSessionSettlementRoutes);
app.use("/api/v1", transactionAnalyticsRoutes);
app.use("/api/v1", businessDateTransactionAnalyticsRoutes);
app.use("/api/v1", financialPositionAssessmentRoutes);
app.use("/api/v1", tillFloatMovementRoutes);
app.use("/api/v1", tillFinancialPositionRoutes);
app.use("/api/v1", branchFinancialPositionRoutes);
export default app;
