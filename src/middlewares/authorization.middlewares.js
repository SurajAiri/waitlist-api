import jwtService from "../services/jwt.service.js";
import projectService from "../services/project.service.js";

function authorizeUser(req, res, next) {
  req.user = null;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwtService.verifyJWT(token);
    req.user = decoded;
  } finally {
    next();
  }
}

function restrictToUser(role = "user") {
  return (req, res, next) => {
    // console.log("User Authorization Middleware:", req.user);
    if (req.user && req.user.userType === role) {
      return next();
    }
    return res.sendResponse(403, {
      message: "Forbidden: You do not have permission to access this resource.",
    });
  };
}

const API_KEY = process.env.API_KEY || "supersecrettoken";

function authApiMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.sendResponse(401, { message: "Unauthorized" });
  }
  next();
}

// Middleware to authenticate using project API token
async function authProjectToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.sendResponse(401, {
        message: "Authorization header with Bearer token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const project = await projectService.findProjectByToken(token);

    if (!project) {
      return res.sendResponse(401, {
        message: "Invalid or inactive API token",
      });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.sendResponse(500, {
      message: "Internal server error during authentication",
    });
  }
}

export { authorizeUser, restrictToUser, authApiMiddleware, authProjectToken };
