# API Testing Guide

This project includes comprehensive tests to validate all API endpoints and their authentication requirements.

## Test Types

### 1. Unit Tests (Jest + Supertest)

- **Location**: `tests/api.test.js`
- **Description**: Comprehensive unit tests using in-memory MongoDB
- **Coverage**: All endpoints with various scenarios

### 2. Integration Tests (Live API)

- **Location**: `scripts/test-api.js`
- **Description**: Tests against a running server
- **Coverage**: Authentication validation and endpoint functionality

## Running Tests

### Prerequisites

Make sure you have the test dependencies installed:

```bash
bun install
```

### Unit Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage report
bun test:coverage
```

### Integration Tests (Live API)

```bash
# Start the server first
bun run dev

# In another terminal, run the integration tests
bun run test:api
```

## Test Coverage

### Authentication Tests

- ✅ Environment API Key validation
- ✅ Project API Token validation
- ✅ Invalid token handling
- ✅ Missing token handling
- ✅ Wrong token type usage

### Project Management Tests

- ✅ Create project (success/failure cases)
- ✅ Get all projects
- ✅ Get project by ID
- ✅ Validation errors
- ✅ Duplicate slug handling

### Waitlist Tests

- ✅ Add to waitlist with project token
- ✅ Duplicate email prevention
- ✅ Get waitlist entries (admin only)
- ✅ Get waitlist statistics (admin only)
- ✅ Delete waitlist entry (admin only)
- ✅ Validation errors

### Security Tests

- ✅ Project tokens can't access admin endpoints
- ✅ Environment API key can't add to waitlist
- ✅ Inactive projects blocked
- ✅ Unauthorized access blocked

## Test Results Example

```
🚀 Starting API Tests...

🧪 Testing: Health Check
✅ PASSED: Health Check

🧪 Testing: Create Project - Success
✅ PASSED: Create Project - Success

🧪 Testing: Create Project - No Auth
✅ PASSED: Create Project - No Auth

🧪 Testing: Add to Waitlist - Success
✅ PASSED: Add to Waitlist - Success

🧪 Testing: Add to Waitlist - Wrong Token Type
✅ PASSED: Add to Waitlist - Wrong Token Type

📊 Test Results:
================
✅ Passed: 15/15
❌ Failed: 0/15

🎯 Success Rate: 100%
```

## Environment Variables for Testing

Create a `.env.test` file for test-specific configurations:

```bash
NODE_ENV=test
API_KEY=test-env-api-key
MONGODB_URI=mongodb://localhost:27017/waitlist-test
```

## Manual Testing

You can also test endpoints manually using curl:

### Create Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -d '{
    "name": "Test Project",
    "slug": "test-project",
    "description": "Test project description"
  }'
```

### Add to Waitlist

```bash
curl -X POST http://localhost:3000/api/waitlist/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer project_api_token" \
  -d '{
    "projectId": "project_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "extra": "Interested in beta"
  }'
```

## Continuous Integration

The tests are designed to run in CI/CD environments. Make sure to:

1. Set environment variables
2. Start MongoDB service
3. Run `bun test` for unit tests
4. Run `bun run test:api` for integration tests (if server is running)

## Troubleshooting

### Common Issues

1. **MongoDB connection errors**: Ensure MongoDB is running
2. **Port conflicts**: Make sure port 3000 is available
3. **Environment variables**: Check `.env` file configuration
4. **Test timeouts**: Increase timeout in Jest configuration if needed

### Debug Mode

Enable debug logging in tests:

```bash
DEBUG=* bun test
```
