# Architecture

This document describes the system architecture and design decisions for the School Management API.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client                                  │
│                  (Postman / Frontend App)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Server                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   CORS      │→ │   JSON      │→ │   Swagger Docs          │  │
│  │ Middleware  │  │   Parser    │  │   /api-docs             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Routes                                  │
│  /auth/*  │  /students/*  │  /teachers/*  │  /courses/*         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Middleware                                │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  authenticate   │  │  authorize   │  │    validate      │   │
│  │  (JWT verify)   │  │  (role check)│  │  (Zod schema)    │   │
│  └─────────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Controllers                                │
│         Handle HTTP request/response                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Services                                  │
│         Business logic & data validation                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Models                                   │
│         Mongoose schemas & database operations                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB                                   │
│                    (Docker Container)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── app.ts                 # Express app setup & database connection
├── server.ts              # Entry point
│
├── config/
│   └── swagger.ts         # OpenAPI/Swagger configuration
│
├── routes/                # API endpoint definitions
│   ├── authRoutes.ts      # /auth/*
│   ├── studentRoutes.ts   # /students/*
│   ├── teacherRoutes.ts   # /teachers/*
│   └── courseRoutes.ts    # /courses/*
│
├── middleware/            # Request interceptors
│   ├── auth.ts            # JWT authentication & role authorization
│   └── validate.ts        # Zod schema validation
│
├── controllers/           # HTTP request handlers
│   ├── authController.ts
│   ├── studentController.ts
│   ├── teacherController.ts
│   └── courseController.ts
│
├── services/              # Business logic layer
│   ├── studentService.ts
│   ├── teacherService.ts
│   └── courseService.ts
│
├── models/                # Mongoose schemas
│   ├── User.ts            # User authentication model
│   ├── Student.ts         # Student with course references
│   ├── Teacher.ts         # Teacher with course references
│   └── Course.ts          # Course model
│
├── schemas/               # Zod validation schemas
│   ├── userSchema.ts
│   ├── studentSchema.ts
│   ├── teacherSchema.ts
│   └── courseSchema.ts
│
└── utils/
    └── AppError.ts        # Custom error class
```

## Data Models

### User
```
User
├── username: string (required, unique)
├── email: string (required, unique)
├── password: string (hashed with bcrypt)
└── role: 'user' | 'admin'
```

### Student
```
Student
├── name: string (required)
├── email: string (required, unique)
├── age: number (required)
└── courses: ObjectId[] → Course (many-to-many)
```

### Teacher
```
Teacher
├── name: string (required)
├── email: string (required, unique)
├── subject: string (required)
└── courses: ObjectId[] → Course (many-to-many)
```

### Course
```
Course
├── title: string (required)
├── code: string (required, unique) e.g., "CS101"
└── credits: number (required)
```

## Request Flow

```
Request → Route → Middleware → Controller → Service → Model → Database
                     │
                     ├── authenticate: Verify JWT token
                     ├── authorize: Check user role
                     └── validate: Validate request body with Zod
```

### Example: Create Student (Admin Only)

```
POST /students
    │
    ▼
Route: studentRoutes.ts
    │
    ├── authenticate()     → Verify JWT, extract user
    ├── authorize('admin') → Check if user.role === 'admin'
    ├── validate(schema)   → Validate body against Zod schema
    │
    ▼
Controller: studentController.create()
    │
    ▼
Service: studentService.createStudent()
    │
    ├── Check for duplicate email
    └── Create in database
    │
    ▼
Response: 201 Created + Student JSON
```

## Authentication & Authorization

### JWT Flow
```
1. Register/Login → Server generates JWT with { id, role }
2. Client stores token
3. Client sends: Authorization: Bearer <token>
4. authenticate middleware verifies token
5. authorize middleware checks role permissions
```

### Role Permissions

| Operation     | User | Admin |
|---------------|------|-------|
| GET (read)    | ✅   | ✅    |
| PUT (update)  | ✅   | ✅    |
| POST (create) | ❌   | ✅    |
| DELETE        | ❌   | ✅    |

## Validation Layer

Request validation uses Zod schemas before reaching controllers:

```typescript
// schemas/studentSchema.ts
export const createStudentSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().min(1).max(100)
});

// routes/studentRoutes.ts
router.post('/',
  authenticate,
  authorize('admin'),
  validate(createStudentSchema),  // ← Validates req.body
  studentController.create
);
```

## Error Handling

Custom `AppError` class for consistent error responses:

```typescript
throw new AppError(404, 'Student not found');
// → { statusCode: 404, message: 'Student not found' }
```

## API Documentation

Swagger/OpenAPI documentation is auto-generated from JSDoc comments in route files:

```typescript
/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student (Admin only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 */
router.post('/', authenticate, authorize('admin'), validate(createStudentSchema), studentController.create);
```

**Access:** http://localhost:3000/api-docs

## Technology Stack

| Layer          | Technology         | Purpose                          |
|----------------|--------------------|---------------------------------|
| Runtime        | Node.js 18+        | JavaScript runtime              |
| Framework      | Express.js 5       | HTTP server & routing           |
| Language       | TypeScript         | Type safety                     |
| Database       | MongoDB            | Document storage                |
| ODM            | Mongoose           | Schema & query builder          |
| Authentication | jsonwebtoken       | JWT token generation/verify     |
| Password       | bcryptjs           | Password hashing                |
| Validation     | Zod                | Request body validation         |
| Documentation  | swagger-jsdoc      | Generate OpenAPI spec from JSDoc|
| API Docs UI    | swagger-ui-express | Interactive documentation       |
| CORS           | cors               | Cross-origin requests           |
| Testing        | Jest + Supertest   | Unit & integration tests        |
| Container      | Docker             | Deployment                      |
