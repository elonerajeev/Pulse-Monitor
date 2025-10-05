import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/connectdb.js";
import app from "./app.js"; // Import configured app

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
