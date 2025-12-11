import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ============== SIGNUP CONTROLLER ==============
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ 
      success: false, 
      message: "User already exists with this email" 
    });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create new user
  const user = new User({ 
    name, 
    email, 
    password: hashedPassword 
  });
  
  // Save user to database
  await user.save();
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }
  );
  
  // Return success response
  return res.status(201).json({ 
    success: true, 
    message: "User registered successfully",
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email 
    } 
  });
};

// ============== LOGIN CONTROLLER ==============
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: "User not found with this email" 
    });
  }
  
  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid email or password" 
    });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }
  );
  
  // Return success response
  return res.json({ 
    success: true, 
    message: "Login successful",
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email 
    } 
  });
};

// ============== CHANGE PASSWORD CONTROLLER ==============
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;
  
  // Find user by ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: "User not found" 
    });
  }
  
  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ 
      success: false, 
      message: "Current password is incorrect" 
    });
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update password
  user.password = hashedPassword;
  await user.save();
  
  return res.json({ 
    success: true, 
    message: "Password changed successfully" 
  });
};

// ============== FORGOT PASSWORD CONTROLLER ==============
export const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: "Email and new password are required" 
    });
  }
  
  // Validate password strength
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      success: false, 
      message: "Password must be at least 8 characters long" 
    });
  }
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ 
      success: false, 
      message: "No account found with this email" 
    });
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update password
  user.password = hashedPassword;
  await user.save();
  
  return res.json({ 
    success: true, 
    message: "Password reset successfully. Note: In production, implement email verification before allowing password reset." 
  });
};

export default {
  signup,
  login,
  changePassword,
  forgotPassword
};
