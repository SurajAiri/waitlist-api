import express from "express";
import waitlistController from "../controllers/waitlist.controller.js";
import validateSchema from "../middlewares/validation.middleware.js";
import waitlistValidators from "../validators/waitlist.validator.js";
import {
  authApiMiddleware,
  authProjectToken,
} from "../middlewares/authorization.middlewares.js";

const router = express.Router();

// Main frontend endpoint - Add to waitlist
router
  .use(authProjectToken)
  .post(
    "/add",
    validateSchema(waitlistValidators.create, "body"),
    waitlistController.addToWaitlist
  );

// Optional admin endpoints (if needed for dashboard)
const adminRouter = router.use(authApiMiddleware);
adminRouter.get(
  "/project/:projectId",
  validateSchema(waitlistValidators.query, "query"),
  waitlistController.getWaitlistEntries
);

adminRouter.get(
  "/project/:projectId/stats",
  waitlistController.getWaitlistStats
);

adminRouter.delete(
  "/project/:projectId/entry/:entryId",
  waitlistController.deleteWaitlistEntry
);

export default router;
