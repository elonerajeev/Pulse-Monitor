const mongoose = require("mongoose");
const dotenv = require("dotenv");
const DB_NAME = require("./../constants").default;

dotenv.config();

const connectDB = async () => {
  try {
    const connectionStatus = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log("MongoDB connected:", connectionStatus.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

// CommonJS export
module.exports = connectDB;
