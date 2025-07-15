import express from "express";
import waitlistRoutes from "./waitlist.routes.js";
import projectRoutes from "./project.routes.js";
import { authApiMiddleware } from "../middlewares/authorization.middlewares.js";
import {
  checkDatabaseHealth,
  getConnectionInfo,
} from "../utils/database.utils.js";

const router = express.Router();

// Health check endpoint with database status
router.get("/health", async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const connectionInfo = getConnectionInfo();

    const healthData = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbHealth.status,
        message: dbHealth.message,
        connection: {
          readyState: connectionInfo.readyState,
          readyStateText: connectionInfo.readyStateText,
        },
      },
      environment: process.env.NODE_ENV || "development",
    };

    const statusCode = dbHealth.status === "connected" ? 200 : 503;
    res.status(statusCode).json({
      statusCode,
      data: healthData,
      message:
        dbHealth.status === "connected"
          ? "API is running"
          : "API running but database issues detected",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      data: {
        status: "ERROR",
        timestamp: new Date().toISOString(),
        database: {
          status: "error",
          message: error.message,
        },
      },
      message: "Health check failed",
    });
  }
});

// Project routes
router.use("/projects", authApiMiddleware, projectRoutes);

// Waitlist routes
router.use("/waitlist", waitlistRoutes);

export default router;
