# School Management API - Authentication & Authorization

This API now includes **JWT-based authentication** and **role-based authorization** with two user roles:

## User Roles

- **user**: Can manage students, courses, and enrollments but cannot manage teachers
- **admin**: Has full access to all resources including teacher management

## Authentication Endpoints

### 1. Register a New User
```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, defaults to "user", can be "user" or "admin"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 2. Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 3. Get User Profile
```
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Protected Endpoints

All endpoints below require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Student Endpoints

### Permissions:
- **View**: All authenticated users
- **Create/Update/Delete/Enroll**: `user` and `admin`

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/students` | user, admin | Create a new student |
| GET | `/students` | user, admin | Get all students |
| GET | `/students/:id` | user, admin | Get a student by ID |
| PUT | `/students/:id` | user, admin | Update a student |
| DELETE | `/students/:id` | user, admin | Delete a student |
| PUT | `/students/:id/enroll-course` | user, admin | Enroll student in a course |
| PUT | `/students/:id/remove-course` | user, admin | Remove student from a course |

## Teacher Endpoints

### Permissions:
- **View**: All authenticated users
- **Create/Update/Delete/Enroll**: `admin` only

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/teachers` | **admin only** | Create a new teacher |
| GET | `/teachers` | user, admin | Get all teachers |
| GET | `/teachers/:id` | user, admin | Get a teacher by ID |
| PUT | `/teachers/:id` | **admin only** | Update a teacher |
| DELETE | `/teachers/:id` | **admin only** | Delete a teacher |
| PUT | `/teachers/:id/enroll-course` | **admin only** | Assign teacher to a course |
| PUT | `/teachers/:id/remove-course` | **admin only** | Remove teacher from a course |

## Course Endpoints

### Permissions:
- **View**: All authenticated users
- **Create/Update/Delete**: `user` and `admin`

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/courses` | user, admin | Create a new course |
| GET | `/courses` | user, admin | Get all courses |
| GET | `/courses/:id` | user, admin | Get a course by ID |
| PUT | `/courses/:id` | user, admin | Update a course |
| DELETE | `/courses/:id` | user, admin | Delete a course |

## Example Usage

### 1. Register a new admin user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "email": "admin@school.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Login and get token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123"
  }'
```

### 3. Create a teacher (admin only)
```bash
curl -X POST http://localhost:3000/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Dr. Smith",
    "email": "smith@school.com",
    "subject": "Mathematics"
  }'
```

### 4. Create a student (user or admin)
```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@school.com",
    "age": 16
  }'
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "No token provided. Please log in."
}
```

### 403 Forbidden
```json
{
  "message": "You do not have permission to perform this action"
}
```

### 400 Validation Error
```json
{
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Security Notes

1. **JWT Token**: Tokens expire after 7 days. Users need to login again after expiration.
2. **Password Security**: Passwords are hashed using bcrypt before storing in the database.
3. **Environment Variables**: In production, set `JWT_SECRET` environment variable instead of using the default.

## Getting Started

1. **Start the application:**
```bash
docker-compose up
```

2. **Create an admin user** (first user should be admin):
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@school.com",
    "password": "admin123",
    "role": "admin"
  }'
```

3. **Save the token** from the response and use it in subsequent requests.

## Summary of Permissions

| Action | User | Admin |
|--------|------|-------|
| View Students, Teachers, Courses | ✅ | ✅ |
| Create/Update/Delete Students | ✅ | ✅ |
| Enroll/Remove Students from Courses | ✅ | ✅ |
| Create/Update/Delete Courses | ✅ | ✅ |
| Create Teachers | ❌ | ✅ |
| Update Teachers | ❌ | ✅ |
| Delete Teachers | ❌ | ✅ |
| Assign/Remove Teachers from Courses | ❌ | ✅ |
