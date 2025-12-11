// controllers/userController.js
import { User } from "../models/User.js";
import { isValidObjectId } from "../utils/validateObjectId.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// GET /api/v1/users
export const getUsers = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    role = "All",
    status = "All",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (currentPage - 1) * perPage;

  const filter = {};

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }

  if (role && role !== "All") {
    filter.role = role;
  }

  if (status && status !== "All") {
    filter.status = status;
  }

  // ensure stable sort (include _id)
  const sortField = ["name", "email", "createdAt"].includes(sortBy)
    ? sortBy
    : "createdAt";

  const order = sortOrder === "asc" ? 1 : -1;
  const sortOption = { [sortField]: order, _id: 1 };

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(perPage)
      .select("-password"),
  ]);

  const totalPages = Math.max(Math.ceil(total / perPage) || 1, 1);

  return res.json({
    success: true,
    users: users.map(sanitizeUser),
    total,
    page: currentPage,
    totalPages,
  });
};

// PUT /api/v1/users/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  const allowedFields = ["name", "email", "role", "status"];
  const updates = {};

  for (const key of allowedFields) {
    if (key in req.body) {
      updates[key] = req.body[key];
    }
  }

  if (updates.email) {
    updates.email = updates.email.toLowerCase();
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Avoid demoting yourself accidentally from admin in UI weirdness
  if (user._id.toString() === req.user.id && updates.role && updates.role !== "admin") {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own role away from admin",
    });
  }

  Object.assign(user, updates);
  await user.save();

  return res.json({
    success: true,
    message: "User updated successfully",
    user: sanitizeUser(user),
  });
};

// DELETE /api/v1/users/:id
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  if (id === req.user.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot delete your own account from this endpoint",
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  await user.deleteOne();

  return res.json({
    success: true,
    message: "User deleted successfully",
  });
};
