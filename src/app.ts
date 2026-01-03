// src/app.ts

import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // For handling Cross-Origin Requests
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
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

// // MongoDB URI with fallback for local development
// // Docker: mongodb://mongo:27017/school_db (container name)
// // Local:  mongodb://localhost:27018/school_db (mapped port)
// const MONGO_URI = process.env.MONGO_URI || 
//   (process.env.NODE_ENV === 'development' 
//     ? 'mongodb://localhost:27018/school_db' 
//     : 'mongodb://mongo:27017/school_db');

// // Only connect if not in test mode (tests will manage their own connection)
// if (process.env.NODE_ENV !== 'test') {
//   mongoose.connect(MONGO_URI)
//     .then(() => console.log(`✅ Connected to MongoDB at ${MONGO_URI}`))
//     .catch((err) => console.error('❌ MongoDB Connection Error:', err));
// }

// ----------------------------------------------------------------------
// 2. DATABASE LOGIC (Lambda & Test Safe)
// ----------------------------------------------------------------------

// Cache the connection for Lambda reuse
let cachedConnection: typeof mongoose | null = null;

export const connectToDatabase = async () => {
  // 1. CHECK GLOBAL STATE: If mongoose is already connected (e.g., by Jest), return immediately.
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // 2. CHECK CACHE: If we have a cached connection from a previous Lambda invocation, use it.
  if (cachedConnection) {
    return cachedConnection;
  }

  // 3. CREATE NEW CONNECTION
  console.log("=> Creating new database connection");
  
  // Default to local if env not set (Test/Dev friendly)
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';

  try {
    cachedConnection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
      bufferCommands: false, // Important for Lambda to fail fast if DB is down
    });
    return cachedConnection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};


// ----------------------------------------------------------------------
// 3. DATABASE MIDDLEWARE (*** MISSING BEFORE***)
// ----------------------------------------------------------------------

// This function runs before EVERY route request to ensure DB is active
app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Skip DB connection for simple health checks to save resources
    if (req.path === '/' || req.path === '/health') return next();

    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error("Database Middleware Error:", error);
        res.status(500).json({ 
            statusCode: 500, 
            message: 'Service Unavailable: Database Connection Failed' 
        });
    }
});

// ----------------------------------------------------------------------
// 4. ROUTE DEFINITIONS
// ----------------------------------------------------------------------

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'School Management API Docs'
}));

// Serve swagger.json for Postman collection generation
app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Home Route (Health Check / API Info)
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'School Management API is ready.',
        version: '1.0.0',
        documentation: '/api-docs',
        status: 'Online',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ADD THIS: Health Check Route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

// Use the imported Express Routers
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);


// 404 Handler (Must come after all other routes)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Route not found'
  });
});


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

// ----------------------------------------------------------------------
// 5. EXPORT
// ----------------------------------------------------------------------

// Export the application instance for use in server.ts and for automated testing
export default app;