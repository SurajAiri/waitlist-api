// Test setup file
import mongoose from "mongoose";

// Set test environment
process.env.NODE_ENV = "test";

// Global test timeout
jest.setTimeout(30000);

// Mock console.log for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Clean up after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
