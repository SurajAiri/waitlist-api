import express from "express";
import waitlistController from "../controllers/waitlist.controller.js";
import validateSchema from "../middlewares/validation.middleware.js";
import waitlistValidators from "../validators/waitlist.validator.js";
import {
  authApiMiddleware,
  authProjectToken,
} from "../middlewares/authorization.middlewares.js";

const router = express.Router();

// Main frontend endpoint - Add to waitlist (Project API Token)
router.post(
  "/add",
  authProjectToken,
  validateSchema(waitlistValidators.createWithoutProjectId, "body"),
  waitlistController.addToWaitlist
);

// Admin endpoints (Environment API Key)
router.get(
  "/project/:projectId",
  authApiMiddleware,
  validateSchema(waitlistValidators.query, "query"),
  waitlistController.getWaitlistEntries
);

router.get(
  "/project/:projectId/stats",
  authApiMiddleware,
  waitlistController.getWaitlistStats
);

router.delete(
  "/project/:projectId/entry/:entryId",
  authApiMiddleware,
  waitlistController.deleteWaitlistEntry
);

export default router;
