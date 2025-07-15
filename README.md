# Waitlist API

A simple REST API for managing project-based waitlists. Built with Node.js, Express, and MongoDB.

## Features

- **Project-based waitlists**: Each project can have its own waitlist
- **Duplicate prevention**: Prevents the same email from being added twice to the same project
- **Input validation**: Comprehensive validation for all inputs
- **Statistics**: Get waitlist stats and analytics
- **CORS enabled**: Ready for frontend integration

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your MongoDB connection string and other settings.

4. Start the server:

   ```bash
   # Development
   bun run dev

   # Production
   bun start
   ```

## API Authentication

The API uses a two-tier authentication system:

### 1. Project-Level API Token (🔑)

- **Used for**: Adding entries to waitlist only
- **Endpoint**: `POST /api/waitlist/add`
- **Purpose**: Each project has its own unique API token that allows frontend applications to add users to that specific project's waitlist
- **Header**: `Authorization: Bearer <project-api-token>`
- **Security**: Limited scope - can only add entries to the specific project

### 2. Environment-Level API Key (🔒)

- **Used for**: All administrative operations
- **Endpoints**: Project management, waitlist viewing, statistics, deletions
- **Purpose**: Full administrative access to manage projects and view/manage all waitlist data
- **Header**: `Authorization: Bearer <environment-api-key>`
- **Configuration**: Set in `.env` file as `API_KEY`
- **Security**: Full access - protect this key carefully

## API Endpoints

### Health Check

- `GET /api/health` - Check API status (No auth required)

### Projects (🔒 All require Environment API Key)

- `POST /api/projects` - Create a new project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:projectId` - Get project by ID

### Waitlist

- `POST /api/waitlist/add` - Add someone to waitlist (🔑 **Project API Token only**)
- `GET /api/waitlist/project/:projectId` - Get waitlist entries (🔒 Environment API Key)
- `GET /api/waitlist/project/:projectId/stats` - Get waitlist statistics (🔒 Environment API Key)
- `DELETE /api/waitlist/project/:projectId/entry/:entryId` - Delete waitlist entry (🔒 Environment API Key)

## Frontend Integration

### Add to Waitlist (🔑 Project API Token Required)

**POST** `/api/waitlist/add`

This is the main endpoint your frontend will use to add people to a waitlist. It requires the project's unique API token.

**Authentication:**

```
Authorization: Bearer <project-api-token>
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "extra": "Any additional information (optional)"
}
```

**Success Response (201):**

```json
{
  "statusCode": 201,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "email": "john@example.com",
    "name": "John Doe",
    "extra": "Any additional information",
    "project": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "My Project",
      "slug": "my-project"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Successfully added to waitlist"
}
```

**Error Responses:**

- `400` - Validation failed
- `401` - Invalid or missing project API token
- `404` - Project not found or inactive
- `409` - Email already exists in this project's waitlist
- `500` - Internal server error

### Example Frontend Usage

```javascript
// React/JavaScript example
const addToWaitlist = async (projectApiToken, name, email, extra = "") => {
  try {
    const response = await fetch("http://localhost:3000/api/waitlist/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${projectApiToken}`, // Project API token
      },
      body: JSON.stringify({
        name,
        email,
        extra,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Successfully added to waitlist:", data.data);
      return data.data;
    } else {
      throw new Error(data.message || "Failed to add to waitlist");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// Usage
const projectApiToken = "your-project-api-token-here";
addToWaitlist(
  projectApiToken,
  "John Doe",
  "john@example.com",
  "Interested in beta access"
)
  .then((result) => console.log("Added to waitlist:", result))
  .catch((error) => console.error("Error:", error));
```

## Administrative Operations (🔒 Environment API Key Required)

All administrative operations require the environment-level API key set in your `.env` file.

**Authentication Header:**

```
Authorization: Bearer <environment-api-key>
```

### Project Management

#### Create Project

**POST** `/api/projects`

```json
{
  "name": "My Awesome Project",
  "slug": "my-awesome-project",
  "description": "This is a description of my project"
}
```

**Response includes the generated `apiToken` for the project.**

#### Get All Projects

**GET** `/api/projects`

Returns all projects with waitlist counts.

#### Get Project by ID

**GET** `/api/projects/:projectId`

### Waitlist Management

#### Get Waitlist Entries

**GET** `/api/waitlist/project/:projectId`

Query parameters: `page`, `limit`, `search`, `sortBy`, `sortOrder`

#### Get Waitlist Statistics

**GET** `/api/waitlist/project/:projectId/stats`

#### Delete Waitlist Entry

**DELETE** `/api/waitlist/project/:projectId/entry/:entryId`

## Database Schema

### Project Model

```javascript
{
  name: String,           // Project name
  slug: String,           // Unique slug for project
  description: String,    // Project description
  apiToken: String,       // Auto-generated API token for project-level auth
  isActive: Boolean,      // Whether project is active
  createdAt: Date
}
```

### Waitlist Model

```javascript
{
  email: String,          // User email (required)
  name: String,           // User name (required)
  extra: String,          // Any additional info (optional)
  projectId: ObjectId,    // Reference to Project (required)
  createdAt: Date
}
```

## Security Considerations

### Project API Token (🔑)

- **Scope**: Limited to adding entries to one specific project's waitlist
- **Usage**: Safe to use in frontend applications
- **Regeneration**: Can be regenerated if compromised
- **Distribution**: Can be shared with frontend developers

### Environment API Key (🔒)

- **Scope**: Full administrative access to all projects and waitlists
- **Usage**: Server-side only, never expose in frontend
- **Storage**: Keep in `.env` file and environment variables
- **Access**: Restrict to authorized administrators only

## Validation Rules

### Waitlist Entry

- **email**: Must be a valid email address
- **name**: 2-100 characters, required
- **extra**: Up to 500 characters, optional
- **projectId**: Must be a valid MongoDB ObjectId

### Project

- **name**: 2-100 characters, required
- **slug**: 2-50 characters, lowercase letters, numbers, and hyphens only
- **description**: 10-500 characters, required

## Features

- **Duplicate Prevention**: Compound unique index on email + projectId
- **Input Validation**: Uses Joi for comprehensive validation
- **Error Handling**: Consistent error responses
- **CORS**: Enabled for frontend integration
- **Statistics**: Built-in analytics for waitlist performance

## Testing

This project includes comprehensive tests to validate all endpoints and authentication mechanisms.

### Quick Test Commands

```bash
# Run unit tests
bun test

# Run integration tests (requires server running)
bun run test:api

# Run all tests
bun run test:all
```

For detailed testing information, see [TESTING.md](TESTING.md).

## Environment Variables

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/waitlist
JWT_SECRET=your_jwt_secret
NODE_ENV=development
API_KEY=your_api_key
```

## License

ISC
