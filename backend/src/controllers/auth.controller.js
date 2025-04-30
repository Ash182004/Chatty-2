import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { config } from "dotenv";
config();

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Received login request with email:", email);

    // Step 1: Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.error("❌ User not found for email:", email); // Log user not found
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Step 2: Check if the password matches
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.error("❌ Incorrect password for user:", email); // Log incorrect password
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Step 3: Generate JWT token
    try {
      generateToken(user._id, res);
    } catch (error) {
      console.error("❌ JWT token generation failed:", error.message); // Log error if token generation fails
      return res.status(500).json({ message: "Internal Server Error during token generation" });
    }

    // Step 4: Send response
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message); // Log any other unexpected error
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body; // base64 string

    let uploadedImage;
    if (profilePic) {
      uploadedImage = await cloudinary.uploader.upload(profilePic, {
        folder: "chat-app/profiles",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: uploadedImage?.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Check Auth Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
