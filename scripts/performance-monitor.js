#!/usr/bin/env node

/**
 * Performance monitoring script for MongoDB connection issues
 * Run this script to test connection stability and performance
 */

import axios from "axios";
import { performance } from "perf_hooks";

const BASE_URL = "http://localhost:3000";
const NUM_TESTS = 10;
const CONCURRENT_REQUESTS = 5;

class PerformanceMonitor {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  async testEndpoint(url, description) {
    const start = performance.now();

    try {
      const response = await axios.get(url, { timeout: 10000 });
      const end = performance.now();
      const duration = end - start;

      this.results.push({
        test: description,
        status: response.status,
        duration: Math.round(duration),
        success: true,
      });

      return { success: true, duration, status: response.status };
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      this.errors.push({
        test: description,
        error: error.message,
        duration: Math.round(duration),
        success: false,
      });

      return { success: false, duration, error: error.message };
    }
  }

  async runConcurrentTests() {
    console.log(`🔄 Running ${CONCURRENT_REQUESTS} concurrent requests...`);

    const promises = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) =>
      this.testEndpoint(`${BASE_URL}/api/health`, `Concurrent Request ${i + 1}`)
    );

    const results = await Promise.all(promises);
    const successful = results.filter((r) => r.success).length;
    const avgDuration =
      results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    console.log(`✅ ${successful}/${CONCURRENT_REQUESTS} requests successful`);
    console.log(`⏱️  Average response time: ${Math.round(avgDuration)}ms`);

    return results;
  }

  async runSequentialTests() {
    console.log(`🔄 Running ${NUM_TESTS} sequential requests...`);

    const results = [];
    for (let i = 0; i < NUM_TESTS; i++) {
      const result = await this.testEndpoint(
        `${BASE_URL}/api/health`,
        `Sequential Request ${i + 1}`
      );
      results.push(result);

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successful = results.filter((r) => r.success).length;
    const avgDuration =
      results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    console.log(`✅ ${successful}/${NUM_TESTS} requests successful`);
    console.log(`⏱️  Average response time: ${Math.round(avgDuration)}ms`);

    return results;
  }

  async testDatabaseOperations() {
    console.log("🔄 Testing database operations...");

    const API_KEY = process.env.API_KEY || "0Uh6zVHFr6lNngqdinCiDaQ2bPK7NaEA";

    try {
      // Test creating a project (database write)
      const projectData = {
        name: "Performance Test Project",
        slug: `perf-test-${Date.now()}`,
        description: "This is a performance test project",
      };

      const start = performance.now();
      const response = await axios.post(
        `${BASE_URL}/api/projects`,
        projectData,
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
          timeout: 10000,
        }
      );
      const end = performance.now();

      console.log(`✅ Database write operation: ${Math.round(end - start)}ms`);

      // Test reading projects (database read)
      const readStart = performance.now();
      const readResponse = await axios.get(`${BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        timeout: 10000,
      });
      const readEnd = performance.now();

      console.log(
        `✅ Database read operation: ${Math.round(readEnd - readStart)}ms`
      );

      return { success: true, projectId: response.data.data.id };
    } catch (error) {
      console.log(`❌ Database operation failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log("🚀 Starting MongoDB Connection Performance Tests");
    console.log("=".repeat(60));

    // Check if server is running
    try {
      await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
      console.log("✅ Server is running and accessible");
    } catch (error) {
      console.log(
        "❌ Server is not accessible. Please start the server first."
      );
      console.log("   Run: npm run dev");
      return;
    }

    console.log("");

    // Run tests
    await this.runSequentialTests();
    console.log("");

    await this.runConcurrentTests();
    console.log("");

    await this.testDatabaseOperations();
    console.log("");

    this.printSummary();
  }

  printSummary() {
    console.log("📊 Performance Summary");
    console.log("=".repeat(60));

    const totalTests = this.results.length;
    const successfulTests = this.results.filter((r) => r.success).length;
    const failedTests = this.errors.length;

    console.log(`Total requests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(
      `Success rate: ${Math.round((successfulTests / totalTests) * 100)}%`
    );

    if (this.results.length > 0) {
      const durations = this.results.map((r) => r.duration);
      const avgDuration =
        durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      console.log(`\nResponse Times:`);
      console.log(`Average: ${Math.round(avgDuration)}ms`);
      console.log(`Min: ${Math.round(minDuration)}ms`);
      console.log(`Max: ${Math.round(maxDuration)}ms`);
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach((error) => {
        console.log(`  - ${error.test}: ${error.error}`);
      });
    }

    console.log("\n🎯 Recommendations:");

    if (failedTests === 0) {
      console.log("✅ All tests passed! MongoDB connection is stable.");
    } else {
      console.log("⚠️  Some tests failed. Check the errors above.");
    }

    const avgResponseTime =
      this.results.length > 0
        ? this.results.reduce((sum, r) => sum + r.duration, 0) /
          this.results.length
        : 0;

    if (avgResponseTime > 1000) {
      console.log(
        "⚠️  Response times are slow. Consider optimizing database queries."
      );
    } else if (avgResponseTime > 500) {
      console.log(
        "⚠️  Response times are moderate. Monitor for performance issues."
      );
    } else {
      console.log("✅ Response times are good.");
    }
  }
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const monitor = new PerformanceMonitor();
  await monitor.runAllTests();
}

// Run the tests
main().catch(console.error);
