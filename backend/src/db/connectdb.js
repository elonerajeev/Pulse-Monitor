import mongoose from "mongoose";
import dotenv from "dotenv";
import DB_NAME from "./../constants.js";

dotenv.config();

const connectDB = async () => {
  try {
    const connectionStatus = await mongoose.connect(
      `${process.env.MONGO_URI}`
    );
    console.log("MongoDB connected:", connectionStatus.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
