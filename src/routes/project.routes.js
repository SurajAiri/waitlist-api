import express from "express";
import projectController from "../controllers/project.controller.js";
import validateSchema from "../middlewares/validation.middleware.js";
import projectValidators from "../validators/project.validator.js";

const router = express.Router();

// Create a new project
router.post(
  "/",
  validateSchema(projectValidators.create, "body"),
  projectController.createProject
);

// Get all projects
router.get("/", projectController.getAllProjects);

// Get project by ID
router.get("/:projectId", projectController.getProjectById);

export default router;
