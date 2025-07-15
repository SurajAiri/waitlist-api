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

## API Endpoints

### Health Check

- `GET /api/health` - Check API status

### Projects

- `POST /api/projects` - Create a new project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:projectId` - Get project by ID

### Waitlist (Main Frontend API)

- `POST /api/waitlist/add` - Add someone to waitlist ⭐ **Main endpoint for frontend**
- `GET /api/waitlist/project/:projectId` - Get waitlist entries for a project
- `GET /api/waitlist/project/:projectId/stats` - Get waitlist statistics
- `DELETE /api/waitlist/project/:projectId/entry/:entryId` - Delete waitlist entry

## Main Frontend Integration

### Add to Waitlist

**POST** `/api/waitlist/add`

This is the main endpoint your frontend will use to add people to a waitlist.

**Request Body:**

```json
{
  "projectId": "507f1f77bcf86cd799439011",
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
- `404` - Project not found or inactive
- `409` - Email already exists in this project's waitlist
- `500` - Internal server error

### Example Frontend Usage

```javascript
// React/JavaScript example
const addToWaitlist = async (projectId, name, email, extra = "") => {
  try {
    const response = await fetch("http://localhost:3000/api/waitlist/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
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
addToWaitlist(
  "507f1f77bcf86cd799439011",
  "John Doe",
  "john@example.com",
  "Interested in beta access"
)
  .then((result) => console.log("Added to waitlist:", result))
  .catch((error) => console.error("Error:", error));
```

## Project Management

### Create Project

**POST** `/api/projects`

```json
{
  "name": "My Awesome Project",
  "slug": "my-awesome-project",
  "description": "This is a description of my project"
}
```

### Get All Projects

**GET** `/api/projects`

Returns all projects with waitlist counts.

## Database Schema

### Project Model

```javascript
{
  name: String,           // Project name
  slug: String,           // Unique slug for project
  description: String,    // Project description
  apiToken: String,       // Auto-generated API token
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
