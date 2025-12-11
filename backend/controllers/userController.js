import User from "../models/User.js";

// ============== GET ALL USERS CONTROLLER ==============
export const getAllUsers = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  
  // Build filter
  let filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  
  // Calculate skip
  const skip = (page - 1) * limit;
  
  // Find users with pagination
  const users = await User.find(filter)
    .select("-password")
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await User.countDocuments(filter);
  
  return res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

// ============== GET USER BY ID CONTROLLER ==============
export const getUserById = async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id).select("-password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  
  return res.json({
    success: true,
    data: user
  });
};

// ============== UPDATE USER CONTROLLER ==============
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  // Find and update user
  const user = await User.findByIdAndUpdate(
    id,
    { name, email },
    { new: true, runValidators: true }
  ).select("-password");
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  
  return res.json({
    success: true,
    message: "User updated successfully",
    data: user
  });
};

// ============== DELETE USER CONTROLLER ==============
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findByIdAndDelete(id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  
  return res.json({
    success: true,
    message: "User deleted successfully"
  });
};

// ============== GET CURRENT USER CONTROLLER ==============
export const getCurrentUser = async (req, res) => {
  const userId = req.user.userId;
  
  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  
  return res.json({
    success: true,
    data: user
  });
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser
};
