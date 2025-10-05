import User from "../models/user.model.js";
import generateToken from "../utils/token.util.js";

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  console.log(req.body)
  // console.log(req.body);
  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
    console.log(req.body);
    console.log("User registered successfully:");
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with:", req.body);

  try {
    if (!email || !password) {
      console.log("Login failed: Missing email or password");
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Searching for user with email:", email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Login failed: User not found with email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("User found:", user.email);
    console.log("Comparing passwords...");
    const isMatch = await user.comparePassword(password);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      console.log("Login failed: Password does not match for user:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("Password matched. Generating token...");
    const token = generateToken(user._id);
    console.log("Token generated.");

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
    });

    console.log("User logged in successfully:", user.email);
  } catch (error) {
    console.error("!!! SERVER ERROR DURING LOGIN !!!");
    console.error("Error object:", error);
    console.error("Request body:", req.body);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { registerUser, loginUser };
