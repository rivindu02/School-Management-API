# Quick Start Guide - Swagger & Postman

## 🚀 Getting Started

### Step 1: Start the Server

```bash
# Using npm
npm run dev

# OR using Docker
docker-compose up --build
```

Wait for the message: "Connected to MongoDB" and "Server is running on port 3000"

### Step 2: Access Swagger Documentation

Open your browser and go to:
```
http://localhost:3000/api-docs
```

You should see the interactive Swagger UI with all API endpoints documented.

### Step 3: Generate Postman Collection

In a new terminal (while the server is running):

```bash
npm run generate:postman
```

This creates `postman_collection.json` in your project root.

### Step 4: Import to Postman

1. Open Postman
2. Click **"Import"** button (top left)
3. Click **"Choose Files"**
4. Select `postman_collection.json`
5. Click **"Import"**

### Step 5: Set Up Environment

1. In Postman, click **"Environments"** (left sidebar)
2. Click **"+"** to create new environment
3. Name it: **"School API - Local"**
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| baseUrl | http://localhost:3000 | http://localhost:3000 |
| adminToken | (leave empty) | (leave empty) |
| userToken | (leave empty) | (leave empty) |
| courseId | (leave empty) | (leave empty) |
| studentId | (leave empty) | (leave empty) |
| teacherId | (leave empty) | (leave empty) |

5. Click **"Save"**
6. Select this environment from the dropdown (top right)

## 🧪 Testing the API

### Using Swagger UI:

1. **Register an Admin:**
   - Click on `POST /auth/register`
   - Click "Try it out"
   - Use this example:
   ```json
   {
     "username": "admin",
     "email": "admin@test.com",
     "password": "admin123",
     "role": "admin"
   }
   ```
   - Click "Execute"
   - Copy the `token` from the response

2. **Authorize in Swagger:**
   - Click the **"Authorize"** button at the top
   - Enter: `Bearer YOUR_TOKEN_HERE` (replace with your actual token)
   - Click "Authorize"
   - Click "Close"

3. **Test Creating a Course:**
   - Scroll to `POST /courses`
   - Click "Try it out"
   - Modify the example data
   - Click "Execute"
   - You should get a 201 response!

### Using Postman:

1. **Register Admin:**
   - Open the collection
   - Go to: `Authentication → Register a new user`
   - Make sure the body has `"role": "admin"`
   - Click **"Send"**
   - ✅ The token is automatically saved to `{{adminToken}}`!

2. **Register Regular User:**
   - Same endpoint
   - Change role to `"user"`
   - Click **"Send"**
   - ✅ Token saved to `{{userToken}}`!

3. **Create a Course:**
   - Go to: `Courses → Create a new course`
   - Note: It already uses `{{adminToken}}` in the Authorization header
   - Click **"Send"**
   - ✅ Course ID saved to `{{courseId}}`!

4. **Create a Student:**
   - Go to: `Students → Create a new student`
   - Click **"Send"**
   - ✅ Student ID saved!

5. **Enroll Student in Course:**
   - Go to: `Students → Enroll student in a course`
   - The path uses `{{studentId}}` automatically
   - Body uses `{{courseId}}` automatically
   - Click **"Send"**
   - ✅ Student enrolled!

## 🎯 Quick Test Workflow

Run these in order to test the complete flow:

### In Postman (using Collection Runner):

1. Click the **"Runner"** icon (left sidebar)
2. Select **"School Management API"** collection
3. Select your environment: **"School API - Local"**
4. Click **"Run School Management API"**
5. Watch all tests run automatically! 🎉

### Manual Testing Order:

1. ✅ Register Admin
2. ✅ Register User
3. ✅ Create Course (using admin token)
4. ✅ Create Teacher (using admin token)
5. ✅ Create Student (using admin token)
6. ✅ Enroll Teacher in Course
7. ✅ Enroll Student in Course
8. ✅ Get Course Details (see enrolled students/teachers)
9. ✅ Get Student Details (see enrolled courses)
10. ✅ Get Teacher Details (see enrolled courses)

## 📖 Available Endpoints

### Authentication (Public):
- ✅ `POST /auth/register` - Register new user
- ✅ `POST /auth/login` - Login user
- 🔒 `GET /auth/profile` - Get profile (requires token)

### Courses:
- ✅ `GET /courses` - List all courses (public)
- ✅ `GET /courses/:id` - Get course details (public)
- 🔒 `POST /courses` - Create course (admin only)
- 🔒 `PUT /courses/:id` - Update course (auth required)
- 🔒 `DELETE /courses/:id` - Delete course (admin only)

### Students:
- ✅ `GET /students` - List all students (public)
- ✅ `GET /students/:id` - Get student details (public)
- 🔒 `POST /students` - Create student (admin only)
- 🔒 `PUT /students/:id` - Update student (auth required)
- 🔒 `PUT /students/:id/enroll-course` - Enroll in course (auth required)
- 🔒 `PUT /students/:id/remove-course` - Remove from course (auth required)
- 🔒 `DELETE /students/:id` - Delete student (admin only)

### Teachers:
- ✅ `GET /teachers` - List all teachers (public)
- ✅ `GET /teachers/:id` - Get teacher details (public)
- 🔒 `POST /teachers` - Create teacher (admin only)
- 🔒 `PUT /teachers/:id` - Update teacher (auth required)
- 🔒 `PUT /teachers/:id/enroll-course` - Enroll in course (auth required)
- 🔒 `PUT /teachers/:id/remove-course` - Remove from course (auth required)
- 🔒 `DELETE /teachers/:id` - Delete teacher (admin only)

## 🔧 Troubleshooting

### "Cannot GET /api-docs"
- ✅ Make sure the server is running (`npm run dev`)
- ✅ Check the port is 3000
- ✅ Try: `http://localhost:3000/` first to verify server is up

### "Failed to fetch swagger.json"
- ✅ The script needs the server to be running
- ✅ Start server: `npm run dev`
- ✅ Then run: `npm run generate:postman`

### "401 Unauthorized" in Postman
- ✅ Make sure you ran "Register" first
- ✅ Check that `{{adminToken}}` or `{{userToken}}` is set
- ✅ Check the Authorization header is using the token

### "403 Forbidden"
- ✅ This endpoint requires admin role
- ✅ Make sure you're using `{{adminToken}}` not `{{userToken}}`
- ✅ Register with `"role": "admin"`

### Environment variables not working
- ✅ Make sure environment is selected (dropdown top-right)
- ✅ Check variables are saved in the environment
- ✅ Use double curly braces: `{{variableName}}`

## 💡 Tips

1. **Use Swagger for exploration** - Great for understanding API structure
2. **Use Postman for testing** - Better for sequential testing and automation
3. **Save your tokens** - Don't lose them! Or just register again
4. **Use Collection Runner** - Test everything at once
5. **Check the Tests tab** - See what got saved automatically
6. **Watch the Console** - See debug messages from test scripts

## 🎓 Next Steps

1. Try modifying the request bodies
2. Test error cases (wrong credentials, missing fields)
3. Use Collection Runner to test everything at once
4. Export your Postman environment for team sharing
5. Create custom test scripts in Postman

## 📚 More Resources

- **Full Documentation:** See `API_DOCUMENTATION.md`
- **Swagger Spec:** http://localhost:3000/api-docs.json
- **Postman Learning:** https://learning.postman.com/

Happy Testing! 🚀
