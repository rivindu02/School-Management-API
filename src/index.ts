// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Import Routes
import courseRoutes from './routes/courseRoutes';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import authRoutes from './routes/authRoutes';
import { AppError } from './utils/AppError';

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies (important for POST/PUT requests later)
app.use(express.json());

// 1. The Database Connection
// NOTICEEEEEEE**: We use 'mongo' as the hostname, not 'localhost'.
// This is because in Docker, we will name our database service 'mongo'.
// For testing, we use MONGO_URI env variable or fallback to Docker hostname
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/school_db';

// Only connect if not in test mode (tests will manage their own connection)
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB via Docker!'))
    .catch((err) => console.error('MongoDB Connection Error:', err));
}

// 2. A Simple Test Route
// app.get('/', (req: Request, res: Response) => {
//   res.send('API is running inside Docker!');
// });

// Home Route
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'School Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            courses: '/courses',
            students: '/students',
            teachers: '/teachers'
        }
    });
});

// Authentication Routes
app.use('/auth', authRoutes);

// Use Routes
app.use('/courses', courseRoutes);
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);

// Global Error Handler
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  // Only log errors in non-test environments to reduce noise
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      error: err.message
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(400).json({
      message: 'Duplicate field value entered'
    });
  }

  // Default error
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});


// Start the Server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// for automatic testing purpose
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


// Export for testing
export default app;