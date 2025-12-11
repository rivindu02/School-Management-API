// src/server.ts (New file)

import app from './app'; // Import the application logic
// (Optional: Import mongoose if you want to explicitly close the DB connection on shutdown)

const PORT = process.env.PORT || 3000;

// Start the HTTP server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // console.log(`NODE_ENV: ${process.env.NODE_ENV}`); // Helpful for debugging
});