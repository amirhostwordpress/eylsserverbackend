import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/database.js";



// Routes
import subscriptionRoutes from "./routes/subscription.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import caseRoutes from "./routes/case.routes.js";
import documentRoutes from "./routes/document.routes.js";
import consultationRoutes from "./routes/consultation.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import settingRoutes from "./routes/setting.routes.js";
import caseTypeRoutes from "./routes/caseType.routes.js";
import workOccupationRoutes from "./routes/workOccupation.routes.js";
import policeStationRoutes from "./routes/policeStation.routes.js";
import jailRoutes from "./routes/jail.routes.js";
import jailVisitRoutes from "./routes/jailVisit.routes.js";
import courtQuotationRoutes from "./routes/courtQuotation.routes.js";
import caseTrackingRoutes from "./routes/caseTracking.routes.js";
import caseExpenseRoutes from "./routes/caseExpense.routes.js";
import casePaymentRoutes from "./routes/casePayment.routes.js";
import caseInquiryRoutes from "./routes/caseInquiry.routes.js";
import messageRoutes from "./routes/message.routes.js";

// Middleware
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.middleware.js";

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- CORS -------------------- */
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : ["*"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -------------------- Body Parsers -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EYLS Advocates & Legal Consultants API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- API Routes -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/cases", caseRoutes);
app.use("/api/cases", caseTrackingRoutes);
app.use("/api/cases", caseExpenseRoutes);
app.use("/api/cases", casePaymentRoutes);

app.use("/api/documents", documentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.use("/api", caseTypeRoutes);
app.use("/api/work-occupations", workOccupationRoutes);
app.use("/api/police-stations", policeStationRoutes);
app.use("/api/jails", jailRoutes);
app.use("/api/jail-visits", jailVisitRoutes);
app.use("/api/court-quotations", courtQuotationRoutes);
app.use("/api/case-inquiries", caseInquiryRoutes);
app.use("/api/messages", messageRoutes);

/* -------------------- Error Handling -------------------- */
app.use(notFoundHandler);
app.use(errorHandler);

/* -------------------- Start Server -------------------- */
const startServer = async () => {
  try {
    await connectDB(); // ✅ Ensure DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

/* -------------------- Graceful Shutdown -------------------- */
const shutdown = async (signal) => {
  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
