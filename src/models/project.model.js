import mongoose from "mongoose";
import { randomBytes } from "crypto";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  apiToken: {
    type: String,
    required: true,
    unique: true,
    default: () => randomBytes(32).toString("hex"),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
