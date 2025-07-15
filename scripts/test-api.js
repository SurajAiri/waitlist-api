#!/usr/bin/env node
import axios from "axios";
import { randomBytes } from "crypto";

const BASE_URL = "http://localhost:3000/api";
const ENV_API_KEY = process.env.API_KEY || "your_api_key";

class APITester {
  constructor() {
    this.results = [];
    this.projectId = null;
    this.projectApiToken = null;
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      console.log(`✅ PASSED: ${name}`);
      this.results.push({ name, status: "PASSED" });
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}`);
      this.results.push({ name, status: "FAILED", error: error.message });
    }
  }

  async expectResponse(response, expectedStatus, expectedFields = []) {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, got ${response.status}`
      );
    }

    for (const field of expectedFields) {
      if (!(field in response.data)) {
        throw new Error(`Expected field '${field}' not found in response`);
      }
    }
  }

  async expectError(response, expectedStatus) {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected error status ${expectedStatus}, got ${response.status}`
      );
    }

    if (!response.data.error) {
      throw new Error("Expected error object in response");
    }
  }

  async runTests() {
    console.log("🚀 Starting API Tests...\n");

    // Test 1: Health Check
    await this.test("Health Check", async () => {
      const response = await axios.get(`${BASE_URL}/health`);
      await this.expectResponse(response, 200, ["data"]);
    });

    // Test 2: Create Project - Success
    await this.test("Create Project - Success", async () => {
      const projectData = {
        name: "Test Project",
        slug: `test-project-${randomBytes(4).toString("hex")}`,
        description: "This is a test project for API testing",
      };

      const response = await axios.post(`${BASE_URL}/projects`, projectData, {
        headers: { Authorization: `Bearer ${ENV_API_KEY}` },
      });

      await this.expectResponse(response, 201, ["data"]);
      this.projectId = response.data.data.id;
      this.projectApiToken = response.data.data.apiToken;
    });

    // Test 3: Create Project - No Auth
    await this.test("Create Project - No Auth", async () => {
      const projectData = {
        name: "Test Project",
        slug: "test-project-no-auth",
        description: "This should fail",
      };

      try {
        await axios.post(`${BASE_URL}/projects`, projectData);
        throw new Error("Should have failed without auth");
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`Expected 401, got ${error.response.status}`);
        }
      }
    });

    // Test 4: Create Project - Invalid Auth
    await this.test("Create Project - Invalid Auth", async () => {
      const projectData = {
        name: "Test Project",
        slug: "test-project-invalid-auth",
        description: "This should fail",
      };

      try {
        await axios.post(`${BASE_URL}/projects`, projectData, {
          headers: { Authorization: "Bearer invalid-key" },
        });
        throw new Error("Should have failed with invalid auth");
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`Expected 401, got ${error.response.status}`);
        }
      }
    });

    // Test 5: Get All Projects - Success
    await this.test("Get All Projects - Success", async () => {
      const response = await axios.get(`${BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${ENV_API_KEY}` },
      });

      await this.expectResponse(response, 200, ["data"]);
    });

    // Test 6: Get All Projects - No Auth
    await this.test("Get All Projects - No Auth", async () => {
      try {
        await axios.get(`${BASE_URL}/projects`);
        throw new Error("Should have failed without auth");
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`Expected 401, got ${error.response.status}`);
        }
      }
    });

    // Test 7: Add to Waitlist - Success
    await this.test("Add to Waitlist - Success", async () => {
      const waitlistData = {
        name: "John Doe",
        email: "john@example.com",
        extra: "Interested in beta access",
      };

      const response = await axios.post(
        `${BASE_URL}/waitlist/add`,
        waitlistData,
        {
          headers: { Authorization: `Bearer ${this.projectApiToken}` },
        }
      );

      await this.expectResponse(response, 201, ["data"]);
    });

    // Test 8: Add to Waitlist - No Auth
    await this.test("Add to Waitlist - No Auth", async () => {
      const waitlistData = {
        name: "Jane Doe",
        email: "jane@example.com",
      };

      try {
        await axios.post(`${BASE_URL}/waitlist/add`, waitlistData);
        throw new Error("Should have failed without auth");
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`Expected 401, got ${error.response.status}`);
        }
      }
    });

    // Test 9: Add to Waitlist - Wrong Token Type (Env API Key)
    await this.test("Add to Waitlist - Wrong Token Type", async () => {
      const waitlistData = {
        name: "Jane Doe",
        email: "jane@example.com",
      };

      try {
        await axios.post(`${BASE_URL}/waitlist/add`, waitlistData, {
          headers: { Authorization: `Bearer ${ENV_API_KEY}` },
        });
        throw new Error("Should have failed with wrong token type");
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`Expected 401, got ${error.response.status}`);
        }
      }
    });

    // Test 10: Add to Waitlist - Duplicate Email
    await this.test("Add to Waitlist - Duplicate Email", async () => {
      const waitlistData = {
        name: "John Doe",
        email: "john@example.com", // Same email as Test 7
        extra: "Trying to add again",
      };

      try {
        await axios.post(`${BASE_URL}/waitlist/add`, waitlistData, {
          headers: { Authorization: `Bearer ${this.projectApiToken}` },
        });
        throw new Error("Should have failed with duplicate email");
      } catch (error) {
        if (error.response.status !== 409) {
          throw new Error(`Expected 409, got ${error.response.status}`);
        }
      }
    });

    // Test 11: Get Waitlist Entries - Success
    await this.test("Get Waitlist Entries - Success", async () => {
      const response = await axios.get(
        `${BASE_URL}/waitlist/project/${this.projectId}`,
        {
          headers: { Authorization: `Bearer ${ENV_API_KEY}` },
        }
      );

      await this.expectResponse(response, 200, ["data"]);
    });

    // Test 12: Get Waitlist Entries - No Auth
    await this.test("Get Waitlist Entries - No Auth", async () => {
      try {
        await axios.get(`${BASE_URL}/waitlist/project/${this.projectId}`);
        throw new Error("Should have failed without auth");
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`Expected 401, got ${error.response.status}`);
        }
      }
    });

    // Test 13: Get Waitlist Entries - Wrong Token Type (Project Token)
    await this.test("Get Waitlist Entries - Wrong Token Type", async () => {
      try {
        await axios.get(`${BASE_URL}/waitlist/project/${this.projectId}`, {
          headers: { Authorization: `Bearer ${this.projectApiToken}` },
        });
        throw new Error("Should have failed with wrong token type");
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`Expected 401, got ${error.response.status}`);
        }
      }
    });

    // Test 14: Get Waitlist Stats - Success
    await this.test("Get Waitlist Stats - Success", async () => {
      const response = await axios.get(
        `${BASE_URL}/waitlist/project/${this.projectId}/stats`,
        {
          headers: { Authorization: `Bearer ${ENV_API_KEY}` },
        }
      );

      await this.expectResponse(response, 200, ["data"]);
    });

    // Test 15: Get Waitlist Stats - No Auth
    await this.test("Get Waitlist Stats - No Auth", async () => {
      try {
        await axios.get(`${BASE_URL}/waitlist/project/${this.projectId}/stats`);
        throw new Error("Should have failed without auth");
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`Expected 401, got ${error.response.status}`);
        }
      }
    });

    this.printResults();
  }

  printResults() {
    console.log("\n📊 Test Results:");
    console.log("================");

    const passed = this.results.filter((r) => r.status === "PASSED").length;
    const failed = this.results.filter((r) => r.status === "FAILED").length;
    const total = this.results.length;

    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.results
        .filter((r) => r.status === "FAILED")
        .forEach((r) => console.log(`   - ${r.name}: ${r.error}`));
    }

    console.log(`\n🎯 Success Rate: ${Math.round((passed / total) * 100)}%`);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log("🔍 Checking if server is running...");

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log("❌ Server is not running. Please start the server first:");
    console.log("   bun run dev");
    process.exit(1);
  }

  console.log("✅ Server is running!");
  console.log(`🔑 Using Environment API Key: ${ENV_API_KEY}`);

  const tester = new APITester();
  await tester.runTests();
}

main().catch(console.error);
