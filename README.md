# School Management API

A RESTful API for managing school operations including students, teachers, and courses with JWT authentication and role-based access control.

## Overview

This API provides a complete backend solution for school management systems. It handles user authentication, manages student and teacher records, and supports course enrollment with referential integrity.

### Key Capabilities

- **Authentication** — JWT-based login with admin and user roles
- **Student Management** — CRUD operations with course enrollment
- **Teacher Management** — CRUD operations with course assignment
- **Course Management** — Create and manage courses
- **Role-Based Access** — Admin-only operations for create/delete

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Run with Docker

```bash
git clone https://github.com/yourusername/School-Management-API.git
cd School-Management-API
npm install
docker-compose up --build
```

### Run Locally

```bash
docker-compose up -d mongo    # Start MongoDB
npm run dev                   # Start API server
```

**API:** http://localhost:3000  
**Swagger Docs:** http://localhost:3000/api-docs

## API Endpoints

### Authentication
```
POST   /auth/register     Register user (public)
POST   /auth/login        Login (public)
GET    /auth/profile      Get profile (auth required)
```

### Students
```
GET    /students              List all
GET    /students/:id          Get by ID 
POST   /students              Create (admin)
PUT    /students/:id          Update
DELETE /students/:id          Delete (admin)
PUT    /students/:id/enroll-course   Enroll in course
PUT    /students/:id/remove-course   Remove from course
```

### Teachers
```
GET    /teachers              List all
GET    /teachers/:id          Get by ID
POST   /teachers              Create (admin)
PUT    /teachers/:id          Update
DELETE /teachers/:id          Delete (admin)
PUT    /teachers/:id/enroll-course   Assign to course
PUT    /teachers/:id/remove-course   Remove from course
```

### Courses
```
GET    /courses               List all
GET    /courses/:id           Get by ID
POST   /courses               Create (admin)
PUT    /courses/:id           Update
DELETE /courses/:id           Delete (admin)
```

## Authentication

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"password123","role":"admin"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

**Use Token:**
```bash
curl http://localhost:3000/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27018/school_db
JWT_SECRET=your-secret-key
```

## Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Build TypeScript
npm start            # Production server
npm test             # Run tests
npm run docker:up    # Start Docker containers
npm run docker:down  # Stop Docker containers
```

## Testing

```bash
npm test                 # All tests
npm test auth            # Auth tests
npm test student         # Student tests
npm test teacher         # Teacher tests
npm test course          # Course tests
```

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — System design and project structure
