import express from "express";
import waitlistRoutes from "./waitlist.routes.js";
import projectRoutes from "./project.routes.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.sendResponse(200, { status: "OK" }, "API is running");
});

// Project routes
router.use("/projects", projectRoutes);

// Waitlist routes
router.use("/waitlist", waitlistRoutes);

export default router;
