import Project from "../models/project.model.js";
import WaitList from "../models/waitlist.model.js";
import { randomBytes } from "crypto";

const projectService = {
  async createProject(projectData) {
    const { name, slug, description } = projectData;

    // Check if slug already exists
    const existingProject = await Project.findOne({ slug });
    if (existingProject) {
      throw new Error("Project slug already exists");
    }

    const project = new Project({
      name,
      slug,
      description,
    });

    await project.save();
    return project;
  },

  async getAllProjects() {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    // Get waitlist count for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const waitlistCount = await WaitList.countDocuments({
          projectId: project._id,
        });
        return {
          ...project.toObject(),
          waitlistCount,
        };
      })
    );

    return projectsWithCounts;
  },

  async getProjectById(projectId) {
    const project = await Project.findById(projectId).select("-__v");
    if (!project) {
      throw new Error("Project not found");
    }

    // Get waitlist count
    const waitlistCount = await WaitList.countDocuments({
      projectId: project._id,
    });

    return {
      ...project.toObject(),
      waitlistCount,
    };
  },

  async updateProject(projectId, updateData) {
    const { name, slug, description, isActive } = updateData;

    // Check if new slug already exists (if slug is being updated)
    if (slug) {
      const existingProject = await Project.findOne({
        slug,
        _id: { $ne: projectId },
      });
      if (existingProject) {
        throw new Error("Project slug already exists");
      }
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { name, slug, description, isActive },
      { new: true, runValidators: true }
    );

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  },

  async deleteProject(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if there are waitlist entries
    const waitlistCount = await WaitList.countDocuments({ projectId });
    if (waitlistCount > 0) {
      throw new Error(
        `Cannot delete project. It has ${waitlistCount} waitlist entries. Please delete all entries first.`
      );
    }

    await Project.findByIdAndDelete(projectId);
    return { message: "Project deleted successfully" };
  },

  async regenerateApiToken(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Generate new API token
    project.apiToken = randomBytes(32).toString("hex");
    await project.save();

    return { apiToken: project.apiToken };
  },

  async findProjectByToken(token) {
    return await Project.findOne({ apiToken: token, isActive: true });
  },

  async verifyProjectExists(projectId) {
    const project = await Project.findById(projectId);
    if (!project || !project.isActive) {
      throw new Error("Project not found or inactive");
    }
    return project;
  },
};

export default projectService;
