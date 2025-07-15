import projectService from "../services/project.service.js";

const projectController = {
  // Create a new project
  async createProject(req, res) {
    try {
      const { name, slug, description } = req.body;

      const project = await projectService.createProject({
        name,
        slug,
        description,
      });

      return res.sendResponse(
        201,
        {
          id: project._id,
          name: project.name,
          slug: project.slug,
          description: project.description,
          apiToken: project.apiToken,
          isActive: project.isActive,
          createdAt: project.createdAt,
        },
        "Project created successfully"
      );
    } catch (error) {
      console.error("Error creating project:", error);

      if (error.message === "Project slug already exists") {
        return res.sendResponse(409, {
          message: "Project slug already exists",
        });
      }

      return res.sendResponse(500, {
        message: "Internal server error",
      });
    }
  },

  // Get all projects
  async getAllProjects(req, res) {
    try {
      const projects = await projectService.getAllProjects();

      return res.sendResponse(200, projects, "Projects retrieved successfully");
    } catch (error) {
      console.error("Error getting projects:", error);
      return res.sendResponse(500, {
        message: "Internal server error",
      });
    }
  },

  // Get project by ID
  async getProjectById(req, res) {
    try {
      const { projectId } = req.params;

      const project = await projectService.getProjectById(projectId);

      return res.sendResponse(200, project, "Project retrieved successfully");
    } catch (error) {
      console.error("Error getting project:", error);

      if (error.message === "Project not found") {
        return res.sendResponse(404, {
          message: "Project not found",
        });
      }

      return res.sendResponse(500, {
        message: "Internal server error",
      });
    }
  },
};

export default projectController;
