/**
 * Middleware to validate task creation input
 */
exports.validateTaskCreate = (req, res, next) => {
  const { title, description } = req.body;

  if (title === undefined || title === null) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title must be a non-empty string" });
  }

  if (description !== undefined && description !== null && typeof description !== "string") {
    return res.status(400).json({ message: "Description must be a string" });
  }

  next();
};

/**
 * Middleware to validate task update input
 */
exports.validateTaskUpdate = (req, res, next) => {
  const { title, description, status } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Title must be a non-empty string" });
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ message: "Description must be a string" });
    }
  }

  if (status !== undefined) {
    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'pending' or 'completed'" });
    }
  }

  next();
};
