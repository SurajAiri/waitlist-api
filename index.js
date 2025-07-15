import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import responseFormatter from "./src/middlewares/response.middlewares.js";
import routes from "./src/routes/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(responseFormatter);

// Health check endpoint
app.get("/", (req, res) => {
  res.sendResponse(200, { message: "Health Check for 'waitlist-api' APIs." });
});

// API routes
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    console.error("db uri: ", process.env.MONGODB_URI);
  });
