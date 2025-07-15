import waitlistService from "../services/waitlist.service.js";
import projectService from "../services/project.service.js";

const waitlistController = {
  // Main endpoint for frontend to add someone to waitlist
  // Uses project-level API token for authentication
  async addToWaitlist(req, res) {
    try {
      const { name, email, extra } = req.body;

      // Get project from the authenticated token (set by authProjectToken middleware)
      const project = req.project;

      // Add to waitlist using the authenticated project
      const waitlistEntry = await waitlistService.addToWaitlist({
        projectId: project._id,
        name,
        email,
        extra,
      });

      return res.sendResponse(
        201,
        {
          id: waitlistEntry._id,
          email: waitlistEntry.email,
          name: waitlistEntry.name,
          extra: waitlistEntry.extra,
          project: waitlistEntry.projectId,
          createdAt: waitlistEntry.createdAt,
        },
        "Successfully added to waitlist"
      );
    } catch (error) {
      console.error("Error adding to waitlist:", error);

      // Handle duplicate email error
      if (error.message === "Email already exists in this project's waitlist") {
        return res.sendResponse(409, {
          message: "This email is already on the waitlist for this project",
        });
      }

      return res.sendResponse(500, {
        message: "Internal server error",
      });
    }
  },

  // Optional: Get waitlist entries for a project (for admin/dashboard)
  async getWaitlistEntries(req, res) {
    try {
      const { projectId } = req.params;
      const queryOptions = req.validatedQuery || req.query;

      // Verify project exists
      try {
        const project = await projectService.getProjectById(projectId);
      } catch (error) {
        return res.sendResponse(404, {
          message: "Project not found",
        });
      }

      const result = await waitlistService.getWaitlistEntries(
        projectId,
        queryOptions
      );

      return res.sendResponse(
        200,
        result.entries,
        "Waitlist entries retrieved successfully",
        result.meta
      );
    } catch (error) {
      console.error("Error getting waitlist entries:", error);
      return res.sendResponse(500, {
        message: "Internal server error",
      });
    }
  },

  // Optional: Get waitlist stats for a project
  async getWaitlistStats(req, res) {
    try {
      const { projectId } = req.params;

      // Verify project exists
      try {
        const project = await projectService.getProjectById(projectId);
      } catch (error) {
        return res.sendResponse(404, {
          message: "Project not found",
        });
      }

      const stats = await waitlistService.getWaitlistStats(projectId);

      return res.sendResponse(
        200,
        stats,
        "Waitlist stats retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting waitlist stats:", error);
      return res.sendResponse(500, {
        message: "Internal server error",
      });
    }
  },

  // Optional: Delete waitlist entry
  async deleteWaitlistEntry(req, res) {
    try {
      const { projectId, entryId } = req.params;

      // Verify project exists
      try {
        const project = await projectService.getProjectById(projectId);
      } catch (error) {
        return res.sendResponse(404, {
          message: "Project not found",
        });
      }

      const result = await waitlistService.deleteWaitlistEntry(
        projectId,
        entryId
      );

      return res.sendResponse(
        200,
        result,
        "Waitlist entry deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting waitlist entry:", error);

      if (error.message === "Waitlist entry not found") {
        return res.sendResponse(404, {
          message: "Waitlist entry not found",
        });
      }

      return res.sendResponse(500, {
        message: "Internal server error",
      });
    }
  },
};

export default waitlistController;
