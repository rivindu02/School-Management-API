# School Management API - Documentation

## 📚 Swagger API Documentation

This API includes comprehensive Swagger/OpenAPI documentation for all endpoints.

### Accessing Swagger UI

1. **Start the server:**
   ```bash
   npm run dev
   # or
   docker-compose up --build
   ```

2. **Open Swagger UI in your browser:**
   ```
   http://localhost:3000/api-docs
   ```

3. **Features:**
   - 📖 Interactive API documentation
   - 🧪 Try out endpoints directly from the browser
   - 🔐 Test authentication with JWT tokens
   - 📝 View request/response schemas
   - ✅ See example values for all fields

### Using Swagger UI

#### Testing Authentication:
1. Click on **POST /auth/register** or **POST /auth/login**
2. Click "Try it out"
3. Modify the request body
4. Click "Execute"
5. Copy the JWT token from the response
6. Click "Authorize" button at the top
7. Enter: `Bearer YOUR_TOKEN_HERE`
8. Now you can test protected endpoints

#### Testing Protected Endpoints:
1. Make sure you've authorized (see above)
2. Navigate to any protected endpoint
3. Click "Try it out"
4. Fill in required parameters
5. Click "Execute"

## 📮 Postman Collection

### Generate Postman Collection

The project includes an automated script to generate a Postman collection from the Swagger documentation.

#### Prerequisites:
- ✅ MongoDB running: `sudo docker-compose up -d mongo`
- ✅ API server running: `npm run dev`

#### Steps:

1. **Start MongoDB (if not running):**
   ```bash
   sudo docker-compose up -d mongo
   ```

2. **Start the API server (in another terminal):**
   ```bash
   npm run dev
   ```

3. **Generate the collection (in another terminal):**
   ```bash
   npm run generate:postman
   ```

4. **Import to Postman:**
   - Open Postman
   - Click "Import"
   - Select `postman_collection.json` from the project root
   - Click "Import"

> **Note:** The generator fetches the live Swagger spec from your running server at `http://localhost:3000/api-docs.json`, so the server must be running first.

### Setting Up Postman Environment

1. **Create a new environment in Postman:**
   - Click "Environments" in the sidebar
   - Click "+" to create new environment
   - Name it: "School API - Local"

2. **Add these variables:**
   ```
   baseUrl: http://localhost:3000
   adminToken: (will be set automatically)
   userToken: (will be set automatically)
   courseId: (will be set automatically)
   studentId: (will be set automatically)
   teacherId: (will be set automatically)
   ```

3. **Select the environment** from the dropdown in the top-right

### Using the Postman Collection

#### Quick Start Workflow:

1. **Register Admin:**
   - Go to `Authentication` folder
   - Run "Register a new user" with admin role
   - Token automatically saved to `{{adminToken}}`

2. **Register Regular User:**
   - Run "Register a new user" with user role
   - Token automatically saved to `{{userToken}}`

3. **Create a Course:**
   - Go to `Courses` folder
   - Run "Create a new course (Admin only)"
   - Course ID automatically saved to `{{courseId}}`

4. **Create Students and Teachers:**
   - Similar to courses
   - IDs saved automatically

5. **Test Enrollments:**
   - Use saved IDs in enrollment endpoints

#### Collection Features:

✅ **Auto-save tokens** - JWT tokens saved after login/register
✅ **Auto-save IDs** - Entity IDs saved after creation
✅ **Pre-configured tests** - Response validation included
✅ **Response time checks** - Performance monitoring
✅ **Environment variables** - Easy switching between dev/prod

### Collection Runner

Test all endpoints in sequence:

1. Open Collection Runner (Runner icon in sidebar)
2. Select "School Management API" collection
3. Select your environment
4. Click "Run School Management API"
5. View results and export report

## 🔐 API Endpoints Overview

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (🔒 Protected)

### Courses
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create course (🔒 Admin only)
- `PUT /courses/:id` - Update course (🔒 Auth required)
- `DELETE /courses/:id` - Delete course (🔒 Admin only)

### Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create student (🔒 Admin only)
- `PUT /students/:id` - Update student (🔒 Auth required)
- `PUT /students/:id/enroll-course` - Enroll in course (🔒 Auth required)
- `PUT /students/:id/remove-course` - Remove from course (🔒 Auth required)
- `DELETE /students/:id` - Delete student (🔒 Admin only)

### Teachers
- `GET /teachers` - Get all teachers
- `GET /teachers/:id` - Get teacher by ID
- `POST /teachers` - Create teacher (🔒 Admin only)
- `PUT /teachers/:id` - Update teacher (🔒 Auth required)
- `PUT /teachers/:id/enroll-course` - Enroll in course (🔒 Auth required)
- `PUT /teachers/:id/remove-course` - Remove from course (🔒 Auth required)
- `DELETE /teachers/:id` - Delete teacher (🔒 Admin only)

## 🧪 Testing Examples

### Register Admin (curl):
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Create Course (with token):
```bash
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Advanced Mathematics",
    "code": "MATH301",
    "credits": 3
  }'
```

### Get All Students:
```bash
curl http://localhost:3000/students
```

## 🛠️ Development

### Regenerate Postman Collection:

After making changes to the API:

1. Update Swagger JSDoc comments in route files
2. Restart the server
3. Run: `npm run generate:postman`
4. Re-import the collection in Postman

### Updating Swagger Documentation:

Edit the Swagger JSDoc comments in:
- `/src/routes/authRoutes.ts`
- `/src/routes/courseRoutes.ts`
- `/src/routes/studentRoutes.ts`
- `/src/routes/teacherRoutes.ts`

Or update schemas in:
- `/src/config/swagger.ts`

## 📊 Response Formats

### Success Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Advanced Mathematics",
  "code": "MATH301",
  "credits": 3,
  "createdAt": "2025-12-28T10:00:00.000Z",
  "updatedAt": "2025-12-28T10:00:00.000Z"
}
```

### Error Response:
```json
{
  "statusCode": 400,
  "message": "Validation error message"
}
```

### Authentication Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

## 🔗 Additional Resources

- [Swagger Documentation](http://localhost:3000/api-docs)
- [Swagger JSON](http://localhost:3000/api-docs.json)
- [Postman Documentation](https://learning.postman.com/)
- [OpenAPI Specification](https://swagger.io/specification/)

## 🚀 Quick Tips

1. **Save your tokens:** Always save JWT tokens after login for subsequent requests
2. **Use environment variables:** Makes switching between dev/staging/prod easier
3. **Test incrementally:** Test each endpoint as you build
4. **Check response times:** Monitor API performance
5. **Use Collection Runner:** Automate testing workflows

## 📝 Notes

- Default port: 3000
- MongoDB runs on: 27017
- All protected endpoints require `Authorization: Bearer <token>` header
- Admin role required for create/delete operations
- User role sufficient for read/update operations
