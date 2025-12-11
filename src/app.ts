// src/app.ts

import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // For handling Cross-Origin Requests
import { AppError } from './utils/AppError';

// ----------------------------------------------------------------------
// 1. IMPORT ROUTES AND MIDDLEWARE
// ----------------------------------------------------------------------

// Import the Middleware we discussed (to be created in src/middleware/)
// Note: We don't import the function itself yet, only the file structure placeholder
// import { verifyToken, authorize } from './middleware/authMiddleware'; 

// Import the Route files (these will contain the actual logic and use the middleware)
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';


const app = express();

// ----------------------------------------------------------------------
// 2. CONFIGURATION & MIDDLEWARE SETUP
// ----------------------------------------------------------------------

// A. Express Middleware
app.use(express.json()); // Allows parsing of JSON request bodies (e.g., for login)

// B. CORS Configuration (Security Best Practice)
// For development, we allow all origins. For production, restrict this.
// Note: You can customize the `allowedOrigins` array if needed, as shown previously.
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
}));


// ----------------------------------------------------------------------
// 3. DATABASE CONNECTION
// ----------------------------------------------------------------------

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/school_db';

// Only connect if not in test mode (tests will manage their own connection)
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB via Docker!'))
    .catch((err) => console.error('MongoDB Connection Error:', err));
}


// ----------------------------------------------------------------------
// 4. ROUTE DEFINITIONS
// ----------------------------------------------------------------------

// Home Route (Health Check / API Info)
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'School Management API is ready.',
        version: '1.0.0',
        documentation: '/docs', // Placeholder for future swagger docs
        status: 'Online'
    });
});

// Use the imported Express Routers
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);

// ERROR HANDLING MIDDLEWARE
// This catches all errors from routes and passes them to the error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    statusCode,
    message
  });
});

// 404 Handler (Must come after all other routes)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Route not found'
  });
});


// ----------------------------------------------------------------------
// 5. EXPORT
// ----------------------------------------------------------------------

// Export the application instance for use in server.ts and for automated testing
export default app;