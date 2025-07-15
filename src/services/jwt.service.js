import jwt from "jsonwebtoken";

const jwtService = {
  generateDeveloperJWT(dev) {
    if (!dev || !dev._id || !dev.email) {
      throw new Error("Invalid developer object");
    }
    const payload = {
      id: dev._id,
      email: dev.email,
      username: dev.username || "",

      userType: "developer",
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  },
  generateUserJWT(user) {
    if (!user || !user._id || !user.email) {
      throw new Error("Invalid user object");
    }
    const payload = {
      id: user._id,
      email: user.email,
      username: user.username || "",
      userType: "user",
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  },
  verifyJWT(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  },
};

export default jwtService;
