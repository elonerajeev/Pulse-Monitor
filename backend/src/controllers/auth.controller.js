import User from "../models/user.modle.js";
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
  console.log(req.body)
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

    console.log("User logged in:", req.body);
    console.log("User logged in successfully:");
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    throw error;
  }
};

export { registerUser, loginUser };
