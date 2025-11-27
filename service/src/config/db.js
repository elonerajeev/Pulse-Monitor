import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path"; // Import path module
import { fileURLToPath } from "url"; // Import for __dirname equivalent

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const db = async () => {
  try {
    const connectionStatus = await mongoose.connect(
      `${process.env.MONGO_URI}`,
      {
        dbName: "hello", // Add dbName for consistency with backend
      }
    );
    console.log("MongoDB connected:", connectionStatus.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default db;
