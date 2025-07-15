import WaitList from "../models/waitlist.model.js";
import mongoose from "mongoose";

const waitlistService = {
  async addToWaitlist(waitlistData) {
    const { email, name, extra, projectId } = waitlistData;

    // Check if email already exists in this project's waitlist
    const existingEntry = await WaitList.findOne({ email, projectId });
    if (existingEntry) {
      throw new Error("Email already exists in this project's waitlist");
    }

    // Create new waitlist entry
    const waitlistEntry = new WaitList({
      email,
      name,
      extra,
      projectId,
    });

    await waitlistEntry.save();

    // Populate project info in response
    await waitlistEntry.populate("projectId", "name slug");

    return waitlistEntry;
  },

  async getWaitlistEntries(projectId, queryOptions = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryOptions;

    // Build query
    const query = { projectId };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Get entries with pagination
    const entries = await WaitList.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("projectId", "name slug");

    // Get total count for pagination
    const totalCount = await WaitList.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const meta = {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { entries, meta };
  },

  async getWaitlistStats(projectId) {
    // Get basic stats
    const totalEntries = await WaitList.countDocuments({ projectId });

    // Get entries by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEntries = await WaitList.countDocuments({
      projectId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get daily signup stats for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await WaitList.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return {
      totalEntries,
      recentEntries,
      dailyStats,
    };
  },

  async deleteWaitlistEntry(projectId, entryId) {
    const entry = await WaitList.findOne({ _id: entryId, projectId });
    if (!entry) {
      throw new Error("Waitlist entry not found");
    }

    await WaitList.findByIdAndDelete(entryId);
    return { message: "Waitlist entry deleted successfully" };
  },

  async getWaitlistCount(projectId) {
    return await WaitList.countDocuments({ projectId });
  },
};

export default waitlistService;
