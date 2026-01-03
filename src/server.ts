// src/server.ts 

// Entry point for the Express application
// This server file is responsible for:
// 1. Starting the HTTP server on the specified port
// 2. Importing and using the main application logic
// 3. Handling environment configuration
// 4. Providing startup logging information


import app from './app'; // Import the application logic
// (Optional: Import mongoose if you want to explicitly close the DB connection on shutdown)


// The Lambda Web Adapter will set the PORT env variable (usually 8080 or 3000)
// We default to 3000 if not set.

const PORT = process.env.PORT || 3000;

// Start the HTTP server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`); // Helpful for debugging
});