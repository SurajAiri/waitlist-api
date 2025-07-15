import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index.js";
import Project from "../src/models/project.model.js";
import WaitList from "../src/models/waitlist.model.js";

describe("Waitlist API Tests", () => {
  let mongoServer;
  let projectId;
  let projectApiToken;
  let envApiKey;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to test database
    await mongoose.connect(mongoUri);

    // Set environment variables for testing
    process.env.API_KEY = "test-env-api-key";
    process.env.NODE_ENV = "test";
    envApiKey = process.env.API_KEY;
  });

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await Project.deleteMany({});
    await WaitList.deleteMany({});
  });

  describe("Health Check", () => {
    test("GET /api/health - should return 200", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toEqual({
        statusCode: 200,
        data: { status: "OK" },
        message: "API is running",
      });
    });
  });

  describe("Project Management (Environment API Key Required)", () => {
    describe("POST /api/projects", () => {
      test("should create project with valid environment API key", async () => {
        const projectData = {
          name: "Test Project",
          slug: "test-project",
          description: "This is a test project description",
        };

        const response = await request(app)
          .post("/api/projects")
          .set("Authorization", `Bearer ${envApiKey}`)
          .send(projectData)
          .expect(201);

        expect(response.body.statusCode).toBe(201);
        expect(response.body.data.name).toBe(projectData.name);
        expect(response.body.data.slug).toBe(projectData.slug);
        expect(response.body.data.apiToken).toBeDefined();

        // Store for later tests
        projectId = response.body.data.id;
        projectApiToken = response.body.data.apiToken;
      });

      test("should fail without authorization header", async () => {
        const projectData = {
          name: "Test Project",
          slug: "test-project",
          description: "This is a test project description",
        };

        const response = await request(app)
          .post("/api/projects")
          .send(projectData)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
      });

      test("should fail with invalid API key", async () => {
        const projectData = {
          name: "Test Project",
          slug: "test-project",
          description: "This is a test project description",
        };

        const response = await request(app)
          .post("/api/projects")
          .set("Authorization", "Bearer invalid-key")
          .send(projectData)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
      });

      test("should fail with invalid project data", async () => {
        const invalidProjectData = {
          name: "T", // Too short
          slug: "test-project",
          description: "Short", // Too short
        };

        const response = await request(app)
          .post("/api/projects")
          .set("Authorization", `Bearer ${envApiKey}`)
          .send(invalidProjectData)
          .expect(400);

        expect(response.body.statusCode).toBe(400);
        expect(response.body.error.message).toBe("Validation failed");
      });

      test("should fail with duplicate slug", async () => {
        const projectData = {
          name: "Test Project",
          slug: "test-project",
          description: "This is a test project description",
        };

        // Create first project
        await request(app)
          .post("/api/projects")
          .set("Authorization", `Bearer ${envApiKey}`)
          .send(projectData)
          .expect(201);

        // Try to create second project with same slug
        const response = await request(app)
          .post("/api/projects")
          .set("Authorization", `Bearer ${envApiKey}`)
          .send(projectData)
          .expect(409);

        expect(response.body.statusCode).toBe(409);
        expect(response.body.error.message).toBe("Project slug already exists");
      });
    });

    describe("GET /api/projects", () => {
      test("should get all projects with valid API key", async () => {
        // Create a test project first
        const project = new Project({
          name: "Test Project",
          slug: "test-project",
          description: "Test description",
        });
        await project.save();

        const response = await request(app)
          .get("/api/projects")
          .set("Authorization", `Bearer ${envApiKey}`)
          .expect(200);

        expect(response.body.statusCode).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].name).toBe("Test Project");
      });

      test("should fail without authorization", async () => {
        const response = await request(app).get("/api/projects").expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
      });
    });

    describe("GET /api/projects/:projectId", () => {
      test("should get project by ID with valid API key", async () => {
        const project = new Project({
          name: "Test Project",
          slug: "test-project",
          description: "Test description",
        });
        await project.save();

        const response = await request(app)
          .get(`/api/projects/${project._id}`)
          .set("Authorization", `Bearer ${envApiKey}`)
          .expect(200);

        expect(response.body.statusCode).toBe(200);
        expect(response.body.data.name).toBe("Test Project");
      });

      test("should fail without authorization", async () => {
        const project = new Project({
          name: "Test Project",
          slug: "test-project",
          description: "Test description",
        });
        await project.save();

        const response = await request(app)
          .get(`/api/projects/${project._id}`)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
      });

      test("should return 404 for non-existent project", async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
          .get(`/api/projects/${fakeId}`)
          .set("Authorization", `Bearer ${envApiKey}`)
          .expect(404);

        expect(response.body.statusCode).toBe(404);
      });
    });
  });

  describe("Waitlist Management", () => {
    let testProject;
    let testProjectToken;

    beforeEach(async () => {
      // Create a test project for waitlist tests
      testProject = new Project({
        name: "Test Project",
        slug: "test-project",
        description: "Test description",
      });
      await testProject.save();
      testProjectToken = testProject.apiToken;
    });

    describe("POST /api/waitlist/add (Project API Token Required)", () => {
      test("should add to waitlist with valid project API token", async () => {
        const waitlistData = {
          projectId: testProject._id.toString(),
          name: "John Doe",
          email: "john@example.com",
          extra: "Interested in beta access",
        };

        const response = await request(app)
          .post("/api/waitlist/add")
          .set("Authorization", `Bearer ${testProjectToken}`)
          .send(waitlistData)
          .expect(201);

        expect(response.body.statusCode).toBe(201);
        expect(response.body.data.name).toBe(waitlistData.name);
        expect(response.body.data.email).toBe(waitlistData.email);
        expect(response.body.data.extra).toBe(waitlistData.extra);
        expect(response.body.message).toBe("Successfully added to waitlist");
      });

      test("should fail without authorization header", async () => {
        const waitlistData = {
          projectId: testProject._id.toString(),
          name: "John Doe",
          email: "john@example.com",
        };

        const response = await request(app)
          .post("/api/waitlist/add")
          .send(waitlistData)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe(
          "Authorization header with Bearer token is required"
        );
      });

      test("should fail with invalid project API token", async () => {
        const waitlistData = {
          projectId: testProject._id.toString(),
          name: "John Doe",
          email: "john@example.com",
        };

        const response = await request(app)
          .post("/api/waitlist/add")
          .set("Authorization", "Bearer invalid-token")
          .send(waitlistData)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe(
          "Invalid or inactive API token"
        );
      });

      test("should fail with environment API key (wrong token type)", async () => {
        const waitlistData = {
          projectId: testProject._id.toString(),
          name: "John Doe",
          email: "john@example.com",
        };

        const response = await request(app)
          .post("/api/waitlist/add")
          .set("Authorization", `Bearer ${envApiKey}`)
          .send(waitlistData)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe(
          "Invalid or inactive API token"
        );
      });

      test("should fail with invalid email", async () => {
        const waitlistData = {
          projectId: testProject._id.toString(),
          name: "John Doe",
          email: "invalid-email",
        };

        const response = await request(app)
          .post("/api/waitlist/add")
          .set("Authorization", `Bearer ${testProjectToken}`)
          .send(waitlistData)
          .expect(400);

        expect(response.body.statusCode).toBe(400);
        expect(response.body.error.message).toBe("Validation failed");
      });

      test("should fail with duplicate email", async () => {
        const waitlistData = {
          projectId: testProject._id.toString(),
          name: "John Doe",
          email: "john@example.com",
        };

        // Add first entry
        await request(app)
          .post("/api/waitlist/add")
          .set("Authorization", `Bearer ${testProjectToken}`)
          .send(waitlistData)
          .expect(201);

        // Try to add duplicate
        const response = await request(app)
          .post("/api/waitlist/add")
          .set("Authorization", `Bearer ${testProjectToken}`)
          .send(waitlistData)
          .expect(409);

        expect(response.body.statusCode).toBe(409);
        expect(response.body.error.message).toBe(
          "This email is already on the waitlist for this project"
        );
      });

      test("should fail with inactive project", async () => {
        // Make project inactive
        testProject.isActive = false;
        await testProject.save();

        const waitlistData = {
          projectId: testProject._id.toString(),
          name: "John Doe",
          email: "john@example.com",
        };

        const response = await request(app)
          .post("/api/waitlist/add")
          .set("Authorization", `Bearer ${testProjectToken}`)
          .send(waitlistData)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe(
          "Invalid or inactive API token"
        );
      });
    });

    describe("GET /api/waitlist/project/:projectId (Environment API Key Required)", () => {
      test("should get waitlist entries with valid environment API key", async () => {
        // Add a test waitlist entry
        const waitlistEntry = new WaitList({
          email: "test@example.com",
          name: "Test User",
          projectId: testProject._id,
        });
        await waitlistEntry.save();

        const response = await request(app)
          .get(`/api/waitlist/project/${testProject._id}`)
          .set("Authorization", `Bearer ${envApiKey}`)
          .expect(200);

        expect(response.body.statusCode).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].email).toBe("test@example.com");
      });

      test("should fail without authorization", async () => {
        const response = await request(app)
          .get(`/api/waitlist/project/${testProject._id}`)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
      });

      test("should fail with project API token", async () => {
        const response = await request(app)
          .get(`/api/waitlist/project/${testProject._id}`)
          .set("Authorization", `Bearer ${testProjectToken}`)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
      });
    });

    describe("GET /api/waitlist/project/:projectId/stats (Environment API Key Required)", () => {
      test("should get waitlist stats with valid environment API key", async () => {
        // Add test waitlist entries
        const entries = [
          new WaitList({
            email: "user1@example.com",
            name: "User 1",
            projectId: testProject._id,
          }),
          new WaitList({
            email: "user2@example.com",
            name: "User 2",
            projectId: testProject._id,
          }),
        ];
        await WaitList.insertMany(entries);

        const response = await request(app)
          .get(`/api/waitlist/project/${testProject._id}/stats`)
          .set("Authorization", `Bearer ${envApiKey}`)
          .expect(200);

        expect(response.body.statusCode).toBe(200);
        expect(response.body.data.totalEntries).toBe(2);
      });

      test("should fail without authorization", async () => {
        const response = await request(app)
          .get(`/api/waitlist/project/${testProject._id}/stats`)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
      });
    });

    describe("DELETE /api/waitlist/project/:projectId/entry/:entryId (Environment API Key Required)", () => {
      test("should delete waitlist entry with valid environment API key", async () => {
        // Add a test waitlist entry
        const waitlistEntry = new WaitList({
          email: "test@example.com",
          name: "Test User",
          projectId: testProject._id,
        });
        await waitlistEntry.save();

        const response = await request(app)
          .delete(
            `/api/waitlist/project/${testProject._id}/entry/${waitlistEntry._id}`
          )
          .set("Authorization", `Bearer ${envApiKey}`)
          .expect(200);

        expect(response.body.statusCode).toBe(200);
        expect(response.body.data.message).toBe(
          "Waitlist entry deleted successfully"
        );
      });

      test("should fail without authorization", async () => {
        const waitlistEntry = new WaitList({
          email: "test@example.com",
          name: "Test User",
          projectId: testProject._id,
        });
        await waitlistEntry.save();

        const response = await request(app)
          .delete(
            `/api/waitlist/project/${testProject._id}/entry/${waitlistEntry._id}`
          )
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.error.message).toBe("Unauthorized");
      });

      test("should return 404 for non-existent entry", async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
          .delete(`/api/waitlist/project/${testProject._id}/entry/${fakeId}`)
          .set("Authorization", `Bearer ${envApiKey}`)
          .expect(404);

        expect(response.body.statusCode).toBe(404);
      });
    });
  });
});
