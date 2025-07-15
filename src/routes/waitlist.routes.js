import express from "express";
import waitlistController from "../controllers/waitlist.controller.js";
import validateSchema from "../middlewares/validation.middleware.js";
import waitlistValidators from "../validators/waitlist.validator.js";

const router = express.Router();

// Main frontend endpoint - Add to waitlist
router.post(
  "/add",
  validateSchema(waitlistValidators.create, "body"),
  waitlistController.addToWaitlist
);

// Optional admin endpoints (if needed for dashboard)
router.get(
  "/project/:projectId",
  validateSchema(waitlistValidators.query, "query"),
  waitlistController.getWaitlistEntries
);

router.get("/project/:projectId/stats", waitlistController.getWaitlistStats);

router.delete(
  "/project/:projectId/entry/:entryId",
  waitlistController.deleteWaitlistEntry
);

export default router;
