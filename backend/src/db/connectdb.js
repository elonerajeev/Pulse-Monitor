import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = async () => {
  try {
    const connectionStatus = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "hello",
    });
    console.log("MongoDB connected:", connectionStatus.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
