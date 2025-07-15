import "dotenv/config";
import express from "express";
import cors from "cors";
import responseFormatter from "./src/middlewares/response.middlewares.js";
import { handleDatabaseErrors } from "./src/middlewares/database.middleware.js";
import routes from "./src/routes/index.js";
import { connectToDatabase } from "./src/config/database.js";

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(responseFormatter);

// Database connection middleware for serverless
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      statusCode: 500,
      error: { message: "Database connection failed" },
      message: "Internal server error",
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.sendResponse(200, { message: "Health Check for 'waitlist-api' APIs." });
});

// API routes
app.use("/api", routes);

// Database error handling middleware
app.use(handleDatabaseErrors);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    statusCode: 500,
    error: { message: "Internal server error" },
    message: "Something went wrong",
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // For local development, establish connection on startup
  connectToDatabase()
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
      console.error("db uri: ", process.env.MONGODB_URI);
    });
}

export default app;
