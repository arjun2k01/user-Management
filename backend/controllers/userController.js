import User from "../models/User.js";

export const getUsers = async (req, res) => {
  const {
    page = 1,
    limit = 5,
    search = "",
    role = "All",
    status = "All",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filters = {};

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role !== "All") {
    filters.role = role;
  }

  if (status !== "All") {
    filters.status = status;
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [users, total] = await Promise.all([
    User.find(filters)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filters),
  ]);

  res.json({
    users,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    total,
  });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role, status } = req.body;

  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (status !== undefined) user.status = status;

  await user.save();

  res.json({ user });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    const err = new Error("You cannot delete your own account");
    err.statusCode = 400;
    throw err;
  }

  const result = await User.findByIdAndDelete(id);
  if (!result) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({ message: "User deleted" });
};
