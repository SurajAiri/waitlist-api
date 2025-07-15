import mongoose from "mongoose";

const waitListSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  extra: {
    type: String,
    trim: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound unique index for email + projectId
waitListSchema.index({ email: 1, projectId: 1 }, { unique: true });
const WaitList = mongoose.model("WaitList", waitListSchema);

export default WaitList;
